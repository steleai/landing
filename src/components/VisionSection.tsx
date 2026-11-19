import { useLanguage } from '@/contexts/LanguageContext';

const VisionSection = () => {
  const { t } = useLanguage();

  const steps = [1, 2, 3, 4].map((n) => ({
    title: t(`visionStep${n}Title` as 'visionStep1Title'),
    desc: t(`visionStep${n}Desc` as 'visionStep1Desc'),
  }));

  return (
    <section className="sec band" id="visione" aria-labelledby="h-visione">
      <div className="c">
        <p className="label">{t('visionLabel')}</p>
        <h2 id="h-visione">{t('visionTitle')}</h2>
        <p className="sec-text">{t('visionDesc')}</p>
        <ol className="steps">
          {steps.map((step, i) => (
            <li key={i} className={`step${i === 0 ? '' : ' next'}`}>
              <span className="n">
                <span aria-hidden="true">{`0${i + 1}`}</span>
                {i === 0 && <span className="tag now">{t('visionNow')}</span>}
              </span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default VisionSection;
