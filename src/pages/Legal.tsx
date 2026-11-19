import { useEffect, type ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const linkClass = 'text-muted-foreground transition-colors hover:text-foreground';

export default function Legal() {
  const { language } = useLanguage();
  const it = language === 'it';

  useEffect(() => {
    document.title = it ? 'Note legali · Stele' : 'Legal information · Stele';
  }, [it]);

  const rows: { label: string; value: ReactNode }[] = [
    { label: it ? 'Denominazione' : 'Company name', value: 'Stele S.r.l.' },
    {
      label: it ? 'Sede legale' : 'Registered office',
      value: `Via per Curnasco, 52, 24127 Bergamo (BG), ${it ? 'Italia' : 'Italy'}`,
    },
    { label: it ? 'Partita IVA e Codice fiscale' : 'VAT number and tax code', value: '04953820166' },
    {
      label: it ? 'Registro delle Imprese' : 'Companies Register',
      value: it ? 'Bergamo, n. 04953820166' : 'Bergamo, no. 04953820166',
    },
    { label: 'REA', value: 'BG-501593' },
    {
      label: it ? 'Capitale sociale' : 'Share capital',
      value: it ? '€ 20.000,00' : '€ 20,000.00',
    },
    {
      label: 'PEC',
      value: (
        <a className="hover:underline" href="mailto:stele.srl@arubapec.it">
          stele.srl@arubapec.it
        </a>
      ),
    },
    {
      label: 'Email',
      value: (
        <a className="hover:underline" href="mailto:info@stele.it.com">
          info@stele.it.com
        </a>
      ),
    },
    {
      label: it ? 'Qualifica' : 'Status',
      value: it
        ? 'Start-up innovativa iscritta nella sezione speciale del Registro delle Imprese'
        : 'Innovative start-up registered in the special section of the Companies Register',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-6 pb-20 pt-28">
        <h1 className="text-3xl font-bold text-Stele-blue">
          {it ? 'Note legali' : 'Legal information'}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {it
            ? "Dati societari di Stele S.r.l. ai sensi dell'art. 2250 del Codice civile."
            : 'Company information for Stele S.r.l. under article 2250 of the Italian Civil Code.'}
        </p>
        <dl className="mt-10 max-w-3xl divide-y divide-Stele-blue/10 border-y border-Stele-blue/10">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[240px_1fr] sm:gap-6">
              <dt className="text-sm font-semibold text-Stele-blue">{row.label}</dt>
              <dd className="text-sm leading-6 text-muted-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a
            href="https://www.iubenda.com/privacy-policy/94489167"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Privacy Policy
          </a>
          <a
            href="https://www.iubenda.com/privacy-policy/94489167/cookie-policy"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Cookie Policy
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
