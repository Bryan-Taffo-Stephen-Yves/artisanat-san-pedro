import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import HomePage from "./pages/HomePage";
import { useLenis } from "./hooks/useLenis";
import { WelcomeIntro } from "./components/ui/WelcomeIntro";

// Les pages hors accueil sont chargées à la demande : le premier
// chargement ne télécharge que le code de la page d'accueil.
const BoutiquePage = lazy(() => import("./pages/BoutiquePage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const ArtisansPage = lazy(() => import("./pages/ArtisansPage"));
const ArtisanProfilePage = lazy(() => import("./pages/ArtisanProfilePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ClientHubPage = lazy(() => import("./pages/ClientHubPage"));
const ArtisanDashboardPage = lazy(() => import("./pages/ArtisanDashboardPage"));
const ArtisanLoginPage = lazy(() => import("./pages/ArtisanLoginPage"));
const AIStudioPage = lazy(() => import("./pages/AIStudioPage"));
const DecouvertePage = lazy(() => import("./pages/DecouvertePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const PaymentReturnPage = lazy(() => import("./pages/PaymentReturnPage"));
const AIChatbot = lazy(() => import("./components/AIChatbot"));

const queryClient = new QueryClient();

const PageFallback = () => <div className="min-h-screen bg-background" />;

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/boutique" element={<BoutiquePage />} />
            <Route path="/boutique/:slug" element={<ProductDetailPage />} />
            <Route path="/artisans" element={<ArtisansPage />} />
            <Route path="/artisans/:slug" element={<ArtisanProfilePage />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/paiement/retour" element={<PaymentReturnPage />} />
            <Route path="/mon-espace" element={<ClientHubPage />} />
            <Route path="/espace-artisan/login" element={<ArtisanLoginPage />} />
            <Route path="/espace-artisan" element={<ArtisanDashboardPage />} />
            <Route path="/espace-artisan/ia-studio" element={<AIStudioPage />} />
            <Route path="/decouverte" element={<DecouvertePage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

// Écran de bienvenue : uniquement si le visiteur arrive par l'accueil
const HomeWelcome = () => {
  const location = useLocation();
  const [onHome] = useState(() => location.pathname === "/");
  return onHome ? <WelcomeIntro /> : null;
};

const App = () => {
  useLenis();

  // Filet de sécurité : si une image redimensionnée par Supabase échoue,
  // on retombe sur l'original (une seule écoute pour tout le site).
  useEffect(() => {
    const onError = (e: Event) => {
      const img = e.target as HTMLImageElement;
      if (img?.tagName !== "IMG" || !img.src.includes("/storage/v1/render/image/public/")) return;
      img.src = img.src.replace("/storage/v1/render/image/public/", "/storage/v1/object/public/").split("?")[0];
    };
    document.addEventListener("error", onError, true);
    return () => document.removeEventListener("error", onError, true);
  }, []);

  // Révélations au scroll ([data-san-scroll]) : un seul IntersectionObserver,
  // alimenté par un MutationObserver quand de nouveaux éléments apparaissent
  // (au lieu d'un scan du DOM toutes les secondes).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-50px 0px" }
    );

    let scheduled = false;
    const observe = () => {
      scheduled = false;
      document
        .querySelectorAll("[data-san-scroll]:not(.is-inview)")
        .forEach((el) => io.observe(el));
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(observe);
    };

    observe();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <HomeWelcome />
            <AnimatedRoutes />
            <Suspense fallback={null}>
              <AIChatbot />
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
