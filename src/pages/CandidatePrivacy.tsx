import notice from './privacy-content.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CandidatePrivacy() {
  const { language } = useLanguage();
  const it = language === 'it';
  return <div className="min-h-screen bg-background"><Navbar /><main className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-8 lg:px-12">
    <h1 className="text-3xl font-bold text-Stele-blue dark:text-white">{it ? 'Privacy candidati' : 'Candidate privacy'}</h1>
    <a className="mt-6 inline-block text-sm text-Stele-blue underline dark:text-white" href="/hiring/privacy-candidati.it.pdf">{it ? 'Scarica l’informativa (PDF)' : 'Download the privacy notice (Italian PDF)'}</a>
    <div lang="it" className="mt-8 space-y-7 text-sm leading-7 text-gray-600 dark:text-gray-300">{notice.map(section => <section key={section.title}><h2 className="text-lg font-semibold text-Stele-blue dark:text-white">{section.title}</h2><p className="mt-3 whitespace-pre-line">{section.body}</p></section>)}</div>
  </main><Footer /></div>;
}
