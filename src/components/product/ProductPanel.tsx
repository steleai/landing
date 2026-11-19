import { useLayoutEffect, useState, type CSSProperties } from 'react';
import { animate } from 'motion';
import {
  ArrowRight,
  BookOpen,
  Check,
  ExternalLink,
  FileText,
  Folder,
  Lock,
  MessageCircle,
  Scale,
  Search,
  X,
} from 'lucide-react';

/*
 * The product panel: one app frame that shows a different real view per capability.
 * The markup, the Italian text and the data are the reproduction of the real interface already approved
 * for the SprintAct landing (sprintact-mock/parts: prodotto, fascicolo, cody, fonti, brief/ui.md).
 * Nothing here is invented. The product's interface is in Italian, so these strings are not translated.
 */

/** A 0..1 progress that runs once each time the view becomes active; it is 1 (the finished picture) when motion is off. */
const useProgress = (active: boolean, enabled: boolean, seconds: number) => {
  const [p, setP] = useState(1);
  useLayoutEffect(() => {
    if (!active || !enabled) {
      if (!enabled) setP(1);
      return;
    }
    setP(0);
    const controls = animate(0, 1, { duration: seconds, ease: 'linear', onUpdate: setP });
    return () => controls.stop();
  }, [active, enabled, seconds]);
  return p;
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));
/** share of a window [a, b] of the progress that has run */
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

interface ViewProps {
  active: boolean;
  motionOn: boolean;
}

const Logo = ({ mark = false }: { mark?: boolean }) => (
  <img
    className={mark ? 'sa-logo sa-logo--mark' : 'sa-logo'}
    src={mark ? '/sprintact/logo-mark-color.svg' : '/sprintact/logo-full-color.svg'}
    alt=""
    width={mark ? 22 : 113}
    height={mark ? 25 : 23}
  />
);

/* ---------- 1. Natural-language search: the query is typed, then the results arrive ---------- */
const QUERY = 'reclamo assicurativo autorità competente';
const RESULTS = [
  { title: 'Codice delle assicurazioni private', sub: 'Art. 7 — Reclami', primary: true },
  { title: 'Regolamento sui reclami assicurativi', sub: 'Art. 4 — Gestione dei reclami' },
  { title: 'Codice del consumo', sub: 'Art. 27 — Tutela amministrativa' },
];

