import { FormEvent, useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const copy = {
  it: {
    title: 'Porta il diritto dentro il prodotto.', eyebrow: 'LAVORA CON STELE',
    intro: 'Costruiamo SprintAct insieme a chi conosce il lavoro dei professionisti legali.',
    remote: 'Principalmente da remoto', time: 'Circa un giorno alla settimana', equity: 'Collaborazione autonoma · Work for Equity · Senza compenso monetario iniziale',
    provisional: 'Annuncio provvisorio. Condizioni soggette agli accordi individuali e agli atti societari. Scadenza da definire.',
    responsibilities: 'Il tuo contributo', tasks: ['Tradurre i processi di lavoro degli avvocati in requisiti di prodotto.', 'Testare SprintAct, valutare ricerca giuridica e funzionalità AI, individuare criticità e fonti mancanti.', 'Creare casi realistici e benchmark; contribuire alle decisioni di prodotto e ai contenuti giuridici.'],
    profile: 'Chi cerchiamo', profileText: 'Esperienza concreta nella professione forense, capacità di ragionamento, curiosità e interesse per legal tech. Lavorerai direttamente con i founder, con autonomia professionale e disponibilità a far crescere il tuo contributo nel tempo.',
    offer: 'La proposta, con trasparenza', offerText: '5% indicativo, maturato in 4 anni con cliff iniziale di 6 mesi e successiva maturazione mensile. Eventuali ulteriori 2 punti percentuali richiedono un accordo separato: non sono automatici. Base di calcolo, diritti, cessazione e piano saranno definiti negli accordi. Le quote sono soggette a diluizione; valore, liquidità e rendimento non sono garantiti. Una futura componente monetaria potrà essere concordata con la crescita della società. Nessuna quota è già assegnata.',
    growth: 'Possibile evoluzione verso Legal Product Lead, concordando impegno, responsabilità e condizioni economiche. Il ruolo non attribuisce cariche amministrative o poteri societari.',
    selection: 'Come ci conosceremo', selectionText: 'Valutazione del CV, colloqui ed eventuali prove pratiche. Una possibile collaborazione pilota avrà attività, durata e condizioni economiche formalizzate prima dell’avvio, separatamente dalle prove di selezione. Selezione aperta senza discriminazioni su caratteristiche personali non pertinenti.',
    pdf: 'Leggi il PDF provvisorio (italiano)', apply: 'Candidati', name: 'Nome e cognome', email: 'Email', linkedin: 'LinkedIn (facoltativo, consigliato)', motivation: 'Breve motivazione (facoltativa)', cv: 'CV obbligatorio · PDF, massimo 5 MB', privacy: 'Ho letto l’informativa candidati', future: 'Acconsento alla conservazione del mio profilo per opportunità future, fino a 24 mesi dalla candidatura. Posso revocare il consenso in qualsiasi momento; il rifiuto non influisce sulla selezione attuale.',
    unavailable: 'Le candidature non sono ancora aperte. Stiamo finalizzando l’annuncio e l’informativa privacy.', send: 'Invia candidatura', sending: 'Invio in corso…', success: 'Candidatura ricevuta. Conserva questo riferimento:', error: 'Invio non riuscito. Riprova; se il problema persiste contatta info@stele.it.com.', invalid: 'Scegli un PDF valido di massimo 5 MB.', sensitive: 'Non inserire dati sanitari o altre informazioni sensibili non necessarie. Per informazioni: info@stele.it.com.',
  },
  en: {
    title: 'Bring legal expertise into the product.', eyebrow: 'CAREERS AT STELE', intro: 'Build SprintAct with people who understand the daily work of legal professionals.',
    remote: 'Mainly remote', time: 'Approximately one day a week', equity: 'Independent professional collaboration · Work for Equity · No initial cash compensation', provisional: 'Provisional vacancy. Subject to individual agreements and corporate acts. Deadline to be defined.',
    responsibilities: 'Your contribution', tasks: ['Translate lawyers’ workflows into product requirements.', 'Test SprintAct, evaluate legal research and AI features, identify issues and missing sources.', 'Create realistic cases and benchmarks; contribute to product decisions and legal editorial content.'],
    profile: 'Who we are looking for', profileText: 'Practical experience in legal practice, sound reasoning, curiosity and an interest in legal technology. Work directly with the founders, with professional independence and a willingness to grow your contribution over time.',
    offer: 'A transparent proposal', offerText: 'An indicative 5%, vesting over 4 years with an initial 6-month cliff and subsequent monthly vesting. A potential additional 2 percentage points requires a separate agreement and is not automatic. Calculation basis, rights, termination and vesting details will be defined in agreements. Shares are subject to dilution; future value, liquidity and returns are not guaranteed. Future cash compensation may be agreed as the company grows. No shares have already been awarded.',
    growth: 'Potential progression to Legal Product Lead, with time commitment, responsibilities and financial terms agreed separately. This title confers no corporate management position or authority.',
    selection: 'The selection process', selectionText: 'CV review, interviews and possible practical assessments. Any pilot collaboration will have its scope, duration and financial terms agreed in writing before it begins, separately from selection assessments. Selection is open without discrimination based on irrelevant personal characteristics.',
    pdf: 'Read the provisional PDF (Italian)', apply: 'Apply', name: 'Full name', email: 'Email', linkedin: 'LinkedIn (optional, recommended)', motivation: 'Brief motivation (optional)', cv: 'CV required · PDF, up to 5 MB', privacy: 'I have read the candidate privacy notice', future: 'I consent to my profile being retained for future opportunities for up to 24 months from this application. I may withdraw consent at any time; declining does not affect this selection.', unavailable: 'Applications are not open yet. We are finalising the vacancy and candidate privacy notice.', send: 'Submit application', sending: 'Submitting…', success: 'Application received. Keep this reference:', error: 'Submission failed. Please retry; if the issue persists contact info@stele.it.com.', invalid: 'Choose a valid PDF up to 5 MB.', sensitive: 'Please omit health data and other unnecessary sensitive information. Questions: info@stele.it.com.',
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
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-5xl px-5 pb-24 pt-36">
    <p className="text-sm font-semibold tracking-widest text-muted-foreground">{c.eyebrow}</p>
    <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">{c.title}</h1>
    <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{c.intro}</p>
    <article className="mt-12 rounded-3xl border bg-card p-6 md:p-10" aria-labelledby="role-title">
      <div className="flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-accent/15 px-4 py-2">{c.remote}</span><span className="rounded-full bg-secondary px-4 py-2">{c.time}</span></div>
      <h2 id="role-title" className="mt-7 text-3xl font-bold">Legal Product Specialist</h2>
      <p className="mt-4 font-semibold">{c.equity}</p><p className="mt-3 text-sm text-muted-foreground">{c.provisional}</p>
      <Button asChild className="mt-6"><a href="#application">{c.apply}</a></Button>
      <div className="mt-10 grid gap-10 md:grid-cols-2"><section><h3 className="text-xl font-semibold">{c.responsibilities}</h3><ul className="mt-4 list-disc space-y-3 pl-5 text-muted-foreground">{c.tasks.map(task => <li key={task}>{task}</li>)}</ul></section><section><h3 className="text-xl font-semibold">{c.profile}</h3><p className="mt-4 leading-relaxed text-muted-foreground">{c.profileText}</p></section></div>
      <section className="mt-10 rounded-2xl bg-secondary/60 p-6"><h3 className="text-xl font-semibold">{c.offer}</h3><p className="mt-4 leading-relaxed">{c.offerText}</p><p className="mt-4 text-muted-foreground">{c.growth}</p></section>
      <section className="mt-10"><h3 className="text-xl font-semibold">{c.selection}</h3><p className="mt-4 leading-relaxed text-muted-foreground">{c.selectionText}</p></section>
      <a className="mt-6 inline-block underline underline-offset-4" href="/hiring/legal-product-specialist.provisional.it.pdf">{c.pdf}</a>
    </article>
    <section id="application" className="mt-14 scroll-mt-28" aria-labelledby="apply-title"><h2 id="apply-title" className="text-3xl font-bold">{c.apply}</h2>
      {!open && <p role="status" className="mt-5 rounded-xl border bg-secondary p-5">{c.unavailable}</p>}
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
          <Button type="submit">{busy ? c.sending : c.send}</Button>
        </fieldset>
        {status && <p className="mt-4 text-destructive" role="alert">{status}</p>}
      </form>}
    </section>
  </main><Footer /></div>;
}
