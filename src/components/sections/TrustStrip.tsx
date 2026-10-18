import { Package, Plane, ShieldCheck, BadgeCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const TRUST_ITEMS = [
  {
    icon: Package,
    title: "Emballage soigné",
    description:
      "Chaque œuvre est emballée avec soin et protégée pour une livraison sans risque.",
  },
  {
    icon: Plane,
    title: "Livraison organisée",
    description:
      "L'équipe PACTE vous contacte après la commande pour convenir de la livraison.",
  },
  {
    icon: BadgeCheck,
    title: "Artisans certifiés PACTE",
    description:
      "Chaque créateur est vérifié et accompagné par l'équipe du programme PACTE San Pedro.",
  },
  {
    icon: ShieldCheck,
    title: "Paiements sécurisés",
    description:
      "Wave, Orange Money, MTN MoMo, Moov Money et Djamo, via Jèko. Aucun code saisi sur le site.",
  },
];

const TrustStrip = () => (
  <section className="px-6 py-12 bg-surface-container-low">
    <ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group rounded-bento p-6 bg-background/60 border border-border/20 hover:bg-background transition-colors duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
            </div>
            <h3 className="font-serif text-base text-inverse-surface mb-2">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  </section>
);

export default TrustStrip;
