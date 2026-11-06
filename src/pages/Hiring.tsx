import { FormEvent, useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { italianRole as role } from './hiring-content';

const copy = {
  it: {
    title: 'Legal Product Specialist', eyebrow: 'LAVORA CON NOI',
    intro: role.profile[0],
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
  const field = 'grid gap-2 text-sm font-medium';
  const it = language === 'it';
  const paragraphs = (items: string[]) => items.map(text => <p key={text} className="mt-4">{text}</p>);
  const heading = 'text-lg font-semibold text-Stele-blue dark:text-white';
  return <div className="min-h-screen bg-white dark:bg-gray-900"><Navbar /><main className="px-4 pb-20 pt-28 md:px-8 lg:px-12"><div className="mx-auto max-w-6xl">
    <header className="border-b border-Stele-blue/15 pb-8 dark:border-gray-700">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-Stele-teal">{c.eyebrow}</p>
      <h1 className="text-3xl font-bold leading-tight text-Stele-blue dark:text-white md:text-4xl">{c.title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300">{c.intro}</p>
      <p className="mt-5 text-sm font-medium text-Stele-blue dark:text-gray-200">{c.equity}</p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{c.remote} · {c.time}</p>
      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{it ? 'Collaborazione remunerata attraverso equity, senza un compenso monetario.' : 'Collaboration compensated through equity, without cash compensation.'}</p>
      <Button asChild className="mt-6 rounded-full bg-Stele-blue px-7 text-white hover:bg-Stele-blue/90"><a href="#application">{c.apply}</a></Button>
    </header>
    <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
    <article className="space-y-9 text-sm leading-7 text-gray-600 dark:text-gray-300 lg:col-span-8" aria-label="Legal Product Specialist">
      <section><h2 className={heading}>{it ? 'Profilo' : c.profile}</h2>{it ? paragraphs(role.profile.slice(1)) : <p className="mt-4">{c.profileText}</p>}</section>
      <section><h2 className={heading}>{it ? 'Ruolo e responsabilità' : c.responsibilities}</h2>
        {it && <p className="mt-4">La persona selezionata collaborerà direttamente con i founder, contribuendo alle seguenti attività:</p>}
        <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-Stele-teal">{(it ? role.tasks : c.tasks).map(task => <li key={task}>{task}</li>)}</ul>{it && paragraphs(role.autonomy)}
      </section>
      {it && <section><h2 className={heading}>Attitudine e motivazione</h2>{paragraphs(role.motivation)}</section>}
      <section><h2 className={heading}>{it ? 'Proposta Work for Equity' : 'Work for Equity proposal'}</h2>
        {it ? <><p className="mt-4">SprintAct si trova in una fase early-stage. Proponiamo quindi una collaborazione professionale autonoma remunerata attraverso equity, senza un compenso monetario.</p><p className="mt-4">La proposta indicativa comprende:</p>
        <dl className="mt-5 border-t border-Stele-blue/15 dark:border-gray-700">{role.terms.map(([label, value]) => <div key={label} className="grid gap-1 border-b border-Stele-blue/15 py-3 sm:grid-cols-[11rem_1fr] sm:gap-5 dark:border-gray-700"><dt className="font-medium text-Stele-blue dark:text-white">{label}</dt><dd>{value}</dd></div>)}</dl>{paragraphs(role.conditions)}</> : <p className="mt-4">{c.offerText}</p>}
      </section>
      <section><h2 className={heading}>{it ? 'Evoluzione nel lungo periodo' : 'Long-term development'}</h2>{it ? paragraphs(role.growth) : <p className="mt-4">{c.growth}</p>}</section>
      <section><h2 className={heading}>{it ? 'Candidature' : c.selection}</h2>{it ? paragraphs(role.selection) : <p className="mt-4">{c.selectionText}</p>}</section>
    </article>
    <aside className="lg:col-span-4"><div className="border-l border-Stele-blue/20 pl-6 lg:sticky lg:top-28 dark:border-gray-700">
      <h2 className={heading}>{it ? 'Documenti e contatti' : 'Documents and contacts'}</h2>
      <a className="mt-4 block text-sm leading-6 text-Stele-blue underline underline-offset-4 dark:text-white" href="/hiring/legal-product-specialist.provisional.it.pdf">{it ? 'Descrizione della collaborazione (PDF)' : 'Collaboration description (Italian PDF)'}</a>
      <a className="mt-3 block text-sm text-Stele-blue underline underline-offset-4 dark:text-white" href="/privacy-candidati/">{it ? 'Informativa candidati' : 'Candidate privacy notice'}</a>
      <a className="mt-3 block text-sm text-gray-600 dark:text-gray-300" href="mailto:info@stele.it.com">info@stele.it.com</a>
    </div></aside></div>
    <section id="application" className="mt-12 max-w-3xl scroll-mt-28 border-t border-Stele-blue/15 pt-8 dark:border-gray-700" aria-labelledby="apply-title"><h2 id="apply-title" className="text-2xl font-bold text-Stele-blue dark:text-white">{c.apply}</h2>
      {!open && <p role="status" className="mt-5 text-sm text-gray-600 dark:text-gray-300">{it ? 'Il modulo di candidatura non è attualmente disponibile.' : 'The application form is currently unavailable.'}</p>}
      {reference ? <p role="status" className="mt-6 rounded-xl bg-accent/15 p-6">{c.success} <strong>{reference}</strong></p> : <form onSubmit={submit} onChange={() => { key.current = crypto.randomUUID(); }} className="mt-7 max-w-2xl">
        <fieldset disabled={!open || busy} className="grid gap-5 disabled:opacity-60">
          <label className={field}>{c.name}<Input name="name" required maxLength={120} autoComplete="name" /></label>
          <label className={field}>{c.email}<Input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label className={field}>{c.linkedin}<Input name="linkedin" type="url" maxLength={500} placeholder="https://www.linkedin.com/in/…" /></label>
          <label className={field}>{c.motivation}<textarea className="min-h-28 rounded-md border bg-background p-3" name="motivation" maxLength={2000} /></label>
          <label className={field}>{c.cv}<Input className="h-auto py-3" name="cv" type="file" accept="application/pdf,.pdf" required /></label>
          <p className="text-sm text-muted-foreground">{c.sensitive}</p>
          <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" name="privacyAcknowledged" required /><a href="/privacy-candidati/" target="_blank" rel="noopener noreferrer" className="underline">{c.privacy}</a></label>
          <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" name="futureConsent" /><span>{c.future}</span></label>
          <Button type="submit" className="rounded-full bg-Stele-blue text-white hover:bg-Stele-blue/90">{busy ? c.sending : c.send}</Button>
        </fieldset>
        {status && <p className="mt-4 text-destructive" role="alert">{status}</p>}
      </form>}
    </section>
  </div></main><Footer /></div>;
}
