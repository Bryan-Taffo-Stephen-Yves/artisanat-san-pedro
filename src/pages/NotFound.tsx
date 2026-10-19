import { Link } from "react-router-dom";
import AppShell from "@/components/AppShell";

const NotFound = () => (
  <AppShell>
    <div className="max-w-xl mx-auto px-4 py-20 md:py-28 text-center">
      <p className="text-sm font-semibold text-primary">Erreur 404</p>
      <h1 className="mt-3 text-[34px] md:text-5xl leading-tight">Cette page n'existe pas</h1>
      <p className="mt-4 text-base md:text-lg text-ink-soft leading-relaxed">
        Le lien est peut-être ancien, ou la création n'est plus en vente.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/boutique" className="h-[54px] px-7 inline-flex items-center justify-center rounded-full bg-primary hover:bg-[#8E4219] text-white text-base font-semibold transition-colors">
          Voir la boutique
        </Link>
        <Link to="/" className="h-[54px] px-7 inline-flex items-center justify-center rounded-full border border-ink/[0.18] bg-white text-base font-semibold">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  </AppShell>
);

export default NotFound;
