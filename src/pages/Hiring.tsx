import { FormEvent, useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUpRight, BriefcaseBusiness, Clock3, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { italianRole as role } from './hiring-content';

const copy = {
  it: {
    title: 'Legal Product Specialist', eyebrow: 'LAVORA CON NOI',
    remote: 'Principalmente da remoto', time: 'Circa un giorno alla settimana', equity: 'Collaborazione professionale autonoma · Impegno inizialmente parziale · Work for Equity',
    responsibilities: 'Il tuo contributo', tasks: ['Tradurre i processi di lavoro degli avvocati in requisiti di prodotto.', 'Testare SprintAct, valutare ricerca giuridica e funzionalità AI, individuare criticità e fonti mancanti.', 'Creare casi realistici e benchmark; contribuire alle decisioni di prodotto e ai contenuti giuridici.'],
    profile: 'Chi cerchiamo', profileText: 'Esperienza concreta nella professione forense, capacità di ragionamento, curiosità e interesse per legal tech. Lavorerai direttamente con i founder, con autonomia professionale e disponibilità a far crescere il tuo contributo nel tempo.',
    offer: 'La proposta, con trasparenza', offerText: '5% indicativo, maturato in 4 anni con cliff iniziale di 6 mesi e successiva maturazione mensile. Eventuali ulteriori 2 punti percentuali richiedono un accordo separato: non sono automatici. Base di calcolo, diritti, cessazione e piano saranno definiti negli accordi. Le quote sono soggette a diluizione; valore, liquidità e rendimento non sono garantiti. Una futura componente monetaria potrà essere concordata con la crescita della società. Nessuna quota è già assegnata.',
    growth: 'Possibile evoluzione verso Legal Product Lead, concordando impegno, responsabilità e condizioni economiche. Il ruolo non attribuisce cariche amministrative o poteri societari.',
    selection: 'Come ci conosceremo', selectionText: 'Valutazione del CV, colloqui ed eventuali prove pratiche. Una possibile collaborazione pilota avrà attività, durata e condizioni economiche formalizzate prima dell’avvio, separatamente dalle prove di selezione. Selezione aperta senza discriminazioni su caratteristiche personali non pertinenti.',
    pdf: 'Descrizione della collaborazione (PDF)', apply: 'Candidati', name: 'Nome e cognome', email: 'Email', linkedin: 'LinkedIn (facoltativo, consigliato)', motivation: 'Breve motivazione (facoltativa)', cv: 'CV obbligatorio · PDF, massimo 5 MB', privacy: 'Ho letto l’informativa candidati', future: 'Acconsento alla conservazione del mio profilo per opportunità future, fino a 24 mesi dalla candidatura. Posso revocare il consenso in qualsiasi momento; il rifiuto non influisce sulla selezione attuale.',
    unavailable: 'Il modulo di candidatura non è attualmente disponibile.', send: 'Invia candidatura', sending: 'Invio in corso…', success: 'Candidatura ricevuta. Conserva questo riferimento:', error: 'Invio non riuscito. Riprova; se il problema persiste contatta info@stele.it.com.', invalid: 'Scegli un PDF valido di massimo 5 MB.', sensitive: 'Non inserire dati sanitari o altre informazioni sensibili non necessarie. Per informazioni: info@stele.it.com.',
  },
  en: {
    title: 'Legal Product Specialist', eyebrow: 'CAREERS AT STELE', intro: 'Build SprintAct with people who understand the daily work of legal professionals.',
    remote: 'Mainly remote', time: 'Approximately one day a week', equity: 'Independent professional collaboration · Work for Equity · No initial cash compensation',
    responsibilities: 'Your contribution', tasks: ['Translate lawyers’ workflows into product requirements.', 'Test SprintAct, evaluate legal research and AI features, identify issues and missing sources.', 'Create realistic cases and benchmarks; contribute to product decisions and legal editorial content.'],
    profile: 'Who we are looking for', profileText: 'Practical experience in legal practice, sound reasoning, curiosity and an interest in legal technology. Work directly with the founders, with professional independence and a willingness to grow your contribution over time.',
    offer: 'A transparent proposal', offerText: 'An indicative 5%, vesting over 4 years with an initial 6-month cliff and subsequent monthly vesting. A potential additional 2 percentage points requires a separate agreement and is not automatic. Calculation basis, rights, termination and vesting details will be defined in agreements. Shares are subject to dilution; future value, liquidity and returns are not guaranteed. Future cash compensation may be agreed as the company grows. No shares have already been awarded.',
    growth: 'Potential progression to Legal Product Lead, with time commitment, responsibilities and financial terms agreed separately. This title confers no corporate management position or authority.',
    selection: 'The selection process', selectionText: 'CV review, interviews and possible practical assessments. Any pilot collaboration will have its scope, duration and financial terms agreed in writing before it begins, separately from selection assessments. Selection is open without discrimination based on irrelevant personal characteristics.',
    pdf: 'Collaboration description (Italian PDF)', apply: 'Apply', name: 'Full name', email: 'Email', linkedin: 'LinkedIn (optional, recommended)', motivation: 'Brief motivation (optional)', cv: 'CV required · PDF, up to 5 MB', privacy: 'I have read the candidate privacy notice', future: 'I consent to my profile being retained for future opportunities for up to 24 months from this application. I may withdraw consent at any time; declining does not affect this selection.', unavailable: 'The application form is currently unavailable.', send: 'Submit application', sending: 'Submitting…', success: 'Application received. Keep this reference:', error: 'Submission failed. Please retry; if the issue persists contact info@stele.it.com.', invalid: 'Choose a valid PDF up to 5 MB.', sensitive: 'Please omit health data and other unnecessary sensitive information. Questions: info@stele.it.com.',
  },
};

export default function Hiring() {
  const { language } = useLanguage();
  const c = copy[language];
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState('');
  const key = useRef(crypto.randomUUID());
  const api = import.meta.env.VITE_HIRING_API_URL;
  const isLocalPreview = import.meta.env.DEV && !api;
  useEffect(() => {
    document.title = 'Legal Product Specialist | Stele';
    document.documentElement.lang = language;
    const controller = new AbortController();
    if (api) fetch(`${api}/v1/hiring`, { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(data => setOpen(data?.open === true)).catch(() => setOpen(false));
    return () => controller.abort();
  }, [api, language]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !open) return;
    const form = new FormData(event.currentTarget);
    const file = form.get('cv') as File;
    if (!file || file.size === 0 || file.size > 5 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.pdf')) { setStatus(c.invalid); return; }
    form.set('locale', language);
    form.set('futureConsent', String(form.get('futureConsent') === 'on'));
    form.set('privacyAcknowledged', String(form.get('privacyAcknowledged') === 'on'));
    form.set('privacyVersion', 'candidate-privacy-v1');
    setBusy(true); setStatus('');
    try {
      const result = await fetch(`${api}/v1/applications`, { method: 'POST', headers: { 'Idempotency-Key': key.current }, body: form });
      if (!result.ok) throw new Error('submission');
      const data = await result.json();
      if (!data.applicationId) throw new Error('response');
      setReference(data.applicationId);
    } catch { setStatus(c.error); } finally { setBusy(false); }
  }
  const it = language === 'it';
  const field = 'grid gap-2 text-sm font-medium text-muted-foreground';
  const heading = 'text-xl font-semibold text-Stele-blue dark:text-white';
  const points = it ? [
    ['Comprendere il lavoro legale', 'Tradurre i processi di lavoro degli avvocati in esigenze e requisiti di prodotto.'],
    ['Valutare SprintAct', 'Testare ricerca giuridica e funzionalità AI, individuando criticità e fonti mancanti.'],
    ['Contribuire al prodotto', 'Creare casi realistici e benchmark, contribuire alle funzionalità e ai contenuti giuridici.'],
  ] : [
    ['Understand legal workflows', 'Translate lawyers’ workflows into product needs and requirements.'],
    ['Evaluate SprintAct', 'Test legal research and AI features, identifying issues and missing sources.'],
    ['Contribute to the product', 'Create realistic cases and benchmarks; contribute to features and legal content.'],
  ];
  return <div className="min-h-screen bg-background"><Navbar /><main>
    <section className="relative isolate overflow-hidden px-4 md:px-8 lg:px-12 bg-[radial-gradient(circle_at_15%_20%,rgba(56,178,172,0.18),transparent_46%),radial-gradient(circle_at_80%_0%,rgba(26,54,93,0.2),transparent_42%),linear-gradient(160deg,#f8fbff_0%,#eef4ff_52%,#e8f7f5_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(56,178,172,0.22),transparent_46%),radial-gradient(circle_at_82%_0%,rgba(56,178,172,0.18),transparent_40%),linear-gradient(160deg,#050a14_0%,#0c1323_52%,#071a1a_100%)]">
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,54,93,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,54,93,0.05)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)]" />
      <div className="relative mx-auto max-w-6xl pb-12 pt-36 md:pb-14">
        <a href="/" className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-gray-600 transition-colors hover:text-Stele-blue dark:text-gray-300"><span aria-hidden="true">←</span> Stele</a>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-Stele-teal">{it ? 'Lavora con noi' : 'Careers'}</p>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-Stele-blue dark:text-white sm:text-[2.5rem]">Legal Product Specialist</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300">{it ? 'Cerchiamo un professionista del settore legale per contribuire allo sviluppo di SprintAct, a fianco dei founder.' : 'We are looking for a legal professional to help develop SprintAct, working directly with the founders.'}</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-base font-medium text-Stele-blue dark:text-gray-200">
          <span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="h-4 w-4 text-Stele-teal" />{c.remote}</span>
          <span className="inline-flex items-center gap-2"><Clock3 aria-hidden="true" className="h-4 w-4 text-Stele-teal" />{c.time}</span>
          <span className="inline-flex items-center gap-2"><BriefcaseBusiness aria-hidden="true" className="h-4 w-4 text-Stele-teal" />Work for Equity</span>
        </div>
        <a href="#application" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-Stele-blue underline-offset-4 hover:underline dark:text-white">{c.apply}<ArrowDown aria-hidden="true" className="h-4 w-4" /></a>
      </div>
    </section>
    <section className="section-padding bg-white dark:bg-gray-900">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-9 lg:col-span-7">
          <section aria-labelledby="contribution-title">
            <h2 id="contribution-title" className={heading}>{it ? 'Il tuo contributo' : 'Your contribution'}</h2>
            <div className="mt-6 space-y-5">{points.map(([title, description]) => <div key={title} className="border-l border-Stele-blue/20 pl-5 dark:border-gray-700"><h3 className="text-base font-semibold text-Stele-blue dark:text-white">{title}</h3><p className="mt-1 text-base leading-relaxed text-gray-600 dark:text-gray-300">{description}</p></div>)}</div>
          </section>
          <section><h2 className={heading}>{it ? 'Chi cerchiamo' : 'Who we are looking for'}</h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">{it ? 'Esperienza concreta nella professione forense, capacità di ragionamento e interesse per legal tech e intelligenza artificiale. Cerchiamo una persona pragmatica e affidabile, disponibile a far crescere nel tempo il proprio contributo al progetto.' : 'Practical experience in legal practice, sound reasoning and an interest in legal tech and AI. We are looking for a pragmatic, reliable person willing to grow their contribution to the project over time.'}</p>
          </section>
          <section className="rounded-2xl border border-Stele-blue/10 bg-slate-50 p-5 dark:border-gray-700 dark:bg-slate-900/60 sm:p-6">
            <h2 className={heading}>{it ? 'La collaborazione' : 'The collaboration'}</h2>
            <p className="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-300">{it ? 'Collaborazione professionale autonoma, inizialmente di circa un giorno alla settimana, remunerata attraverso equity, senza compenso monetario.' : 'Independent professional collaboration, initially around one day per week, compensated through equity, without cash compensation.'}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-y border-Stele-blue/10 py-4 dark:border-gray-700">
              {[[ '5%', it ? 'Partecipazione di base' : 'Base participation'], [it ? '4 anni' : '4 years', 'Vesting'], [it ? '6 mesi' : '6 months', it ? 'Cliff iniziale' : 'Initial cliff']].map(([value, label]) => <div key={label}><p className="text-xl font-semibold text-Stele-blue dark:text-white">{value}</p><p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">{label}</p></div>)}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{it ? 'La partecipazione matura progressivamente. Ulteriori 2 punti percentuali potranno essere concordati e non sono automatici. Le quote sono soggette a diluizione; valore futuro e rendimento non sono garantiti.' : 'The participation vests progressively. An additional 2 percentage points may be agreed and are not automatic. Shares are subject to dilution; future value and returns are not guaranteed.'}</p>
            <details className="group mt-3 text-sm"><summary className="cursor-pointer py-2 font-medium text-Stele-blue underline-offset-4 hover:underline dark:text-white">{it ? 'Condizioni della proposta' : 'Proposal terms'}</summary>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{it ? role.conditions.map(text => <p key={text}>{text}</p>) : <p>{c.offerText}</p>}<a className="inline-flex items-center gap-2 font-medium text-Stele-blue underline dark:text-white" href="/hiring/legal-product-specialist.provisional.it.pdf">{c.pdf}<ArrowUpRight aria-hidden="true" className="h-3 w-3" /></a></div>
            </details>
          </section>
          <section><h2 className={heading}>{it ? 'Come funziona la selezione' : 'The selection process'}</h2>
            <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-base text-gray-600 dark:text-gray-300">{(it ? ['Valutazione del CV', 'Colloqui conoscitivi', 'Eventuali prove pratiche'] : ['CV review', 'Introductory interviews', 'Possible practical assessments']).map((text, i) => <li key={text} className="flex items-center gap-2"><span className="text-xs font-semibold text-Stele-teal">0{i + 1}</span>{text}</li>)}</ol>
            <a className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-Stele-blue underline underline-offset-4 dark:text-white" href="/hiring/legal-product-specialist.provisional.it.pdf">{it ? 'Leggi la descrizione completa' : 'Read the full description'}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
          </section>
        </div>
        <section id="application" className="glass scroll-mt-28 rounded-2xl p-6 sm:p-8 lg:col-span-5" aria-labelledby="apply-title">
          <h2 id="apply-title" className="text-2xl font-semibold text-Stele-blue dark:text-white">{it ? 'Invia la tua candidatura' : 'Submit your application'}</h2>
          <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">{it ? 'Allega il tuo CV. Se vuoi, aggiungi il profilo LinkedIn e una breve motivazione.' : 'Attach your CV. You can also add your LinkedIn profile and a brief motivation.'}</p>
          {!open && !isLocalPreview && <p role="status" className="mt-4 border-l-2 border-Stele-teal pl-3 text-xs leading-5 text-gray-600 dark:text-gray-300">{c.unavailable}</p>}
          {reference ? <p role="status" className="mt-6 break-all text-sm leading-6 text-Stele-blue dark:text-white">{c.success} <strong>{reference}</strong></p> : <form onSubmit={submit} onChange={() => { key.current = crypto.randomUUID(); }} className="mt-6">
            <fieldset disabled={busy} className="grid gap-4">
              <label className={field}>{c.name}<Input className="border-border bg-secondary/70" name="name" required maxLength={120} autoComplete="name" /></label>
              <label className={field}>{c.email}<Input className="border-border bg-secondary/70" name="email" type="email" required maxLength={254} autoComplete="email" /></label>
              <label className={field}>{c.linkedin}<Input className="border-border bg-secondary/70" name="linkedin" type="url" maxLength={500} placeholder="https://www.linkedin.com/in/…" /></label>
              <label className={field}>{c.cv}<Input className="h-auto border-border bg-secondary/70 py-3 text-xs file:mr-3 file:text-xs" name="cv" type="file" accept="application/pdf,.pdf" required /></label>
              <label className={field}>{c.motivation}<textarea className="min-h-20 rounded-md border border-border bg-secondary/70 p-3 text-sm" name="motivation" maxLength={2000} /></label>
              <p className="text-xs leading-5 text-muted-foreground">{c.sensitive}</p>
              <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input className="mt-1 accent-[#1a365d]" type="checkbox" name="privacyAcknowledged" required /><a href="/privacy-candidati/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{c.privacy}</a></label>
              <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input className="mt-1 accent-[#1a365d]" type="checkbox" name="futureConsent" /><span>{c.future}</span></label>
              <Button disabled={!open} type="submit" className="mt-2 rounded-full bg-Stele-blue px-7 text-white hover:bg-Stele-blue/90">{busy ? c.sending : c.send}</Button>
            </fieldset>
            {status && <p className="mt-4 text-sm text-destructive" role="alert">{status}</p>}
          </form>}
        </section>
      </div>
    </section>
  </main><Footer /></div>;
}
