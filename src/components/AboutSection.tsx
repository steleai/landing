
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, FileText, CheckCircle, Layers, FileCog } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <MessageCircle className="h-6 w-6 text-Stele-teal" />,
      title: t('aiChatbot'),
      description: t('aiChatbotDesc')
    }, 
    {
      icon: <FileCog className="h-6 w-6 text-Stele-teal" />,
      title: t('aiSummary'),
      description: t('aiSummaryDesc')
    },
    {
      icon: <FileText className="h-6 w-6 text-Stele-teal" />,
      title: t('customReports'),
      description: t('customReportsDesc')
    }, 
    {
      icon: <CheckCircle className="h-6 w-6 text-Stele-teal" />,
      title: t('factChecking'),
      description: t('factCheckingDesc')
    }, 
    {
      icon: <Layers className="h-6 w-6 text-Stele-teal" />,
      title: t('policySim'),
      description: t('policySimDesc')
    }
  ];
  
  return (
    <section id="about" className="section-padding bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-6xl font-bold text-Stele-blue dark:text-white mb-4">{t('StelesGoals')}</h2>
          <p className="text-2xl text-gray-700 dark:text-gray-300">{t('nextStep')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-start" data-aos="fade-up" data-aos-delay={100 * index}>
              <Card className="w-full h-full card-effect group dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-Stele-teal/10 p-3 inline-flex mb-4 group-hover:bg-Stele-teal/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-md font-semibold mb-3 text-Stele-blue dark:text-white">{feature.title}</h3>
                  <p className="text-md text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
