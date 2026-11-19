import { useLanguage } from '@/contexts/LanguageContext';

const MissionSection = () => {
  const { t } = useLanguage();
  const principles = [1, 2, 3, 4].map((n) => ({
    title: t(`missionP${n}Title` as 'missionP1Title'),
    desc: t(`missionP${n}Desc` as 'missionP1Desc'),
  }));

  return (
    <section className="sec alt" id="mission" aria-labelledby="h-mission">
      <div className="c">
        <p className="label">{t('missionLabel')}</p>
        <h2 id="h-mission">{t('missionTitle')}</h2>
        <p className="sec-text">{t('missionDesc')}</p>
        <ul className="principles">
          {principles.map((p) => (
            <li className="principle" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default MissionSection;
