
import { useLanguage } from "@/contexts/LanguageContext";
import { FaInstagram, FaFacebook, FaReddit, FaLinkedin, FaTiktok, FaGithub } from "react-icons/fa";
import SerifLogoFooter from "./SerifLogoFooter";


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  
  return (
    <footer className="bg-Stele-blue text-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <SerifLogoFooter size={60} className="mr-2" />
            </div>
            <p className="text-white/80 mb-6 max-w-md">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/ai_Stele/"
                target="_blank"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              {/* <a 
                href="#" 
                target="_blank"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a> */}
              <a
                href="https://www.reddit.com/user/Stele_AI/"
                target="_blank"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Reddit"
              >
                <FaReddit size={20} />
              </a>
              <a 
                href="https://www.linkedin.com/company/Steleai/"
                target="_blank"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
              <a 
                href="https://www.github.com/Steleai"
                target="_blank"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={20} />
              </a>
              {/* <a 
                href="#" 
                target="_blank"
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok size={20} />
              </a> */}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-3">
              <li>
                <a href="#hero" className="text-white/80 hover:text-white transition-colors">{t('home')}</a>
              </li>
              <li>
                <a href="#about" className="text-white/80 hover:text-white transition-colors">{t('about')}</a>
              </li>
              <li>
                <a href="#team" className="text-white/80 hover:text-white transition-colors">{t('team')}</a>
              </li>
              <li>
                <a href="#contact" className="text-white/80 hover:text-white transition-colors">{t('contact')}</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('legal')}</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSe87e569hyTGlgu5EsJzcgSbebtvBSSo3EmoAQm12WIaojcuA/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {t('takeOurSurvey')}
                </a>
              </li>
              <li>
                <a href="https://www.iubenda.com/privacy-policy/94489167" target="_blank" className="text-white/80 hover:text-white transition-colors">{t('privacyPolicy')}</a>
              </li>
              <li>
                <a href="https://www.iubenda.com/privacy-policy/94489167/cookie-policy" target="_blank" className="text-white/80 hover:text-white transition-colors">{t('cookiePolicy')}</a>
              </li>
              {/* <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">{t('termsOfService')}</a>
              </li> */}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            &copy; {currentYear} Stele AI. {t('allRights')}.
          </p>
          <p className="text-white/60 text-sm mt-2 md:mt-0">
            {t('madeWith')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
