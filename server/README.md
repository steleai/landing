# Stele hiring API

Backend delle candidature di `https://stele.it.com/lavora-con-noi/` e del form contatti della home. L'infrastruttura
(Cloud Run, job, Scheduler, IAM, secret) è gestita da Terraform in
`steleai/sprintact-infrastructure` (`docs/stele-hiring.md`). Questo servizio non usa
database né SMTP: i dati stanno nel bucket privato e le notifiche passano dall'API Resend.

```
GitHub Pages → Cloud Run API (index.mjs) → bucket privato
                                        └→ Resend → info@stele.it.com
Cloud Scheduler → Cloud Run Job (maintenance.mjs) → bucket + Resend
```

## Contratto HTTP

| Endpoint | Risposta |
| --- | --- |
| `GET /healthz` | `200 {"ok":true}` |
| `GET /v1/hiring` | `200 {"open":boolean}` |
| `POST /v1/applications` | multipart con `Idempotency-Key` (UUID) |
| `POST /v1/contact` | JSON con `Idempotency-Key` (UUID), vedi [Form contatti](#form-contatti) |

Campi: `name`, `email`, `linkedin`, `motivation`, `locale`, `privacyAcknowledged`,
`privacyVersion`, `futureConsent` e il file `cv`. Il frontend imposta soltanto
`VITE_HIRING_API_URL`.

Esiti:
- `201 {applicationId}`: nuova candidatura;
- `200 {applicationId}`: retry identico;
- `409`: stessa chiave con contenuto diverso;
- `400`: campi, PDF o antivirus;
- `413`: PDF oltre 5 MiB;
- `403`: origine non ammessa;
- `410`: scadenza superata;
- `429`: limite giornaliero;
- `503`: chiuso, configurazione incompleta, scanner o storage non disponibili.

## Archiviazione

```
applications/<id>/cv.pdf            PDF, creato una sola volta
applications/<id>/application.json  record immutabile: è il commit
quota/<YYYY-MM-DD>.json             contatore giornaliero (Europe/Rome)
```

- `<id>` è lo SHA-256 della `Idempotency-Key`: i percorsi non contengono nome o email.
- Il JSON contiene:
  - dati del form;
  - consensi e versione dell'informativa;
  - `roleId` e `jobVersion`;
  - timestamp server e scadenza;
  - digest, SHA-256 e generazione del PDF.
- La candidatura risulta ricevuta solo dopo che PDF e JSON esistono.

Tutte le modifiche sono condizionate. Le creazioni usano `ifGenerationMatch=0`.
Lo stato mutabile vive nei **metadata custom** e cambia solo con
`ifMetagenerationMatch`. Lo stato mutabile comprende:
- i campi `notification*` di `application.json`;
- `lastAttemptAt` di `cv.pdf`;
- `count` della quota.

Il contenuto degli oggetti non viene mai sovrascritto.

| Operazione | API (`stele-sa-6`) | Job (`stele-sa-7`) |
| --- | --- | --- |
| `storage.objects.create` | ✔ PDF, JSON, quota | — |
| `storage.objects.get` | ✔ | ✔ |
| `storage.objects.update` (solo metadata) | ✔ | ✔ |
| `storage.objects.list` | — | ✔ |
| `storage.objects.delete` | — | ✔ |

Questi sono esattamente i ruoli custom M1. Se il codice cambia operazioni, i
permessi vanno rivisti in Terraform.

## Notifiche

- La prima email parte dopo il commit, prima della risposta, con timeout di 8 s.
  Con fatturazione a richiesta, Cloud Run riduce la CPU dopo la risposta.
- Gli errori lasciano la candidatura ricevuta e la notifica `pending`.
- Il job orario riprova le notifiche pendenti.
- L'email contiene riferimento, date e il percorso nel bucket. Non contiene CV,
  nome, email o link pubblici.

Stati in `notificationStatus`:
- `pending`;
- `sending`, con lease di 60 s;
- `sent`;
- `reconcile`;
- `failed`, dopo 50 tentativi.

Regole di invio:
- Ogni invio usa `Idempotency-Key: stele-hiring/<id>/<epoch>` e un payload
  deterministico.
- **Timeout, errori di rete o 5xx sono esiti ambigui:** si riprova con la stessa
  chiave, che Resend deduplica per 24 ore.
- Se un esito ambiguo resta irrisolto oltre 23 ore, lo stato diventa `reconcile`.
  Non c'è reinvio automatico.
- **Un rifiuto definitivo (4xx, compreso 429) garantisce che non è partito nulla:**
  l'epoch avanza e il tentativo successivo usa una chiave nuova.
- Un `409 invalid_idempotent_request` porta a `reconcile`. Succede ad esempio se
  `NOTIFICATION_FROM` è cambiato tra un tentativo e l'altro.

## Form contatti

`POST /v1/contact` con JSON `{name, email, message, locale, website}` invia una
email a `NOTIFICATION_TO` con `Reply-To` impostato sul mittente. Non salva nulla
nel bucket e non dipende da `HIRING_ENABLED`: richiede solo `RESEND_API_KEY`,
`NOTIFICATION_FROM`, `NOTIFICATION_TO` e `ALLOWED_ORIGIN`.

- `202`: inviato (o honeypot `website` compilato: scartato in silenzio);
- `400`: campi non validi o `Idempotency-Key` mancante;
- `429`: oltre 5 messaggi/ora per indirizzo o 100/ora per istanza (limite in memoria);
- `503`: Resend non configurato o invio fallito. Il frontend riprova con la
  stessa chiave (`stele-contact/<uuid>`), che Resend deduplica per 24 ore.

## Manutenzione (`node maintenance.mjs`)

Il job usa la stessa immagine, ma con command `node` e args `maintenance.mjs`:
non avvia il server e non aggiorna ClamAV. Ad ogni esecuzione:
1. cancella prima il PDF e poi il JSON delle candidature scadute. Un errore lascia
   il JSON e la run successiva completa la cancellazione;
2. riprova le notifiche pendenti non scadute;
3. segnala `reconcile` e `failed`;
4. cancella i PDF senza JSON più vecchi di 24 ore dall'ultimo tentativo. La
   cancellazione è condizionata alla metageneration letta, quindi un retry in
   corso la blocca;
5. cancella i contatori quota precedenti a ieri.

Esecuzioni sovrapposte sono sicure: cancellazioni idempotenti e lease per singola
candidatura. Il job esce con codice 1 se un elemento fallisce. Il riepilogo
`maintenance_summary` è `WARNING` se restano notifiche pendenti o da riconciliare.

## Configurazione

Vedi `.env.example`. Il form è aperto solo se valgono tutte queste condizioni (Resend è facoltativo):
- `HIRING_ENABLED=true` e `LEGAL_APPROVED=true`;
- `CV_BUCKET`, `ALLOWED_ORIGIN`, `CURRENT_RETENTION_DAYS` e
  `MAX_APPLICATIONS_PER_DAY` sono impostati;
- `DEADLINE` è assente oppure futura. Una data non valida chiude il form.

Senza `RESEND_API_KEY`, `NOTIFICATION_FROM` e `NOTIFICATION_TO` le candidature
vengono accettate e le notifiche restano `pending`: il job le invia appena Resend
è configurato, escluse le candidature già scadute. Finché Resend manca, le nuove
candidature vanno controllate direttamente nel bucket.

All'avvio il log `startup` elenca i nomi delle variabili mancanti, mai i valori.

Scadenza:
- senza consenso futuro: `createdAt + CURRENT_RETENTION_DAYS`;
- con consenso futuro: il maggiore tra 24 mesi di calendario e la scadenza corrente.

## Procedure operatore

| Operazione | Come |
| --- | --- |
| Consultare una candidatura | Console Google Cloud con account aziendale autorizzato, cartella `applications/<id>/` indicata nell'email |
| Revocare il consenso futuro | Impostare il metadata `expiresAt` di `application.json` alla scadenza della selezione corrente (`createdAt + CURRENT_RETENTION_DAYS`). Se è già passata, la run successiva cancella. Il metadata prevale sul valore nel JSON |
| Cancellazione su richiesta | Eliminare `cv.pdf`, poi `application.json` |
| `reconcile` | Cercare il riferimento nei log Resend. Se l'email è stata consegnata, impostare `notificationStatus=sent`; altrimenti rimuovere `notificationAmbiguousSince`, incrementare `notificationEpoch` e impostare `pending` |
| Chiudere il form | `HIRING_ENABLED=false` via Terraform. La manutenzione continua a cancellare gli scaduti |

## Sviluppo e rilascio

```bash
npm ci && npm test        # test con storage in memoria, nessuna credenziale
docker build -t stele-hiring-api .
```

Rilevazioni locali con l'immagine (Docker, x86_64):
- avvio con `freshclam`: circa 20 s;
- scansione di un PDF: circa 5 s;
- picco di memoria durante la scansione: circa 0,9 GiB.

Questi valori vanno rimisurati su Cloud Run.

L'immagine `stele-hiring-api` va costruita da un commit tracciato di questo
repository con Cloud Build e pubblicata nell'Artifact Registry esistente. Va poi
referenziata in Terraform tramite `@sha256`. Il contesto di build esclude `.env*`,
i test e le credenziali (`.dockerignore`).
