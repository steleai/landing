import { useRef, useState } from 'react';
import { AlertCircle, Github, Linkedin, Mail, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { createUuid } from '@/lib/uuid';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactSection = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  // Reused on retry so the server sends at most one email; reset when the form changes.
  const key = useRef<string | null>(null);
  const api = import.meta.env.VITE_HIRING_API_URL;

  const validate = (form: FormData): Errors => {
    const found: Errors = {};
    if (!String(form.get('name') ?? '').trim()) found.name = t('contactErrName');
    const email = String(form.get('email') ?? '').trim();
    if (!email) found.email = t('contactErrEmail');
    else if (!EMAIL.test(email)) found.email = t('contactErrEmailFormat');
    if (!String(form.get('message') ?? '').trim()) found.message = t('contactErrMessage');
    return found;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !formRef.current) return;
    const form = new FormData(formRef.current);
    const found = validate(form);
    setErrors(found);
    const first = (['name', 'email', 'message'] as const).find((f) => found[f]);
    if (first) {
      formRef.current.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const body = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      message: String(form.get('message') ?? ''),
      website: String(form.get('website') ?? ''),
      locale: language,
    };
    setIsSubmitting(true);
    try {
      if (!api) throw new Error('VITE_HIRING_API_URL is not set');
      key.current ??= createUuid();
      const response = await fetch(`${api}/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key.current },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`contact ${response.status}`);
      toast({ title: t('messageSent'), description: t('messageSentDesc') });
      formRef.current?.reset();
      key.current = null;
    } catch (error) {
      console.error('Contact form failed', error);
      toast({ title: t('messageFailed'), description: t('messageFailedDesc'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;
  const field = (id: 'name' | 'email' | 'message') => ({
    id,
    name: id,
    'aria-invalid': errors[id] ? (true as const) : undefined,
    'aria-describedby': errors[id] ? `err-${id}` : undefined,
  });
  const error = (id: 'name' | 'email' | 'message') =>
    errors[id] ? (
      <p id={`err-${id}`} className="err">
        <AlertCircle aria-hidden="true" />
        <span>{errors[id]}</span>
      </p>
    ) : null;

  return (
    <section className="sec alt" id="contatti" aria-labelledby="h-contatti">
      <div className="c">
        <h2 id="h-contatti">{t('contactTitle')}</h2>
        <p className="sec-text">
          {t('contactDesc')}
          <br />
          {t('contactDesc2')}
        </p>

        <div className="contact-grid">
          <form
            ref={formRef}
            id="contact-form"
            className="form"
            noValidate
            onSubmit={handleSubmit}
            onChange={() => {
              key.current = null;
            }}
          >
            {/* Honeypot: invisible to people, filled by bots. */}
            <div aria-hidden="true" className="hp">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div role="alert">
              {hasErrors && <p className="form-summary">{t('contactFormErrors')}</p>}
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="name">{t('contactName')}</label>
                <input type="text" required maxLength={100} autoComplete="name" {...field('name')} />
                {error('name')}
              </div>
              <div className="field">
                <label htmlFor="email">{t('contactEmail')}</label>
                <input type="email" required maxLength={255} autoComplete="email" {...field('email')} />
                {error('email')}
              </div>
            </div>

            <div className="field">
              <label htmlFor="message">{t('contactMessage')}</label>
              <textarea required maxLength={1000} rows={5} {...field('message')} />
              {error('message')}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? t('contactSending') : (
                <>
                  {t('contactSend')}
                  <Send aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <ul className="contact-links" aria-label={t('contactLinks')}>
            <li>
              <a href="mailto:info@stele.it.com">
                <Mail aria-hidden="true" />
                info@stele.it.com
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/steleai/" target="_blank" rel="noopener noreferrer">
                <Linkedin aria-hidden="true" />
                <span>
                  LinkedIn<span className="sr-only"> ({t('newTab')})</span>
                </span>
              </a>
            </li>
            <li>
              <a href="https://www.github.com/Steleai" target="_blank" rel="noopener noreferrer">
                <Github aria-hidden="true" />
                <span>
                  GitHub<span className="sr-only"> ({t('newTab')})</span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
