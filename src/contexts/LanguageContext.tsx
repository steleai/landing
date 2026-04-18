import React, { createContext, useContext, useState, ReactNode } from 'react';

export const translations = {
  en: {
    navResearch: 'Research',
    navProducts: 'Products',
    navDevelopers: 'Development',
    navMissionTeam: 'Mission & Team',
    ctaTrySprintAct: 'Try SprintAct',

    heroEyebrow: 'AI-native legal technology for Italy',
    heroTitle: 'Stele builds trusted AI tools for the',
    heroTitleHighlight: 'Italian legal ecosystem',
    heroDesc:
      'We design legal tech products that make institutional and regulatory data easier to access, verify, and use in daily decisions. SprintAct is our first product line, developed to support legal research with speed and precision.',
    heroPrimaryCta: 'Explore the Product Vision',
    heroSecondaryCta: 'Try SprintAct',
    researchLabel: 'Research',
    researchTitle: 'Evidence, papers and case studies that build legal trust.',
    researchDesc:
      'Stele invests in research activity to strengthen credibility in the legal world. This section collects papers, case studies, and collaborations that document our methods and outcomes.',
    researchPoint1Title: 'Applied legal AI papers',
    researchPoint1Desc:
      'Publications on retrieval quality, source grounding, and explainability for legal AI systems in the Italian context.',
    researchPoint2Title: 'Case studies with institutions and firms',
    researchPoint2Desc:
      'Operational case studies that show how legal workflows improve when data quality, traceability, and automation are aligned.',
    researchPoint3Title: 'Open methodological notes',
    researchPoint3Desc:
      'Technical notes and working documents that clarify assumptions, limits, and benchmark choices behind our models.',

    productsLabel: 'Products',
    productsTitle: 'Introducing SprintAct: AI-native legal research software.',
    productsDesc:
      'SprintAct is built to help legal professionals search, compare, and validate legal sources in seconds. It combines language understanding, source attribution, and workflow support in one environment.',
    productsTaglinePrecision: 'PRECISION',
    productsTaglineSpeed: 'SPEED',
    productsTaglineVersatility: 'VERSATILITY',
    productsCta: 'Try SprintAct',
    productsNote:
      'SprintAct will run on its own domain at sprintact.eu while remaining part of Stele product strategy.',

    developersLabel: 'Developers / GitHub',
    developersTitle: 'Open material for builders and curious minds.',
    developersDesc:
      'We publish resources for developers and technical teams interested in our architecture and non-enriched data workflows.',
    developersPoint1:
      'Reference material about data ingestion and legal-source indexing pipelines for the Italian landscape.',
    developersPoint2:
      'Reusable utilities and examples that help teams test legal retrieval quality and prompt behavior.',
    developersPoint3:
      'Public repositories and notes designed to make our technical direction inspectable and discussable.',
    developersSecondary:
      'Our goal is to earn trust in the tech ecosystem through transparency and practical documentation.',
    developersCta: 'Visit our GitHub Organization',

    missionLabel: 'Mission',
    missionTitle: 'Responsible AI for a stronger information democracy.',
    missionDesc1:
      'Stele believes in a conscious use of AI to make institutional data truly accessible to companies and citizens.',
    missionDesc2:
      'Our mission is to support a democratic information system where legal knowledge is verifiable, usable, and open to informed participation.',

    aboutUsTeam: 'Team',
    dreamTeam: 'The dream team',
    trustMe: "Trust me I'm an Engineer",

    contactTitle: 'Contact Us',
    contactDesc: 'Tell us what you are building and how Stele can support your legal intelligence workflow.',
    contactName: 'Name',
    contactNamePlaceholder: 'Your name',
    contactEmail: 'Email',
    contactEmailPlaceholder: 'john@example.com',
    contactMessage: 'Message',
    contactMessagePlaceholder: 'Describe your context, use case, or partnership idea...',
    contactSend: 'Send Message',
    contactSending: 'Sending...',
    contactDirect: 'Direct contact',
    contactFollow: 'Follow Stele',
    contactNote:
      'We usually reply quickly to product requests, research collaborations, and institutional partnerships.',
    messageSent: 'Message sent!',
    messageSentDesc: "We've received your message and will respond shortly.",
    messageFailed: 'Message failed to send',
    messageFailedDesc: 'There was a problem sending your message. Please try again.',

    footerTagline: 'Stele - an AI and legal data company.',
    footerPrivacy: 'Privacy Policy',
    footerCookie: 'Cookie Policy',
    allRights: 'All Rights Reserved'
  },
  it: {
    navResearch: 'Ricerca',
    navProducts: 'Prodotti',
    navDevelopers: 'Sviluppo',
    navMissionTeam: 'Mission e Team',
    ctaTrySprintAct: 'Prova SprintAct',

    heroEyebrow: 'Legal tech AI-native per il mercato italiano',
    heroTitle: 'Stele costruisce strumenti AI affidabili per il',
    heroTitleHighlight: 'settore legale italiano',
    heroDesc:
      'Progettiamo prodotti legal tech che rendono i dati istituzionali e normativi piu accessibili, verificabili e utili nelle decisioni quotidiane. SprintAct e la nostra prima linea di prodotto, pensata per la ricerca legale con velocita e precisione.',
    heroPrimaryCta: 'Scopri la visione prodotto',
    heroSecondaryCta: 'Prova SprintAct',
    heroStat1: 'Focus societa: Stele e la piattaforma su cui costruiamo nel lungo periodo.',
    heroStat2: 'Focus prodotto: SprintAct, software AI-native per la ricerca legale.',
    heroStat3: 'Focus mercato: team legali, professionisti, istituzioni.',

    researchLabel: 'Ricerca',
    researchTitle: 'Paper, case study e ricerca applicata per costruire credibilita legale.',
    researchDesc:
      'Stele investe in attivita di ricerca per rafforzare la propria reputazione nel mondo giuridico. In questa sezione raccogliamo paper, case study e collaborazioni che documentano metodo e risultati.',
    researchPoint1Title: 'Paper su AI legale applicata',
    researchPoint1Desc:
      'Pubblicazioni su qualita del retrieval, grounding delle fonti ed explainability dei sistemi AI in ambito normativo italiano.',
    researchPoint2Title: 'Case study con studi e istituzioni',
    researchPoint2Desc:
      'Analisi operative che mostrano come migliorano i flussi di lavoro legali quando qualita del dato, tracciabilita e automazione sono allineate.',
    researchPoint3Title: 'Note metodologiche aperte',
    researchPoint3Desc:
      'Documenti tecnici e note di lavoro che chiariscono assunzioni, limiti e benchmark adottati nei nostri modelli.',

    productsLabel: 'Prodotti',
    productsTitle: 'Nasce SprintAct: software AI-native per la ricerca legale.',
    productsDesc:
      'SprintAct aiuta i professionisti del diritto a cercare, confrontare e validare fonti legali in pochi secondi. Unisce comprensione linguistica, attribuzione delle fonti e supporto al workflow in un unico ambiente.',
    productsTaglinePrecision: 'PRECISO',
    productsTaglineSpeed: 'VELOCE',
    productsTaglineVersatility: 'VERSATILE',
    productsCta: 'Prova SprintAct',
    productsNote:
      'SprintAct avra un dominio dedicato su sprintact.eu e restera parte centrale della strategia prodotto di Stele.',

    developersLabel: 'Sviluppo',
    developersTitle: 'Materiali aperti per developer e team tecnici.',
    developersDesc:
      'Condividiamo risorse utili a sviluppatori e persone curiose della nostra architettura e dei workflow dati non arricchiti.',
    developersPoint1:
      'Materiale di riferimento su pipeline di ingestione dati e indicizzazione di fonti legali nel contesto italiano.',
    developersPoint2:
      'Utility riutilizzabili ed esempi per testare retrieval legale e comportamento dei prompt.',
    developersPoint3:
      'Repository pubblici e note tecniche per rendere osservabile e discutibile la nostra direzione tecnologica.',
    developersSecondary:
      'Vogliamo costruire reputazione nel mondo tech attraverso trasparenza e documentazione concreta.',
    developersCta: 'Visita la nostra organizzazione GitHub',

    missionLabel: 'Missione',
    missionTitle: "Missione di Stele",
    missionDesc1:
      "Stele crede nell'uso consapevole della tecnologia AI per rendere accessibili i dati delle istituzioni a imprese e cittadinanza.",
    missionDesc2:
      "La nostra missione e favorire un sistema democratico dell'informazione, in cui la conoscenza legale sia verificabile, utile e aperta alla partecipazione informata.",

    aboutUsTeam: 'Team',
    dreamTeam: 'The dream team',
    trustMe: "Trust me I'm an Engineer",

    contactTitle: 'Contattaci',
    contactDesc: 'Raccontaci cosa stai costruendo e come Stele puo supportare il tuo workflow di legal intelligence.',
    contactName: 'Nome',
    contactNamePlaceholder: 'Il tuo nome',
    contactEmail: 'Email',
    contactEmailPlaceholder: 'nome@esempio.com',
    contactMessage: 'Messaggio',
    contactMessagePlaceholder: 'Descrivi il tuo contesto, caso d uso o idea di collaborazione...',
    contactSend: 'Invia messaggio',
    contactSending: 'Invio in corso...',
    contactDirect: 'Contatto diretto',
    contactFollow: 'Segui Stele',
    contactNote:
      'Rispondiamo rapidamente a richieste prodotto, collaborazioni di ricerca e partnership istituzionali.',
    messageSent: 'Messaggio inviato!',
    messageSentDesc: 'Abbiamo ricevuto il tuo messaggio e ti risponderemo a breve.',
    messageFailed: 'Invio non riuscito',
    messageFailedDesc: 'Si e verificato un problema durante l invio. Riprova.',

    footerTagline: 'Stele - azienda AI e legal data.',
    footerPrivacy: 'Privacy Policy',
    footerCookie: 'Cookie Policy',
    allRights: 'Tutti i diritti riservati'
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

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

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
