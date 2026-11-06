import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CandidatePrivacy() {
  const { language } = useLanguage();
  const it = language === 'it';
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-3xl px-5 pb-24 pt-36">
    <h1 className="text-4xl font-bold">{it ? 'Privacy candidati' : 'Candidate privacy'}</h1>
    <p className="mt-6 rounded-xl border bg-secondary p-5">{it ? 'Informativa provvisoria: raccolta candidature disattivata fino alla pubblicazione della versione definitiva.' : 'Provisional notice: applications are disabled until the final notice is published.'}</p>
    <p className="mt-6">{it ? 'Titolare indicato nella bozza:' : 'Controller identified in the draft:'} Stele S.r.l., C.F./P.IVA 04953820166, Via per Curnasco 52, 24127 Bergamo BG. <a className="underline" href="mailto:info@stele.it.com">info@stele.it.com</a>.</p>
    <p className="mt-5">{it ? 'La bozza completa è disponibile nel PDF italiano. Il testo definitivo HTML e la traduzione inglese saranno pubblicati prima dell’apertura. Il consenso per opportunità future sarà facoltativo e separato, per un massimo di 24 mesi dalla candidatura.' : 'The complete draft is available as an Italian PDF. The final HTML notice and English translation will be published before applications open. Consent for future opportunities will be optional and separate, for up to 24 months from the application.'}</p>
    <a className="mt-6 inline-block underline" href="/hiring/privacy.provisional.it.pdf">{it ? 'Scarica la bozza italiana (PDF)' : 'Download the Italian draft (PDF)'}</a>
    <p className="mt-8 text-sm text-muted-foreground">{it ? 'La presa visione dell’informativa non è un consenso al trattamento per la selezione attuale. Per richieste sui tuoi dati o revoca del consenso contatta info@stele.it.com.' : 'Acknowledging the notice is not consent to processing for the current selection. For data requests or withdrawal of consent contact info@stele.it.com.'}</p>
  </main><Footer /></div>;
}
