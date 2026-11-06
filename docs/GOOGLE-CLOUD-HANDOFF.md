# Ripresa del lavoro su Google Cloud — hiring Stele

Stato: predisposizione nel branch, nessuna risorsa creata. Eseguire prima in staging con CV sintetici. Non usare bucket SprintAct o pubblici. I comandi sono esempi Bash per Cloud Shell, da completare con i valori aziendali; non contengono credenziali.

## 1. Decisioni richieste

Confermare PROJECT_ID, billing, regione UE (proposta `europe-west8`, verificare disponibilità dei servizi), nome bucket globalmente unico, dominio API, operatori recruiter, SMTP verificato, durata selezione corrente e privacy definitiva. Firestore Native in database dedicato al progetto hiring è la proposta; il codice usa il database `(default)`.

## 2. Risorse e bucket

```bash
export PROJECT_ID="REPLACE_PROJECT_ID"
export REGION="europe-west8"
export CV_BUCKET="REPLACE_GLOBALLY_UNIQUE_PRIVATE_BUCKET"
gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com storage.googleapis.com firestore.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com cloudscheduler.googleapis.com
gcloud iam service-accounts create hiring-api
gcloud iam service-accounts create hiring-maintenance
gcloud iam service-accounts create hiring-scheduler
gcloud storage buckets create "gs://$CV_BUCKET" --location="$REGION" --uniform-bucket-level-access
gcloud storage buckets update "gs://$CV_BUCKET" --public-access-prevention --no-versioning --clear-soft-delete
```

In console: verificare Public Access Prevention enforced, accesso uniforme, versioning e soft delete disabilitati, nessuna retention lock, nessuna configurazione pubblica/CORS/CDN. Upload via API: non serve CORS sul bucket. Standard storage e cifratura Google-managed iniziali; CMEK solo se richiesta e con piano accessi/rotazione.

Creare Firestore Native nella regione concordata, impostare regole client deny-all: solo server IAM. Abilitare TTL sul campo `expiresAt` del collection group `hiringQuotas`, mai su `applications`. Backup/PITR disabilitati per questa prima proposta; se richiesti, definire cancellazione prima del lancio.

## 3. IAM

| Identità | Accesso richiesto |
|---|---|
| hiring-api | Bucket dedicato: objects.create e objects.get; Firestore lettura/scrittura transazioni; accesso al solo segreto quota |
| hiring-maintenance | Bucket dedicato: objects.list/get/delete; Firestore read/update/delete; segreti SMTP |
| hiring-scheduler | Esecuzione del solo Job, non lettura CV |
| Recruiter autorizzati | Lettura oggetti bucket e metadati Firestore, MFA; niente accesso pubblico |
| Operatore privacy | Cancellazione/modifica strettamente necessaria, verificata e auditata |

Creare custom roles per i permessi elencati e binding a bucket/database dedicati. `roles/datastore.user` è una possibile semplificazione iniziale nel solo progetto hiring; valutare e restringere prima del go-live. Non concedere Editor/Owner ai runtime. Nessuna chiave service account scaricata: usare service identity e ADC.

## 4. Segreti e build

Creare Secret Manager secrets per RATE_LIMIT_SECRET (casuale ad alta entropia), SMTP_USER e SMTP_PASSWORD; concedere secretAccessor solo sulle versioni necessarie. Mai valori nei file `.env` committati o variabili VITE. SMTP_HOST, SMTP_PORT, NOTIFICATION_FROM sono configurazioni non segrete; il destinatario è fisso `info@stele.it.com`. Verificare SPF/DKIM/DMARC e invio dal provider prima di aprire.

```bash
gcloud artifacts repositories create hiring --repository-format=docker --location="$REGION"
export IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/hiring/api:v1"
# Dalla cartella server della repository:
gcloud builds submit --tag "$IMAGE" .
```

Dockerfile installa ClamAV; all’avvio freshclam scarica le definizioni. Verificare egress verso mirror ClamAV, permessi di scrittura e startup probe/timeout sufficienti, CPU/memoria. Le richieste falliscono se definizioni più vecchie di due giorni: predisporre refresh/ridistribuzione almeno giornaliero e alert, oppure gestire un servizio scanner aggiornato prima del lancio. Non disattivare la scansione per risolvere errori di deploy. La build Docker e il funzionamento antivirus devono essere provati sul cloud.

## 5. Cloud Run API

Creare servizio dall’immagine, service account hiring-api, memoria iniziale 2 GiB, concorrenza 1, timeout 120 secondi, max instances iniziale 3; adattare dopo test. Configurare le variabili in `server/.env.example` e i segreti come riferimenti Secret Manager. Mantenere HIRING_ENABLED=false e LEGAL_APPROVED=false.

