
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const TeamSection = () => {
  const [showMeme, setShowMeme] = useState(false);
  const { t } = useLanguage();
  
  const teamMembers = [
    {
      id: 1,
      name: "Alessandro Mariotti",
      role: "CEO",
      bio: "Automation Engineer & Political Scientist",
      image: "/lovable-uploads/alessandro.jpg"
    },
    {
      id: 2,
      name: "Romeo Odajiu",
      role: "CPO",
      bio: "Computer Science Engineer",
      image: "/lovable-uploads/romeo.jpg"
    },
    {
      id: 3,
      name: "Adam Amer",
      role: "CRO",
      bio: "Social Scientist & AI Engineer",
      image: "/lovable-uploads/adam.jpg"
    },
    {
      id: 4,
      name: "Simone Spreafico",
      role: "CTO",
      bio: "Cybersecurity Specialist",
      image: "/lovable-uploads/simone.jpg"
    }
  ];

  return (
    <section id="team" className="section-padding bg-slate-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-6xl font-bold text-Stele-blue dark:text-white mb-4">{t('aboutUsTeam')}</h2>
          <p className="text-2xl text-gray-700 dark:text-gray-300">
            {t('dreamTeam')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden card-effect dark:bg-gray-800 dark:border-gray-700">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-1 text-Stele-blue dark:text-white">{member.name}</h3>
                <p className="text-Stele-teal font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div 
            className="inline-block relative cursor-pointer"
            onMouseEnter={() => setShowMeme(true)}
            onMouseLeave={() => setShowMeme(false)}
          >
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 italic">
              "{t('trustMe')}"
            </p>
            {showMeme && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-4 z-50 w-80 shadow-xl rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
                <img 
                  src="/lovable-uploads/trust-me-i-am-an-engineer.jpeg" 
                  alt="Trust me I'm an Engineer" 
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
