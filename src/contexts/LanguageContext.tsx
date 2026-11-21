import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export const translations = {
  // EN draft, to be reviewed
  en: {
    skipLink: 'Skip to content',
    navMain: 'Main',
    navHomeLabel: 'Stele, back to the top of the page',
    navProduct: 'Product',
    navVision: 'Vision',
    navMission: 'Mission',
    navTeam: 'Team',
    navContact: 'Contact',
    navCareers: 'Work with us',
    navBadge: '1 open position',
    ctaSprintAct: 'Discover SprintAct',
    menuOpen: 'Open the menu',
    menuClose: 'Close the menu',
    langLabel: 'Change language',
    newTab: 'opens in a new tab',

    heroTitle: 'We build artificial intelligence for people who work with the law',
    heroDesc:
      'We build software for lawyers and law firms. The AI cites the laws and rulings behind every answer, and the lawyer decides what to use.',
    heroCtaVision: 'Our vision',
    heroSteleSr:
      'The stele, the symbol of Stele, made of four blocks: Research, Monitoring, Impact, Decision.',
    heroPhases: 'The four stages',
    heroProductCap: 'Our product',
    heroProductLink: 'SprintAct, our product: go to the section',

    productLabel: 'Our product',
    productTitle: "SprintAct, the lawyer's workspace",
    productDesc:
      'Research, sources and case files in a single working environment. SprintAct searches laws and case law starting from a question in natural language, shows the text in force on the date you need and links every provision to the decisions that cite it.',
    productTabs: 'SprintAct capabilities',
    productCap1Title: 'Natural-language search',
    productCap1Desc:
      'Write the question as you would ask a colleague. SprintAct searches national, regional and European legislation and case law.',
    productCap2Title: 'The case file at the centre',
    productCap2Desc:
      'The documents, laws, rulings and searches of a matter live together. The documents you upload are encrypted and only you can see them.',
    productCap3Title: 'Laws over time',
    productCap3Desc:
      'Compare two versions of an article and trace which act amended it, and when.',
    productCap4Title: 'Cody, the AI assistant',
    productCap4Desc:
      'It works on the case file, justifies every step with sources and follows your templates and your method.',
    productPanel1:
      'SprintAct search: the query "reclamo assicurativo autorità competente" and three results, the first being art. 7 of the Private Insurance Code.',
    productPanel2:
      'SprintAct case file "Reclamo assicurativo": documents, conversations, saved sources and saved searches.',
    productPanel3:
      'SprintAct, art. 7 of the Private Insurance Code in Compare mode: the deleted text in red, the new text in green, and the amending act, Legislative Decree 74/2015.',
    productPanel4:
      'Cody answers in the case file: the complaint goes to IVASS, with three cited sources and the original passage of art. 7 open beside the answer.',
    productCta: 'Discover SprintAct',

    visionLabel: 'Vision',
    visionTitle: 'From legal research to legal intelligence',
    visionDesc:
      "SprintAct is the first step. We want to turn law into structured, verifiable knowledge in which rules, versions and rulings are linked to each other. It is the basis on which Stele's next tools are born: from monitoring regulatory changes to supporting decisions.",
    visionNow: 'Today, with SprintAct',
    visionStep1Title: 'Research',
    visionStep1Desc: 'Which rule applies, in the right version, and how has it been interpreted?',
    visionStep2Title: 'Monitoring',
    visionStep2Desc: 'What is coming into force, and what will?',
    visionStep3Title: 'Impact',
    visionStep3Desc: 'How do new rules affect companies, processes and contracts?',
    visionStep4Title: 'Decision',
    visionStep4Desc: 'How to decide today, knowing how the legal framework may evolve?',

    missionLabel: 'Mission',
    missionTitle: 'Giving lawyers back the time for their craft',
    missionDesc:
      "A large part of a lawyer's day goes into looking for information, reconstructing legislation and keeping scattered documents in order. That time should go to legal reasoning, strategy and protecting the client. Stele was founded for this, and we believe technology should enhance the skills of the people who use it.",
    missionP1Title: 'Rigour',
    missionP1Desc: 'We start from the official texts and from the correct version of every rule.',
    missionP2Title: 'Reliability',
    missionP2Desc: 'Every answer points to the sources it comes from, and the reader can check it directly.',
    missionP3Title: 'Transparency',
    missionP3Desc: 'The professional always knows the scope of the search.',
    missionP4Title: 'The professional at the centre',
    missionP4Desc: "We build around the lawyer's method, and involve them in development.",

    teamLabel: 'Team',
    teamTitle: 'Four founders, from AI to the market',
    teamDesc:
      'We come from different backgrounds and share one goal: building tools a professional can trust.',
    teamHiring: 'We are looking for a lawyer to build SprintAct with us.',
    teamHiringLink: 'See the open position',

    contactTitle: "Let's talk",
    contactDesc:
      'Are you a lawyer, a firm or an institution and want to understand whether we can work together?',
    contactDesc2: 'Write to us: one of the founders will reply.',
    contactName: 'Name',
    contactEmail: 'Email',
    contactMessage: 'Message',
    contactSend: 'Send message',
    contactSending: 'Sending...',
    contactErrName: 'Enter your name.',
    contactErrEmail: 'Enter your email address.',
    contactErrEmailFormat: 'Enter a valid email address, for example name@domain.com.',
    contactErrMessage: 'Write a message.',
    contactFormErrors: 'The form has errors. Check the fields marked below.',
    contactLinks: 'Contacts',
    messageSent: 'Message sent!',
    messageSentDesc: "We've received your message and will respond shortly.",
    messageFailed: 'Message failed to send',
    messageFailedDesc: 'There was a problem sending your message. Please try again.',

    footerSite: 'Site',
    footerCompany: 'Company',
    footerInfo: 'Legal information',
    footerFollow: 'Follow us',
    footerLegalNotes: 'Legal notes',
    footerAddress: 'Italy',
    footerVat: 'VAT no.',
    footerLinks: 'Footer links',
    footerPrivacy: 'Privacy Policy',
    footerCookie: 'Cookie Policy',
  },
  it: {
    skipLink: 'Vai al contenuto',
    navMain: 'Principale',
    navHomeLabel: 'Stele, inizio pagina',
    navProduct: 'Prodotto',
    navVision: 'Visione',
    navMission: 'Mission',
    navTeam: 'Team',
    navContact: 'Contatti',
    navCareers: 'Lavora con noi',
    navBadge: '1 posizione aperta',
    ctaSprintAct: 'Scopri SprintAct',
    menuOpen: 'Apri il menu',
    menuClose: 'Chiudi il menu',
    langLabel: 'Cambia lingua',
    newTab: 'si apre in una nuova scheda',

    heroTitle: "Costruiamo l'intelligenza artificiale per chi lavora con il diritto",
    heroDesc:
      "Sviluppiamo software per avvocati e studi legali. L'AI cita le norme e le sentenze su cui si basa ogni risposta, e l'avvocato decide cosa usare.",
    heroCtaVision: 'La nostra visione',
    heroSteleSr:
      'La stele, simbolo di Stele, composta da quattro blocchi: Ricerca, Monitoraggio, Impatto, Decisione.',
    heroPhases: 'Le quattro fasi',
    heroProductCap: 'Il nostro prodotto',
    heroProductLink: 'SprintAct, il nostro prodotto: vai alla sezione',

    productLabel: 'Il nostro prodotto',
    productTitle: "SprintAct, lo spazio di lavoro dell'avvocato",
    productDesc:
      'Ricerca, fonti e fascicoli in un unico ambiente di lavoro. SprintAct cerca tra norme e sentenze partendo da una domanda in linguaggio naturale, mostra il testo in vigore alla data che ti serve e collega ogni disposizione alle decisioni che la citano.',
    productTabs: 'Capacità di SprintAct',
    productCap1Title: 'Ricerca in linguaggio naturale',
    productCap1Desc:
      'Scrivi la domanda come la faresti a un collega. SprintAct cerca nella normativa nazionale, regionale ed europea e nella giurisprudenza.',
    productCap2Title: 'Il fascicolo al centro',
    productCap2Desc:
      'Documenti, norme, sentenze e ricerche di una pratica vivono insieme. I documenti che carichi sono cifrati e li vedi solo tu.',
    productCap3Title: 'Le norme nel tempo',
    productCap3Desc:
      'Confronta due versioni di un articolo e ricostruisci quale atto lo ha modificato, e quando.',
    productCap4Title: "Cody, l'assistente AI",
    productCap4Desc:
      'Lavora sul fascicolo, motiva ogni passaggio con le fonti e segue i tuoi modelli e il tuo metodo.',
    productPanel1:
      "La ricerca di SprintAct: la domanda «reclamo assicurativo autorità competente» e tre risultati, il primo è l'art. 7 del Codice delle assicurazioni private.",
    productPanel2:
      'Il fascicolo «Reclamo assicurativo» in SprintAct: documenti, conversazioni, fonti salvate e ricerche salvate.',
    productPanel3:
      "SprintAct, l'art. 7 del Codice delle assicurazioni private in modalità Confronta: il testo eliminato in rosso, il testo nuovo in verde e l'atto che ha modificato la norma, il D.lgs. 74/2015.",
    productPanel4:
      "Cody risponde nel fascicolo: il reclamo va presentato all'IVASS, con tre fonti citate e il passaggio originale dell'art. 7 aperto accanto alla risposta.",
    productCta: 'Scopri SprintAct',

    visionLabel: 'Visione',
    visionTitle: 'Dalla ricerca legale alla legal intelligence',
    visionDesc:
      'SprintAct è il primo passo. Vogliamo trasformare il diritto in una conoscenza strutturata e verificabile, in cui norme, versioni e sentenze sono collegate tra loro. È la base su cui nascono i prossimi strumenti di Stele: dal monitoraggio delle novità normative fino al supporto alle decisioni.',
    visionNow: 'Oggi, con SprintAct',
    visionStep1Title: 'Ricerca',
    visionStep1Desc: 'Quale norma si applica, nella versione giusta, e come è stata interpretata?',
    visionStep2Title: 'Monitoraggio',
    visionStep2Desc: 'Cosa entra in vigore, e cosa entrerà?',
    visionStep3Title: 'Impatto',
    visionStep3Desc: 'Quali effetti hanno le nuove norme su imprese, processi e contratti?',
    visionStep4Title: 'Decisione',
    visionStep4Desc: 'Come decidere oggi, sapendo come potrebbe evolvere il quadro normativo?',

    missionLabel: 'Mission',
    missionTitle: "Restituire all'avvocato il tempo per il suo mestiere",
    missionDesc:
      'Una parte grande della giornata di un avvocato se ne va nel cercare informazioni, ricostruire la normativa e tenere in ordine documenti sparsi. Quel tempo dovrebbe andare al ragionamento giuridico, alla strategia e alla tutela del cliente. Stele è nata per questo, e crediamo che la tecnologia debba valorizzare le competenze di chi la usa.',
    missionP1Title: 'Rigore',
    missionP1Desc: 'Partiamo dai testi ufficiali e dalla versione corretta di ogni norma.',
    missionP2Title: 'Affidabilità',
    missionP2Desc: 'Ogni risposta rimanda alle fonti da cui nasce, e chi legge può controllarla direttamente.',
    missionP3Title: 'Trasparenza',
    missionP3Desc: 'Il professionista conosce sempre il perimetro della ricerca.',
    missionP4Title: 'Centralità del professionista',
    missionP4Desc: "Costruiamo attorno al metodo dell'avvocato, e lo coinvolgiamo nello sviluppo.",

    teamLabel: 'Team',
    teamTitle: "Quattro fondatori, dall'AI al mercato",
    teamDesc:
      'Veniamo da percorsi diversi e condividiamo lo stesso obiettivo: costruire strumenti di cui un professionista possa fidarsi.',
    teamHiring: 'Cerchiamo un avvocato che costruisca SprintAct con noi.',
    teamHiringLink: 'Vedi la posizione aperta',

    contactTitle: 'Parliamone',
    contactDesc:
      "Sei un avvocato, uno studio o un'istituzione e vuoi capire se possiamo lavorare insieme?",
    contactDesc2: 'Scrivici: ti risponde uno dei fondatori.',
    contactName: 'Nome',
    contactEmail: 'Email',
    contactMessage: 'Messaggio',
    contactSend: 'Invia messaggio',
    contactSending: 'Invio in corso...',
    contactErrName: 'Scrivi il tuo nome.',
    contactErrEmail: 'Scrivi il tuo indirizzo email.',
    contactErrEmailFormat: 'Scrivi un indirizzo email valido, ad esempio nome@dominio.com.',
    contactErrMessage: 'Scrivi un messaggio.',
    contactFormErrors: 'Il modulo contiene errori. Controlla i campi indicati sotto.',
    contactLinks: 'Contatti',
    messageSent: 'Messaggio inviato!',
    messageSentDesc: 'Abbiamo ricevuto il tuo messaggio e ti risponderemo a breve.',
    messageFailed: 'Invio non riuscito',
    messageFailedDesc: 'Si è verificato un problema. Riprova.',

    footerSite: 'Sito',
    footerCompany: 'Azienda',
    footerInfo: 'Informative',
    footerFollow: 'Seguici',
    footerLegalNotes: 'Note legali',
    footerAddress: 'Italia',
    footerVat: 'P. IVA',
    footerLinks: 'Collegamenti nel footer',
    footerPrivacy: 'Privacy Policy',
    footerCookie: 'Cookie Policy',
  }
};

type Language = 'en' | 'it';
type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'it';
  }

  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const lang of browserLanguages) {
    const normalized = lang.toLowerCase();
    if (normalized.startsWith('it')) return 'it';
    if (normalized.startsWith('en')) return 'en';
  }

  return 'it';
};

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'it';
  }

  try {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'it' || savedLanguage === 'en') {
      return savedLanguage;
    }
  } catch {
    /* storage can be blocked */
  }

  return detectBrowserLanguage();
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch {
      /* storage can be blocked */
    }
    // the lang attribute follows the language switch
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
