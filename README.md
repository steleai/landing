# Stele Landing Page

Landing page ufficiale di **Stele**, startup legal tech AI-native focalizzata sul mercato italiano.

Il sito presenta la società in ottica company-first e introduce **SprintAct** come prima linea di prodotto per la ricerca legale (dominio dedicato: `sprintact.eu`).

## Posizionamento

Stele costruisce strumenti AI affidabili per il settore legale italiano, con focus su:

- accessibilità dei dati istituzionali e normativi
- verificabilità delle fonti
- utilità operativa per professionisti, aziende e istituzioni

## Struttura della pagina

La landing è organizzata in sezioni narrative:

- `Hero` (company statement + CTA SprintAct)
- `Research` (paper, case study, note metodologiche)
- `Products` (SprintAct: preciso, veloce, versatile)
- `Developers / GitHub` (materiali aperti per developer)
- `Mission`
- `Team`
- `Contact`
- `Footer`

## Localizzazione (IT/EN)

Le traduzioni sono centralizzate in:

- `src/contexts/LanguageContext.tsx`

Comportamento lingua:

1. Se esiste una lingua salvata in `localStorage`, viene usata quella.
2. Altrimenti viene letta la lingua del browser (`navigator.languages` / `navigator.language`).
3. Supporto attuale: `it`, `en`.
4. Fallback di default: **italiano**.

## Tema e UX

- Supporto **light/dark mode**
- Navbar fissa con smooth-scroll alle sezioni
- Pattern grafico esteso su tutta la pagina in dark mode
- Bottone "back to top" in basso a sinistra

## Stack tecnico

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (componenti UI)
- EmailJS (form contatti)

## Sviluppo locale

Prerequisiti consigliati:

- Node.js 18+
- npm

Installazione e avvio:

```bash
npm install
npm run dev
```

Build di produzione:

```bash
npm run build
```

Preview build locale:

```bash
npm run preview
```

## Deploy su GitHub Pages

Questo progetto è configurato per deploy via `gh-pages`.

Comando unico:

```bash
npm run deploy
```

Flusso:

1. `predeploy` esegue `npm run build`
2. `deploy` pubblica `dist` sul branch `gh-pages`

## Contatti e social

- Form contatti integrato con EmailJS in `src/components/ContactSection.tsx`
- Alcuni social possono essere temporaneamente nascosti/commentati in attesa di aggiornamento contenuti

## Dove aggiornare i contenuti

- Copy e traduzioni: `src/contexts/LanguageContext.tsx`
- Composizione pagina: `src/pages/Index.tsx`
- Sezioni: `src/components/*Section.tsx`
- Navbar: `src/components/Navbar.tsx`