const SearchView = ({ active, motionOn }: ViewProps) => {
  const p = useProgress(active, motionOn, 2.8);
  const typed = Math.round(span(p, 0.08, 0.58) * QUERY.length);
  const typing = motionOn && p < 0.6;
  const shown = (i: number) => span(p, 0.62 + i * 0.1, 0.62 + i * 0.1 + 0.14);
  return (
    <>
      <div className="sa-topbar">
        <Logo />
      </div>
      <div className="pc-body">
        <div className="sa-field">
          <Search aria-hidden="true" />
          <span className="sa-q">
            {QUERY.slice(0, typed)}
            {typing && <i className="sa-caret" />}
          </span>
          <span className="sa-go">
            <ArrowRight aria-hidden="true" />
          </span>
        </div>
        <ul className="sa-results">
          {RESULTS.map((r, i) => (
            <li
              key={r.title}
              className={`sa-result${r.primary ? ' is-primary' : ''}`}
              style={{ opacity: shown(i), transform: `translateY(${(1 - shown(i)) * 8}px)` } as CSSProperties}
            >
              <span className="sa-tile">
                <Scale aria-hidden="true" />
              </span>
              <span className="sa-result__t">
                <b>{r.title}</b>
                <span>{r.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

/* ---------- 2. The case file: the source D.lgs. 209/2005 Art. 7 arrives in "Fonti salvate" ---------- */
const FascicoloView = ({ active, motionOn }: ViewProps) => {
  const p = useProgress(active, motionOn, 2.6);
  const arrived = span(p, 0.35, 0.6);
  const saved = span(p, 0.5, 0.62) * (1 - span(p, 0.88, 1));
  const count = p >= 0.5 || !motionOn ? 4 : 3;
  const Row = ({ icon, kind, children }: { icon: React.ReactNode; kind?: string; children: React.ReactNode }) => (
    <div className="sa-row">
      <span className={`sa-ico${kind ? ` is-${kind}` : ''}`}>{icon}</span>
      <span className="sa-t">{children}</span>
    </div>
  );
  const Muted = ({ children }: { children: React.ReactNode }) => <span className="sa-muted"> {children}</span>;
  return (
    <>
      <div className="sa-topbar">
        <Logo />
      </div>
      <div className="pc-body">
        <span className="sa-eyebrow sa-muted">FASCICOLO</span>
        <div className="sa-name">Reclamo assicurativo</div>
        <div className="sa-groups">
          <div className="sa-col">
            <div className="sa-group">
              <div className="sa-gh">
                <span>Documenti</span>
                <span className="sa-count">4</span>
              </div>
              <Row icon={<FileText aria-hidden="true" />} kind="pdf">Documentazione del reclamo.pdf</Row>
              <Row icon={<FileText aria-hidden="true" />} kind="pdf">Corrispondenza con la compagnia.pdf</Row>
              <Row icon={<FileText aria-hidden="true" />} kind="doc">Appunti per il parere.docx</Row>
              <Row icon={<FileText aria-hidden="true" />} kind="pdf">Polizza e condizioni generali.pdf</Row>
            </div>
            <div className="sa-group">
              <div className="sa-gh">
                <span>Conversazioni</span>
                <span className="sa-count">3</span>
              </div>
              <Row icon={<MessageCircle aria-hidden="true" />}>A chi presentare il reclamo?</Row>
              <Row icon={<MessageCircle aria-hidden="true" />}>Punti da approfondire nel parere</Row>
              <Row icon={<MessageCircle aria-hidden="true" />}>Termini e modalità di risposta al reclamo</Row>
            </div>
          </div>
          <div className="sa-col">
            <div className="sa-group">
              <div className="sa-gh">
                <span>Fonti salvate</span>
                <span className="sa-count">{count}</span>
                <span className="sa-saved" style={{ opacity: saved }}>
                  <Check aria-hidden="true" />
                  Salvato
                </span>
              </div>
              <div className="sa-new" style={{ gridTemplateRows: `${arrived}fr`, opacity: arrived }}>
                <div className="sa-new__in">
                  <Row icon={<BookOpen aria-hidden="true" />}>
                    D.lgs. 209/2005 · Art. 7<Muted>Reclami</Muted>
                  </Row>
                </div>
              </div>
              <Row icon={<BookOpen aria-hidden="true" />}>
                D.lgs. 209/2005 · Art. 5<Muted>Autorità di vigilanza</Muted>
              </Row>
              <Row icon={<BookOpen aria-hidden="true" />}>
                Regolamento ISVAP n. 24/2008<Muted>Gestione dei reclami</Muted>
              </Row>
              <Row icon={<BookOpen aria-hidden="true" />}>
                IVASS · Guida ai reclami<Muted>Informazioni per gli assicurati</Muted>
              </Row>
            </div>
            <div className="sa-group">
              <div className="sa-gh">
                <span>Ricerche salvate</span>
                <span className="sa-count">2</span>
              </div>
              <Row icon={<Search aria-hidden="true" />}>Reclami assicurativi</Row>
              <Row icon={<Search aria-hidden="true" />}>Gestione dei reclami e termini di risposta</Row>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------- 3. An article compared across two versions, with the amending act ---------- */
const ConfrontoView = ({ active, motionOn }: ViewProps) => {
  const p = useProgress(active, motionOn, 2.6);
  // each change lights up in turn: deletions on the left, additions on the right
  const mark = (i: number) => span(p, 0.12 + i * 0.09, 0.12 + i * 0.09 + 0.1);
  const m = (i: number): CSSProperties => ({ '--m': mark(i) } as CSSProperties);
  const act = span(p, 0.78, 0.95);
  return (
    <>
      <div className="sa-topbar">
        <Logo />
      </div>
      <div className="pc-body">
        <div className="sa-act">
          <div className="sa-act__t">Codice delle assicurazioni private</div>
          <div className="sa-muted sa-act__s">Decreto legislativo n. 209 del 07/09/2005</div>
        </div>
        <div className="sa-modes" aria-hidden="true">
          <span>Lettura</span>
          <span className="is-on">Confronta</span>
          <span>Cronologia</span>
        </div>
        <div className="sa-art">Art. 7 — Reclami</div>
        <div className="sa-cols">
          <div className="sa-colv sa-colv--old">
            <div className="sa-collabel">
              <b>Prima della modifica</b>
              <span>29/06/2015</span>
            </div>
            <p className="sa-legal">
              1. Le persone fisiche e giuridiche, nonché le associazioni riconosciute per la rappresentanza degli
              interessi dei consumatori hanno facoltà di proporre reclamo all'
              <del className="sa-mark sa-mark--del" style={m(0)}>ISVAP</del>, per l'accertamento dell'osservanza delle
              disposizioni previste nel presente codice, nei confronti delle imprese di assicurazione e di
              riassicurazione<del className="sa-mark sa-mark--del" style={m(1)}>,</del> degli intermediari{' '}
              <del className="sa-mark sa-mark--del" style={m(2)}>e dei periti assicurativi</del> secondo la procedura
              prevista con regolamento{' '}
              <del className="sa-mark sa-mark--del" style={m(3)}>
                adottato dall'Istituto nel rispetto dei principi del giusto procedimento
              </del>
              .
            </p>
          </div>
          <div className="sa-colv sa-colv--new">
            <div className="sa-collabel">
              <b>Testo vigente</b>
              <span>10/01/2024</span>
            </div>
            <p className="sa-legal">
              1. Le persone fisiche e giuridiche, nonché le associazioni riconosciute per la rappresentanza degli
              interessi dei consumatori hanno facoltà di proporre reclamo all'
              <ins className="sa-mark sa-mark--ins" style={m(4)}>IVASS</ins>, per l'accertamento dell'osservanza delle
              disposizioni previste nel presente codice, nei confronti delle imprese di assicurazione e di
              riassicurazione <ins className="sa-mark sa-mark--ins" style={m(5)}>e</ins> degli intermediari secondo la
              procedura prevista con regolamento.
            </p>
          </div>
        </div>
        <div className="sa-modact" style={{ opacity: act, transform: `translateY(${(1 - act) * 6}px)` }}>
          <b>D.lgs. 12 maggio 2015, n. 74</b>
          <span className="sa-muted">Art. 1, comma 6. Ha sostituito integralmente l'articolo 7 con decorrenza 30 giugno 2015.</span>
        </div>
      </div>
    </>
  );
};

/* ---------- 4. Cody answers with sources: the chat on the left, the opened source beside it ---------- */
const ANSWER: { text: string; chip?: string }[] = [
  { text: "Alla data indicata, il reclamo va presentato all'IVASS " },
  { text: '', chip: 'Art. 7 vigente, Reclami' },
  { text: ". La versione originaria indicava l'ISVAP e includeva anche i periti assicurativi " },
  { text: '', chip: 'Art. 7 al 29/06/2015, versione originaria' },
  { text: ". La sostituzione dell'art. 7 decorre dal 30 giugno 2015 " },
  { text: '', chip: 'Art. 1, comma 6' },
  { text: '.' },
];

const CodyView = ({ active, motionOn }: ViewProps) => {
  const p = useProgress(active, motionOn, 3.6);
  const userIn = span(p, 0.04, 0.12);
  const botIn = span(p, 0.16, 0.22);
  const dots = motionOn && p > 0.16 && p < 0.3;
  const words = span(p, 0.3, 0.72);
  const chipsOn = (i: number) => (motionOn ? p > 0.76 + i * 0.05 : true);
  const previewIn = span(p, 0.92, 1);
  // the answer as words, so it can be revealed word by word
  const tokens: { w: string; chip?: string; ci?: number }[] = [];
  let ci = 0;
  ANSWER.forEach((part) => {
    if (part.chip) tokens.push({ w: '', chip: part.chip, ci: ci++ });
    else part.text.split(/(?<=\s)/).filter(Boolean).forEach((w) => tokens.push({ w }));
  });
  const visible = Math.round(words * tokens.length);
  return (
    <>
      <div className="sa-head">
        <Logo mark />
        <span className="sa-head__t">A chi presentare il reclamo?</span>
        <span className="sa-badge">
          <Folder aria-hidden="true" />
          FASCICOLO · Reclamo assicurativo
        </span>
      </div>
      <div className="pc-body sa-cody">
        <div className="sa-thread">
          <div className="sa-bubble sa-bubble--user" style={{ opacity: userIn, transform: `translateY(${(1 - userIn) * 8}px)` }}>
            <span className="sa-label">Tu</span>
            <p>Alla data del 10 gennaio 2024, a quale autorità va presentato un reclamo assicurativo?</p>
          </div>
          <div className="sa-bubble sa-bubble--bot" style={{ opacity: botIn }}>
            {dots && (
              <span className="sa-typing" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>Cody sta scrivendo</span>
              </span>
            )}
            <p>
              {tokens.map((t, i) =>
                t.chip ? (
                  <span
                    key={i}
                    className={`sa-chip${t.ci === 0 && chipsOn(0) ? ' is-active' : ''}`}
                    style={{ opacity: motionOn && i >= visible ? 0 : 1 }}
                  >
                    <BookOpen aria-hidden="true" />
                    {t.chip}
                  </span>
                ) : (
                  <span key={i} style={{ opacity: motionOn && i >= visible ? 0 : 1 }}>
                    {t.w}
                  </span>
                )
              )}
            </p>
          </div>
        </div>
        <div className="sa-preview" style={{ opacity: previewIn, transform: `translateX(${(1 - previewIn) * 24}px)` }}>
          <div className="sa-preview__head">
            <span className="sa-tile">
              <BookOpen aria-hidden="true" />
            </span>
            <div className="sa-preview__id">
              <span className="sa-preview__t">Art. 7 vigente, Reclami</span>
              <span className="sa-preview__s sa-muted">D.lgs. 209/2005 · al 10/01/2024</span>
            </div>
            <span className="sa-preview__act">
              <span className="sa-open">
                Apri
                <ExternalLink aria-hidden="true" />
              </span>
              <Lock aria-hidden="true" />
              <X aria-hidden="true" />
            </span>
          </div>
          <p className="sa-legal sa-excerpt">
            1. Le persone fisiche e giuridiche, nonché le associazioni riconosciute per la rappresentanza degli
            interessi dei consumatori hanno facoltà di proporre reclamo all'<mark>IVASS</mark>, per l'accertamento
            dell'osservanza delle disposizioni previste nel presente codice, nei confronti delle imprese di
            assicurazione e di riassicurazione e degli intermediari secondo la procedura prevista con regolamento.
          </p>
        </div>
      </div>
      <div className="sa-foot">
        <div className="sa-composer">Fai una domanda o descrivi un'attività...</div>
        <p className="sa-disclaimer sa-muted">L'IA può sbagliare. Verifica sempre le fonti nel fascicolo.</p>
      </div>
    </>
  );
};

export const VIEWS = [SearchView, FascicoloView, ConfrontoView, CodyView];

interface PanelProps {
  index: number;
  motionOn: boolean;
  label: string;
  tabId: string;
  panelId: string;
}

const ProductPanel = ({ index, motionOn, label, tabId, panelId }: PanelProps) => (
  <div className="pc-panel" id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={0}>
    <div className="pc-frame sa" role="img" aria-label={label}>
      {VIEWS.map((View, i) => (
        <div
          key={i}
          className="pc-view"
          data-active={i === index ? 'true' : undefined}
          aria-hidden={i === index ? undefined : true}
        >
          <View active={i === index} motionOn={motionOn} />
        </div>
      ))}
    </div>
  </div>
);

export default ProductPanel;
