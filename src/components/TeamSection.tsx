import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TeamSection = () => {
  const { t, language } = useLanguage();

  const teamMembers = [
    {
      id: 1,
      name: "Adam Amer",
      area: "AI, Data & Research",
      education: {
        it: "Magistrale in Artificial Intelligence, Università Bocconi",
        en: "MSc in Artificial Intelligence, Bocconi University"
      },
      image: "/team/adam.jpg"
    },
    {
      id: 2,
      name: "Simone Spreafico",
      area: "Infrastructure & Security",
      education: {
        it: "Sicurezza dei sistemi e delle reti informatiche, Università degli Studi di Milano",
        en: "Computer Systems and Network Security, University of Milan"
      },
      image: "/team/simone.jpg"
    },
    {
      id: 3,
      name: "Romeo Odajiu",
      area: "Product & Stakeholder Management",
      education: {
        it: "Magistrale in Ingegneria informatica, Università degli Studi di Bergamo",
        en: "MSc in Computer Engineering, University of Bergamo"
      },
      image: "/team/romeo.jpg"
    },
    {
      id: 4,
      name: "Alessandro Mariotti",
      area: "Business Development & Operations",
      education: {
        it: "Ingegneria dell'automazione, Politecnico di Milano",
        en: "Automation Engineering, Politecnico di Milano"
      },
      image: "/team/alessandro.jpg"
    }
  ];

  return (
    <section className="sec" id="team" aria-labelledby="h-team">
      <div className="c">
        <p className="label">{t('teamLabel')}</p>
        <h2 id="h-team">{t('teamTitle')}</h2>
        <p className="sec-text">{t('teamDesc')}</p>

        <ul className="team-grid">
          {teamMembers.map((member) => (
            <li className="member" key={member.id}>
              <img src={member.image} alt={member.name} width={600} height={600} loading="lazy" decoding="async" />
              <div className="body">
                <h3>{member.name}</h3>
                <p className="area">{member.area}</p>
                <p className="edu">{member.education[language]}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="hiring">
          <span>{t('teamHiring')}</span>
          <a className="textlink" href="/lavora-con-noi/">
            {t('teamHiringLink')}
            <ArrowRight aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
};

export default TeamSection;
