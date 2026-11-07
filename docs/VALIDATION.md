# Verifiche del branch hiring

6 novembre 2026.

- Build Vite e generazione HTML per accesso diretto ai due nuovi percorsi: superate.
- TypeScript: superato con `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 5.0`. La configurazione preesistente usa 6.0, non supportato dal TypeScript 5.x installato.
- Lint dei file frontend modificati: superato disabilitando solo `@typescript-eslint/no-unused-expressions`, regola che provoca un crash nella combinazione ESLint/plugin già presente. Il lint globale standard resta bloccato da tale incompatibilità.
- Test Node: schema, privacy obbligatoria/consenso futuro facoltativo, LinkedIn, limite e parsing PDF, retention su anno bisestile; HTTP su servizio chiuso e CORS senza credenziali cloud.
- Controlli sintattici backend e controllo whitespace Git eseguiti.
- Docker Desktop installato ma motore Linux non avviato: build/esecuzione container e ClamAV non provati localmente. Workflow CI predisposto per build container, da controllare dopo push.
- Google Cloud, SMTP e flusso completo con CV: non eseguiti; risorse e credenziali da configurare successivamente come richiesto. Checklist dettagliata nel runbook.
- Dipendenze backend aggiornate alle versioni correnti disponibili; audit segnala ancora sei avvisi moderati transitivi nella catena Google Cloud (`glob`/`minimatch`). Non sono stati applicati override forzati senza verifica. La landing esistente segnala 23 avvisi (6 moderati, 17 alti); aggiornamento generale fuori da questa modifica. Ricontrollare prima dell’attivazione.

Non dichiarare queste verifiche equivalenti a collaudo produzione, validazione legale o revisione di sicurezza completa. La raccolta rimane disabilitata.
