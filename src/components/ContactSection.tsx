
import { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Mail, MapPin, Send } from "lucide-react";
import emailjs from '@emailjs/browser';
import { useLanguage } from "@/contexts/LanguageContext";

const ContactSection = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init({
      publicKey: "tTgQA6D5gMLCdBaDC",
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Send email using EmailJS
    if (formRef.current) {
      emailjs.sendForm('service_nxdvcml', 'contact_form', formRef.current)
        .then(() => {
          toast({
            title: t('messageSent'),
            description: "We've received your message and will respond shortly.",
          });
          
          // Reset form
          setFormData({
            name: '',
            email: '',
            message: ''
          });
          setIsSubmitting(false);
        })
        .catch((error) => {
          console.error('FAILED...', error);
          toast({
            title: t('messageFailed'),
            description: "There was a problem sending your message. Please try again.",
            variant: "destructive"
          });
          setIsSubmitting(false);
        });
    }
  };

  return (
    <section id="contact" className="section-padding bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-6xl font-bold text-Stele-blue dark:text-white mb-4">{t('contactUs')}</h2>
          <p className="text-2xl text-gray-700 dark:text-gray-300">
            {t('contactDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <div className="bg-slate-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="flex space-x-4 items-start">
                <div className="bg-Stele-teal/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-Stele-teal" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-Stele-blue dark:text-white mb-1">{t('emailUs')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{t('forInquiries')}</p>
                  <a href="mailto:info@Steleai.eu" className="text-Stele-teal hover:underline">info@Steleai.eu</a>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="flex space-x-4 items-start">
                <div className="bg-Stele-teal/10 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-Stele-teal" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-Stele-blue dark:text-white mb-1">{t('ourLocation')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('basedIn')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form 
              ref={formRef}
              id="contact-form"
              onSubmit={handleSubmit} 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-6 text-Stele-blue dark:text-white">{t('send')}</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('yourName')}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full dark:bg-gray-700 dark:border-gray-600"
                      placeholder={t('yourName')}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('yourEmail')}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full dark:bg-gray-700 dark:border-gray-600"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('message')}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full dark:bg-gray-700 dark:border-gray-600"
                    placeholder={`${t('message')}...`}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-Stele-blue hover:bg-Stele-blue/90 dark:bg-Stele-teal dark:hover:bg-Stele-teal/90"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-4 w-4" />
                      {t('send')}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
