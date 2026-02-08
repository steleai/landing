
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define all translations
export const translations = {
  en: {
    // Navbar
    home: "Home",
    about: "About",
    mission: "Mission",
    team: "Team",
    contact: "Contact",
    takeSurvey: "Take Survey",
    
    // Hero Section
    transformingData: "Transforming Italian public data",
    heroTitle: "Political knowledge at",
    heroTitleHighlight: "chat time",
    heroDesc: "Your needs matter! Share your opinion and help us revolutionise access to political information by building a tailor-made platform for professionals and citizens. Fill in the survey below, it only takes a couple of minutes",
    learnMore: "Learn More",
    takeOurSurvey: "Take our Survey",
    
    // About Section
    aboutUs: "About Stele",
    aboutDesc1: "We transform Italian public data into actionable insights.",
    aboutDesc2: "Our AI-powered platform provides government data intelligence through chatbots, visualization tools, and real-time analytics.",
    
    // Features
    chatbots: "AI Chatbots",
    chatbotsDesc: "Ask questions in natural language and get accurate information about Italian legislation, policies, and public data.",
    dataReports: "Data Reports",
    dataReportsDesc: "Generate comprehensive reports with visualizations to understand complex government data sets.",
    factChecking: "Fact Checking",
    factCheckingDesc: "Verify claims against official government sources with our automated fact-checking tools.",
    policySim: "Policy Simulations",
    policySimDesc: "Model potential outcomes of proposed policies with our simulation tools.",
    
    // Mission Section
    missionTitle: "Stele's Mission",
    missionDesc1: "Driving better decisions with the best data enhancing Transparency Through Technology. Our mission is to make government data not just accessible, but truly useful through AI-powered analysis.",
    missionDesc2: "We believe that accurate, accessible government information is essential for a functioning democracy and informed citizenry.",
    
    // Team Section
    aboutUsTeam: "About Us",
    dreamTeam: "The dream team",
    trustMe: "Trust me I'm an Engineer",
    
    // Contact Section
    contactUs: "Contact Us",
    contactDesc: "Have questions or want to learn more about Stele? Fill out the form below and we'll get back to you as soon as possible.",
    yourName: "Your Name",
    yourEmail: "Your Email",
    subject: "Subject",
    message: "Message",
    send: "Send Message",
    messageSent: "Message sent!",
    messageFailed: "Message failed to send. Please try again.",
    
    // Footer
    footerDescription: "Transforming Italian public data into actionable insights through AI-powered analytics.",
    allRights: "All Rights Reserved",
    quickLinks: "Quick Links",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    cookiePolicy: "Cookie Policy",
    termsOfService: "Terms of Service",
    ourLocation: "Our Location",
    basedIn: "Based in Milan",
    emailUs: "Email Us",
    forInquiries: "For general inquiries:",
    madeWith: "Made with ❤️ in Milan, Italy",
    
    // Back to Top
    backToTop: "Back to Top",

    // Goals
    StelesGoals: "Stele's Goals",
    nextStep: "The next step forward is one we'll take with you thanks to our features",
    aiChatbot: "AI Chatbot",
    customReports: "Custom Reports",
    aiChatbotDesc: "Intelligent chatbot that understands natural language and quickly searches for up-to-date information from official public sources (e.g. Official Gazette, circulars, accounting documents, speeches in Parliament).",
    customReportsDesc: "Generation of customised reports and documents, with choice of format, font, attachments, priority, and proactive suggestions to enrich content with verified information.",
    aiSummary: "AI Summary",
    aiSummaryDesc: "An AI-powered platform that transforms complex public political data into clear, concise summaries. By analyzing official records, reports, and legislative updates, it delivers timely insights that help users quickly understand policy developments and trends.",
  },
  it: {
    // Navbar
    home: "Home",
    about: "Obiettivi",
    mission: "Mission",
    team: "Team",
    contact: "Contatti",
    takeSurvey: "Compila il Sondaggio",
    
    // Hero Section
    transformingData: "Trasformiamo i dati pubblici italiani",
    heroTitle: "Conoscenza politica in",
    heroTitleHighlight: "tempo reale",
    heroDesc: "Le tue esigenze contano! Condividi la tua opinione e aiutaci a rivoluzionare l'accesso alle informazioni politiche creando una piattaforma su misura per professionisti e cittadini. Compila il sondaggio qui sotto, bastano solo un paio di minuti",
    learnMore: "Scopri di Più",
    takeOurSurvey: "Compila il Nostro Sondaggio",
    
    // About Section
    aboutUs: "Chi è Stele",
    aboutDesc1: "Trasformiamo i dati pubblici italiani in informazioni utili.",
    aboutDesc2: "La nostra piattaforma basata su IA fornisce intelligence sui dati governativi attraverso chatbot, strumenti di visualizzazione e analisi in tempo reale.",
    
    // Features
    chatbots: "Chatbot AI",
    chatbotsDesc: "Chatbot intelligente che comprende il linguaggio naturale e ricerca rapidamente informazioni aggiornate da fonti pubbliche ufficiali (ad esempio, Gazzetta Ufficiale, circolari, documenti contabili, discorsi in Parlamento).",
    dataReports: "Report Personalizzati",
    dataReportsDesc: "Generazione di report e documenti personalizzati, con scelta di formato, font, allegati, priorità e suggerimenti proattivi per arricchire i contenuti con informazioni verificate.",
    factChecking: "Fact Checking",
    factCheckingDesc: "Verifica le affermazioni rispetto alle fonti ufficiali del governo con i nostri strumenti automatici di fact-checking.",
    policySim: "Simulazioni Politiche",
    policySimDesc: "Modellare i potenziali risultati delle politiche proposte con i nostri strumenti di simulazione.",
    
    // Mission Section
    missionTitle: "Mission di Stele",
    missionDesc1: "Promuovere decisioni consapevoli grazie ai dati migliorando la trasparenza attraverso la tecnologia. La nostra missione è rendere i dati governativi non solo accessibili, ma anche realmente utili attraverso l'analisi fornita dall'intelligenza artificiale.",
    missionDesc2: "Crediamo che informazioni governative accurate e accessibili siano essenziali per una democrazia funzionante e per una cittadinanza informata.",
    
    // Team Section
    aboutUsTeam: "Chi Siamo",
    dreamTeam: "The dream team",
    trustMe: "Trust me I'm an Engineer",
    
    // Contact Section
    contactUs: "Contattaci",
    contactDesc: "Hai domande o vuoi saperne di più su Stele? Compila il modulo qui sotto e ti risponderemo il prima possibile.",
    yourName: "Il Tuo Nome",
    yourEmail: "La Tua Email",
    subject: "Oggetto",
    message: "Messaggio",
    send: "Invia Messaggio",
    messageSent: "Messaggio inviato!",
    messageFailed: "Invio del messaggio fallito. Per favore riprova.",
    
    // Footer
    footerDescription: "Trasformare i dati pubblici italiani in informazioni utili attraverso l'analisi fornita dalla IA",
    allRights: "Tutti i Diritti Riservati",
    quickLinks: "Link Rapidi",
    legal: "Legale",
    privacyPolicy: "Politica sulla Privacy",
    cookiePolicy: "Politica dei Cookies",
    termsOfService: "Termini di Servizio",
    ourLocation: "La Nostra Sede",
    basedIn: "Milano",
    emailUs: "Scrivici",
    forInquiries: "Per informazioni:",
    madeWith: "Realizzato con ❤️ a Milano, Italia",
    
    // Back to Top
    backToTop: "Torna in Cima",
    
    // Goals
    StelesGoals: "Obiettivi di Stele",
    nextStep: "Il prossimo passo avanti lo faremo insieme, grazie alle nostre funzionalità",
    aiChatbot: "Chatbot",
    customReports: "Report Personalizzati",
    aiChatbotDesc: "Chatbot intelligente che comprende il linguaggio naturale e cerca rapidamente informazioni aggiornate da fonti pubbliche ufficiali (ad es. Gazzetta Ufficiale, circolari, documenti contabili, discorsi in Parlamento).",
    customReportsDesc: "Generazione di report e documenti personalizzati, con scelta di formato, font, allegati, priorità e suggerimenti proattivi per arricchire i contenuti con informazioni verificate.",
    aiSummary: "Riassunti",
    aiSummaryDesc: "Una piattaforma basata sull’intelligenza artificiale che trasforma complessi dati politici pubblici in sintesi chiare e concise. Analizzando registri ufficiali, rapporti e aggiornamenti legislativi, fornisce approfondimenti tempestivi per comprendere rapidamente sviluppi e tendenze politiche.",
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
