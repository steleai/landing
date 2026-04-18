import { useEffect, useRef, useState } from 'react';
import { Mail, Send, Github, Instagram, Linkedin } from 'lucide-react';
import { FaReddit } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const socialLinks = [
  { icon: Github, href: 'https://www.github.com/Steleai', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/Steleai/', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/ai_Stele/', label: 'Instagram' }
];

const ContactSection = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    emailjs.init({
      publicKey: 'tTgQA6D5gMLCdBaDC'
    });
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!formRef.current) {
      setIsSubmitting(false);
      return;
    }

    emailjs
      .sendForm('service_nxdvcml', 'contact_form', formRef.current)
      .then(() => {
        toast({
          title: t('messageSent'),
          description: t('messageSentDesc')
        });
        formRef.current?.reset();
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error('FAILED...', error);
        toast({
          title: t('messageFailed'),
          description: t('messageFailedDesc'),
          variant: 'destructive'
        });
        setIsSubmitting(false);
      });
  };

  return (
    <section id="contact" className="section-padding relative bg-slate-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14" data-aos="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-Stele-blue dark:text-white">{t('contactTitle')}</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">{t('contactDesc')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <form
            ref={formRef}
            id="contact-form"
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-6 sm:p-8 space-y-6"
            data-aos="fade-up"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="text-sm text-muted-foreground mb-2 block">
                  {t('contactName')}
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={100}
                  placeholder={t('contactNamePlaceholder')}
                  className="bg-secondary/70 border-border"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm text-muted-foreground mb-2 block">
                  {t('contactEmail')}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  placeholder={t('contactEmailPlaceholder')}
                  className="bg-secondary/70 border-border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="text-sm text-muted-foreground mb-2 block">
                {t('contactMessage')}
              </label>
              <Textarea
                id="message"
                name="message"
                required
                maxLength={1000}
                rows={5}
                placeholder={t('contactMessagePlaceholder')}
                className="bg-secondary/70 border-border resize-none"
              />
            </div>

            <Button
              type="submit"
              className="rounded-full px-8 w-full sm:w-auto bg-Stele-blue hover:bg-Stele-blue/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('contactSending') : (
                <>
                  {t('contactSend')}
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="flex flex-col justify-center space-y-8" data-aos="fade-up" data-aos-delay={100}>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-Stele-blue dark:text-white">{t('contactDirect')}</h3>
              <a
                href="mailto:info@stele.it.com"
                className="inline-flex items-center gap-3 text-Stele-blue dark:text-Stele-teal hover:underline text-lg"
              >
                <Mail className="h-5 w-5" />
                info@stele.it.com
              </a>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-Stele-blue dark:text-white">{t('contactFollow')}</h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-12 h-12 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-Stele-blue dark:hover:text-Stele-teal hover:border-Stele-blue/30 dark:hover:border-Stele-teal/30 transition-colors"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
                <a
                  href="https://www.reddit.com/user/Stele_AI/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Reddit"
                  className="w-12 h-12 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-Stele-blue dark:hover:text-Stele-teal hover:border-Stele-blue/30 dark:hover:border-Stele-teal/30 transition-colors"
                >
                  <FaReddit className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">{t('contactNote')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
