import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { lenisInstance } from "@/hooks/useLenis";

// Bouton « retour en haut » : apparition en CSS (aucune librairie chargée)
const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    if (lenisInstance) lenisInstance.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-[10.5rem] right-5 md:right-6 z-[60] w-11 h-11 rounded-full bg-inverse-surface text-background flex items-center justify-center shadow-lg hover:bg-primary transition-[opacity,transform,background-color] duration-300 ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-90 pointer-events-none"
      }`}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTopButton;
