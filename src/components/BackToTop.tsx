
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when user scrolls down 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    
    // Clean up
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <Button 
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-lg 
                    bg-Stele-teal hover:bg-Stele-teal/90 dark:bg-Stele-teal dark:hover:bg-Stele-teal/90
                    text-white w-12 h-12 flex items-center justify-center"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </>
  );
};

export default BackToTop;
