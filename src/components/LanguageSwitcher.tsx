import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const languages = [
  { code: 'it' as const, short: 'IT', name: 'Italiano' },
  { code: 'en' as const, short: 'EN', name: 'English' },
];

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();
  const current = languages.find((l) => l.code === language) ?? languages[0];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="lang-btn" aria-label={`${t('langLabel')}: ${current.name}`}>
          <span aria-hidden="true">{current.short}</span>
          <ChevronDown aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem] border-border bg-card text-foreground">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            lang={lang.code}
            onSelect={() => setLanguage(lang.code)}
            className="min-h-11 cursor-pointer gap-3 text-base"
            aria-current={lang.code === language ? 'true' : undefined}
          >
            <span className="w-6 font-semibold" aria-hidden="true">{lang.short}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