Il servizio accetta candidature anonime, ma non offre lettura CV o manutenzione. Per produzione usare HTTPS Load Balancer con serverless NEG, dominio API e Cloud Armor/rate limiting; limitare ingress a internal-and-cloud-load-balancing per impedire accesso diretto al run.app. Configurare invocazione pubblica solo per l’API, mai per il Job. `ALLOWED_ORIGIN=https://stele.it.com`, nessun wildcard. Provare preflight, multipart e invii da browser.

Il limite distribuito nel codice non identifica in modo affidabile IP reali dietro tutti i proxy: verificare comportamento Cloud Run e affidare il limite per IP al front door verificato. Nessun affidamento a X-Forwarded-For fornito liberamente dal client. Impostare anche quote globali e budget.

## 6. Job privato e scheduler

Creare Cloud Run Job con la stessa immagine, command `node`, args `maintenance.mjs`, service account hiring-maintenance, task count 1, parallelism 1. Non usa freshclam perché non riceve upload. Passare CV_BUCKET, SMTP e segreti; stessa regione/progetto dell’API. Eseguirlo manualmente con dati sintetici, poi programmare ogni ora via Cloud Scheduler autenticato OAuth all’API di esecuzione Run Jobs, con hiring-scheduler autorizzato al solo job. Evitare esecuzioni sovrapposte; timeout e retry inferiori all’intervallo, alert se un’esecuzione resta attiva o fallisce.

Il job cancella scaduti, invia notifiche pendenti e rimuove orfani oltre 24 ore. La cancellazione precede l’email. Le email sono almeno una volta, possibili duplicati dopo crash; nessun CV allegato. Un errore blocca l’esecuzione e richiede retry/alert; non lasciare il job senza monitoraggio.

## 7. Procedure operatore

Per consultare: entrare con account aziendale MFA in Firestore, cercare riferimento della notifica, poi accedere al relativo oggetto nel bucket. Non condividere link con token, non copiare dati in strumenti personali. Verificare expiresAt prima di scaricare. La console è il percorso iniziale; un portale recruiter è fuori perimetro.

Rifiuto o richiesta di cancellazione verificata: cancellare oggetto `objectPath`, poi record Firestore; verificare assenza di copie/versioni/esportazioni e documentare l’esito senza duplicare dati personali. Revoca consenso futuro con selezione aperta: impostare futureConsent=false, futureConsentAt=null e expiresAt alla scadenza corrente calcolata da createdAt; se già trascorsa o selezione conclusa cancellare. Non prolungare automaticamente la conservazione.

## 8. Verifiche e attivazione

Usare checklist `HIRING-SPEC.md`: CV reale, limiti, file falso/cifrato/malware in ambiente isolato, retry/concorrenza, errore storage/database/SMTP, scadenza/revoca/cancellazione, bucket anonimo 403, account non autorizzato 403, origine browser, assenza dati nei log. Verificare request log Cloud Run (possono contenere IP), audit log accessi e relativa durata; impostare retention minima motivata e accessi ristretti.

Creare alert su errori API/scanner, job falliti, outbox pendente, cancellazioni in ritardo e budget. Assegnare proprietario operativo e canale incidenti. Approvare privacy HTML IT/EN/PDF, annuncio definitivo, jobVersion/privacyVersion coerenti client/server e CURRENT_RETENTION_DAYS. Solo dopo queste verifiche impostare entrambi i flag true.

Frontend: build con VITE_HIRING_API_URL al dominio definitivo e deploy statico con procedura repository. Verificare refresh su `/lavora-con-noi/` e `/privacy-candidati/`. Rollback: chiudere API, ripristinare frontend/revisione precedente; mantenere cancellazione schedulata. Nessun restore deve ripristinare candidature già cancellate.

## Fonti tecniche ufficiali

- [Accesso uniforme IAM](https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access)
- [Public Access Prevention](https://docs.cloud.google.com/storage/docs/public-access-prevention)
- [Creazione bucket e opzioni soft delete](https://docs.cloud.google.com/storage/docs/creating-buckets)
- [Identità servizio Cloud Run](https://docs.cloud.google.com/run/docs/securing/service-identity)
- [Sicurezza Cloud Run](https://docs.cloud.google.com/run/docs/securing/security)

Verificare flag e policy con la versione gcloud disponibile prima di eseguire; nessun comando deve essere indirizzato a risorse preesistenti di SprintAct.
