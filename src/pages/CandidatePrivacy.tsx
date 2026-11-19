import notice from './privacy-content.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CandidatePrivacy() {
  const { language } = useLanguage();
  const it = language === 'it';
  return <div className="min-h-screen bg-background"><Navbar /><main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-6 pb-20 pt-28">
    <h1 className="text-3xl font-bold text-Stele-blue">{it ? 'Privacy candidati' : 'Candidate privacy'}</h1>
    <a className="mt-6 inline-block text-sm text-Stele-blue underline" href="/hiring/privacy-candidati.it.pdf">{it ? 'Scarica l’informativa (PDF)' : 'Download the privacy notice (Italian PDF)'}</a>
    <div lang="it" className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground">{notice.map(section => <section key={section.title}><h2 className="text-lg font-semibold text-Stele-blue">{section.title}</h2><p className="mt-3 whitespace-pre-line">{section.body}</p></section>)}</div>
  </main><Footer /></div>;
}
