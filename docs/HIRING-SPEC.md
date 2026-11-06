# Stele hiring — specifica di progettazione e implementazione

Versione 0.1, 6 novembre 2026. Stato: implementazione su `feat/hiring-page`, raccolta disabilitata; configurazione Google Cloud da eseguire successivamente. Questo documento distingue decisioni confermate, scelte tecniche e blocchi al rilascio.

## 1. Fonti e prevalenza

- Repository verificata: [steleai/landing](https://github.com/steleai/landing), React 18, TypeScript, Vite, Tailwind, React Router e contesto lingua IT/EN. Il CNAME è `stele.it.com`; il comando deploy usa GitHub Pages. Backend hiring separato da SprintAct e dal modulo EmailJS esistente.
- `public/hiring/legal-product-specialist.provisional.it.pdf`: PDF originale provvisorio, due pagine, recuperato dalla conversazione “Brainstorming Pagina Hiring”.
- `public/hiring/privacy.provisional.it.pdf`: informativa originale provvisoria, due pagine, stessa provenienza. Non è una versione legalmente approvata.
- Decisioni finali dell’utente prevalgono sulle bozze: CV obbligatorio (LinkedIn non lo sostituisce), scadenza da definire (il 20 novembre 2026 nel PDF è superato), lavoro principalmente remoto, future opportunità facoltative fino a 24 mesi, notifiche a `info@stele.it.com`, IT/EN, GCS privato e Cloud Run.

I PDF restano immutati per tracciabilità; il testo visibile segnala la natura provvisoria e la scadenza aggiornata. Prima del lancio sostituire insieme PDF e contenuti web. Nessun contenuto provvisorio deve diventare definitivo semplicemente impostando una variabile.

## 2. Obiettivi e perimetro

Sezione hiring permanente, inizialmente con Legal Product Specialist. Percorso candidato: lettura delle condizioni, consultazione privacy, compilazione breve, upload CV, conferma dopo persistenza, riferimento candidatura. Preparare nuove posizioni con identificativo e versione dedicati; al momento niente candidature spontanee, account candidato, ranking automatico o ATS completo.

La configurazione e la creazione delle risorse cloud saranno effettuate in una fase successiva lato Google Cloud seguendo `GOOGLE-CLOUD-HANDOFF.md`. Nessuna risorsa cloud viene creata da questa implementazione.

## 3. UX, contenuti e accessibilità

URL: `/lavora-con-noi/`, `/privacy-candidati/`. Link nel menu desktop/mobile e footer. Stessa lingua della landing, stessi colori, font, bordi, componenti e tema chiaro/scuro. HTML statici per entrambi i percorsi consentono accesso diretto e refresh su GitHub Pages; asset con percorsi assoluti.

Gerarchia: introduzione Stele; titolo ruolo; remoto e impegno; condizioni economiche subito visibili; responsabilità; profilo; proposta; evoluzione; processo; PDF; modulo. Layout a colonna su mobile e due colonne per responsabilità/profilo su desktop. Titoli gerarchici, etichette associate, tastiera, messaggi con ruoli status/alert, contrasto e zoom da verificare in preview. Nessuna promessa di compenso o equity già acquisita.

Contenuti dalla bozza: collaborazione professionale autonoma, circa un giorno/settimana iniziale; confronto con founder; analisi workflow, test e valutazioni AI/ricerca, benchmark e contenuti editoriali; esperienza forense e attitudine imprenditoriale. Work for Equity senza compenso monetario iniziale; 5% su quattro anni, cliff sei mesi, maturazione mensile; eventuali due punti ulteriori non automatici; diluizione, rischio, base di calcolo e condizioni affidate agli accordi. Possibile Legal Product Lead senza poteri amministrativi. Eventuale pilota formalizzato prima dell’inizio, distinto dalle prove di selezione.

Il testo inglese dell’annuncio è una traduzione di lavoro; i PDF disponibili sono italiani e il link lo dichiara. L’informativa HTML completa IT/EN e il PDF ufficiale sono un blocco al lancio: la pagina privacy attuale è un avviso provvisorio con link alla fonte, non una sostituzione dell’informativa completa.

### Modulo

| Campo | Regola |
|---|---|
| Nome e cognome | Obbligatorio, 2–120 caratteri |
| Email | Obbligatoria, valida, massimo 254 |
| LinkedIn | Facoltativo e consigliato, HTTPS linkedin.com, massimo 500 |
| Motivazione | Facoltativa, massimo 2000 |
| CV | Un PDF obbligatorio, massimo 5 MiB |
| Presa visione privacy | Obbligatoria, distinta dal consenso |
| Future opportunità | Checkbox non preselezionata e facoltativa, massimo 24 mesi dalla candidatura |

Niente dati sanitari, età, sesso, foto richiesta, indirizzo o categorie protette nel modulo. Invito a omettere dati sensibili non necessari. La versione definitiva deve chiarire come trattare informazioni particolari eventualmente incluse spontaneamente nel CV.

Stati: non aperto/configurazione mancante; disponibile; invio con pulsante disabilitato; successo con riferimento; errore con dati conservati per riprovare. Nessun salvataggio di CV o dati personali in localStorage. La chiave di idempotenza resta in memoria e viene riutilizzata dopo errore; nuova sessione può produrre una nuova candidatura.

## 4. Architettura

```mermaid
flowchart LR
  C[Candidato] --> F[Landing statica IT/EN]
  F --> A[Cloud Run API pubblica limitata]
  A --> V[Validazione PDF e ClamAV]
  V --> B[Bucket GCS privato]
  A --> D[Firestore metadati e outbox]
  S[Cloud Scheduler autenticato] --> J[Cloud Run Job privato]
  J --> D
  J --> B
  J --> E[SMTP aziendale]
  E --> N[info@stele.it.com]
  R[Recruiter autorizzati con MFA] --> B
  R --> D
```

Upload multipart attraverso Cloud Run, non URL di upload pubblici. File in memoria e cartella temporanea per scansione, poi cancellata. PDF riconosciuto da estensione, MIME, firma e parsing; limite anche sul server; antivirus prima dell’archiviazione. Errori scanner o definizioni vecchie bloccano l’invio. Scanner non garantisce l’assenza di ogni contenuto attivo: aprire CV con viewer aggiornati, scaricamento come allegato, nessun rendering sul dominio pubblico.

Firestore è una scelta tecnica proposta per metadati e transazioni, non una risorsa già disponibile. Email tramite SMTP server-side: fornitore da scegliere, credenziali Secret Manager. Notifica senza CV, nome, email candidato o link bearer; solo riferimento. Recruiter usano inizialmente console GCP con account autorizzati, non un pannello pubblico. Nessuna ricevuta email al candidato in questa versione: conferma sullo schermo; eventuale ricevuta è un’estensione da decidere.

## 5. Contratto API

| Endpoint | Accesso | Risultato |
|---|---|---|
| `GET /healthz` | Pubblico | 200, processo attivo; non prova disponibilità cloud |
| `GET /v1/hiring` | Pubblico | 200 `{ "open": false }` oppure true |
| `POST /v1/applications` | Pubblico con quota e controlli | multipart, header `Idempotency-Key` UUID |

Campi POST: `name`, `email`, `linkedin`, `motivation`, `locale` (`it`/`en`), `privacyAcknowledged` (`true`), `privacyVersion` (`candidate-privacy-v1`), `futureConsent` (`true`/`false`), `cv`. Campi estranei rifiutati. Posizione e versione annuncio determinate dal server, non dal candidato.

Successo: 201 `{ "applicationId": "<riferimento opaco>" }`; retry identico già persistito: 200. Riuso della stessa chiave con payload diverso: 409. Errori: 400 campi/PDF/upload; 413 troppo grande; 403 origine non consentita; 410 annuncio chiuso; 429 quota; 503 configurazione o infrastruttura/scanner non disponibile. Nessuno stack trace o dato personale in risposta.

Il successo avviene solo dopo CV e metadati persistiti; la notifica è asincrona. Una scansione può far durare la richiesta: timeout Cloud Run suggerito 120 s. Il file usa creazione condizionata, digest associato e confronto per impedire collisioni di retry concorrenti. GCS e Firestore non hanno transazione comune: orfani ripuliti dopo 24 ore; retry recupera upload persistito. Test di concorrenza nel cloud richiesto.

## 6. Modello dati

`applications/{sha256(idempotencyKey)}` contiene nome, email, LinkedIn, motivazione, locale, roleId, jobVersion, privacyVersion, privacyAcknowledged, futureConsent booleano, futureConsentAt nullable, createdAt, expiresAt, objectPath, digest, status e notification (`pending`/`sent`), notifiedAt. Timestamp UTC determinati dal server. CV in `applications/{id}/cv.pdf`, nomi originali non archiviati; metadata GCS includono digest della submission. Nessun nome/email nel percorso.

`hiringQuotas/{HMAC(giorno, indirizzo connessione)}`: count e expiresAt di 24 ore. TTL Firestore solo su questa collezione. La quota attuale usa il peer di rete senza fidarsi di header client: dietro proxy GCP può raggruppare utenti; configurare e verificare un limite edge per IP reale prima del lancio. CORS limita browser consentiti, non autentica e non sostituisce antiabuso.

## 7. Sicurezza e GDPR

Bucket dedicato, accesso uniforme IAM, Public Access Prevention enforced; niente `allUsers`, ACL, CDN, signed URL o CV via email. Account servizio distinti per API e manutenzione; privilegi limitati al bucket dedicato e al database hiring. Identity GCP tramite credenziali ambientali, nessuna chiave JSON nel repository. SMTP e segreto quota da Secret Manager. HTTPS obbligatorio, CORS sull’origine esatta; nessun cookie o sessione candidato.

Base giuridica proposta per dati ordinari della selezione corrente: misure precontrattuali richieste dal candidato, da confermare nella versione ufficiale. Future opportunità: consenso distinto e revocabile. Presa visione non equivale a consenso. L’art. 6 non basta per dati particolari: valutazione specifica art. 9 e condizioni nazionali applicabili. Non usare il consenso futuro per giustificare tutti i trattamenti.

La bozza privacy va armonizzata: §3 include ruoli futuri sotto misure precontrattuali, §8 richiede consenso; §2 e §5 elencano dati e obbligatorietà troppo ampi rispetto al modulo; fornitori, ubicazione, trasferimenti e tempi devono corrispondere all’infrastruttura effettiva. Titolare e dati societari dalla bozza, da confermare. Informare su diritti, revoca, reclamo, destinatari, trasferimenti e assenza di selezione automatizzata. Accordi art. 28 con fornitori e verifica dei trasferimenti anche scegliendo regione UE.

Richieste a info@stele.it.com: verificare identità con mezzi proporzionati; reperire candidature, esportare se dovuto, correggere o cancellare. Nessuna API pubblica di lettura/eliminazione per semplice riferimento. Recruiter istruiti, MFA, audit accessi, revisione autorizzazioni. Log applicativi senza payload, CV, email, IP grezzo o segreti; verificare anche i request log gestiti da GCP e la loro retention.

Riferimento normativo: [GDPR, testo ufficiale](https://eur-lex.europa.eu/eli/reg/2016/679/oj), in particolare principi, basi, trasparenza e diritti. Questa specifica richiede approvazione legale, non attesta conformità automatica.

## 8. Conservazione e cancellazione

- Selezione corrente senza consenso futuro: `CURRENT_RETENTION_DAYS` è un tetto tecnico obbligatorio ma da definire; cancellare anticipatamente dopo esito negativo secondo informativa. Non inventare una durata.
- Consenso futuro: scadenza a 24 mesi di calendario dall’invio, senza rinnovo automatico. Gestione del 29 febbraio inclusa. Revoca: disattivare uso futuro; se selezione attuale ancora aperta, impostare scadenza corrente calcolata dall’invio, altrimenti cancellare.
- Job orario: prima CV poi metadati; fallimento lascia record per retry. Obiettivo cancellazione entro un’ora dalla scadenza, subordinato al monitoraggio del job. L’accesso degli operatori deve rispettare la scadenza anche in caso di job in ritardo.
- Nessun TTL sui record applicazioni: cancellerebbe il riferimento al CV prima della pulizia coordinata. Nessuna retention lock del bucket.
- Soft delete e versioning del bucket disabilitati nella configurazione proposta per non mantenere copie oltre i termini. Se si scelgono backup/PITR/soft delete, definire durata, accessi, informativa e gestione ripristini prima del lancio; evitare riapparizione di dati cancellati.
- Export, download recruiter e copie casella email sono soggetti alla stessa policy. Notifiche minimizzate; eliminare riferimenti secondo policy interna. L’assunzione non autorizza conservazione indefinita: eventuale passaggio ad archivio personale con informativa separata.

## 9. Deployment e operazioni

Seguire il runbook cloud. Ambienti staging e produzione separati; staging solo dati sintetici. API e Job con medesima immagine, entrypoint diversi; definitions ClamAV aggiornate prima di avvio API e rifiuto dopo due giorni, con ridistribuzione pianificata o aggiornamento database gestito per istanze longeve. Memoria almeno 2 GiB da validare, concorrenza 1 iniziale, max instances limitato e budget/alert. Job singolo non sovrapposto, pagina di monitoraggio errori e fallimenti scanner/notifica/cancellazione.

Outbox SMTP: retry orario, consegna almeno una volta; crash dopo invio e prima dell’update può duplicare notifica. Message-ID stabile facilita deduplicazione ma non garantisce exactly once. Job seriale può fermarsi su singolo errore: alert e riesecuzione necessari; verificare SMTP prima del lancio. Nessuna perdita della candidatura se SMTP non disponibile.

Frontend: impostare `VITE_HIRING_API_URL` in build, `npm ci && npm run build`, controllare cartelle statiche, deploy con procedura esistente. `main` non va modificato direttamente. Rollback frontend a commit precedente, API chiusa impostando HIRING_ENABLED=false; mantenere job di cancellazione attivo durante rollback. Rollback non deve ripristinare dati cancellati.

## 10. Test e accettazione

Automatizzati nel branch: build Vite, TypeScript, test Node per schema, PDF reali/corrotti/rinominati/oversize, consenso e mesi di calendario. Controllo lint separando errori preesistenti da nuovi. Cloud/SMTP/scanner non simulano prova end-to-end: eseguirla nello staging.

Checklist obbligatoria prima del rilascio:

- [ ] Percorsi diretti e refresh su hosting statico; menu e footer desktop/mobile (anche 768–1023 px); lingua e tema persistenti.
- [ ] IT/EN completo, privacy HTML/PDF ufficiali allineati e versionati, scadenza definitiva o esplicita assenza di scadenza concordata.
- [ ] Tastiera, focus, lettore schermo, zoom 200%, iOS/Android e browser desktop, errori senza perdita input.
- [ ] CV obbligatorio anche con LinkedIn, consenso futuro non richiesto/non preselezionato, PDF 5 MiB limite lato client/server.
- [ ] PDF valido accettato; file falso, corrotto, cifrato, malware EICAR in ambiente isolato e definizioni antivirus obsolete rifiutati.
- [ ] Retry identico unico record; stessa chiave payload differente 409; concorrenza e upload salvato con Firestore indisponibile verificati.
- [ ] Storage mai leggibile anonimamente; account recruiter e servizi con accessi verificati; segreti assenti dai bundle.
- [ ] SMTP indisponibile non perde candidature; job successivo invia solo notifiche pendenti; test duplicazione documentato.
- [ ] Cancellazione su scadenza, rifiuto, revoca e richiesta verificata; nessun residuo in bucket/versioni/backup; cleanup orfani.
- [ ] Rate limit reale edge, nessun bypass diretto; log minimizzati; budget/alert e gestione incidenti assegnati.
- [ ] Privacy e durata selezione approvate, bucket/Firestore/regione/SMTP configurati, HIRING_ENABLED e LEGAL_APPROVED attivati solo dopo verifica.

## 11. Piano PR e punti aperti

PR iniziale: pagina bilingue, documenti provvisori, percorsi statici, servizio Cloud Run disattivato, test e runbook. PR successiva di attivazione: testi ufficiali IT/EN, versioni, durata, infrastruttura effettiva, prove staging e monitoraggio. Nessun merge/deploy implicito.

Punti aperti bloccanti: annuncio ufficiale; informativa completa e basi giuridiche; durata selezione; data di chiusura o scelta esplicita di annuncio aperto; progetto GCP/billing/regione; identità recruiter e responsabile privacy; fornitore SMTP e mittente verificato; Cloud Armor/edge antiabuso; definizioni scanner aggiornate; verifica container e test cloud. Migliorie successive: drag/drop con rimozione file, portale recruiter, ricevuta candidato, nuovi ruoli. Queste migliorie non sono presentate come già implementate.
