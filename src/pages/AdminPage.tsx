import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem, scaleReveal } from "@/lib/motionVariants";
import {
  ArrowLeft, Info, Clock, Sparkles, Timer, ShoppingBag, Eye, Heart, UserPlus,
  AlertTriangle, TrendingDown, UserX, TrendingUp, Download, FileText, Share2, Mail,
  MessageCircle
} from "lucide-react";

/* ────────────────────── PASSWORD GATE ────────────────────── */
const PasswordGate = ({ onSuccess }: { onSuccess: () => void }) => {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (pw === "pacte2026") {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(var(--inverse-surface))] flex items-center justify-center px-6">
      <div className={`text-center w-full max-w-sm ${shake ? "animate-[shake_0.4s_ease]" : ""}`}>
        <span className="font-serif text-3xl italic text-[hsl(36,50%,97%)]">Accès Réservé</span>
        <p className="text-[10px] uppercase tracking-widest text-[hsl(22,82%,33%)] mt-2 mb-8">
          Artisanat San Pedro · Admin
        </p>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Mot de passe administrateur"
          className="w-full bg-[hsl(var(--inverse-surface))] border border-[hsl(36,50%,97%,0.2)] rounded-full px-5 py-3 text-[hsl(36,50%,97%)] placeholder:text-[hsl(36,50%,97%,0.4)] outline-none focus:border-primary text-sm"
        />
        {error && <p className="text-destructive text-xs mt-2">Mot de passe incorrect</p>}
        <button
          onClick={submit}
          className="mt-4 w-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full py-3 uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition-all"
        >
          Accéder
        </button>
      </div>
    </div>
  );
};

/* ────────────────────── ANIMATED PROGRESS BAR ────────────────────── */
const AnimatedBar = ({ target, delay = 0 }: { target: number; delay?: number }) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.min(target, 100)), 100 + delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return (
    <div className="w-full h-2 bg-[hsl(var(--surface-container))] rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary to-[hsl(22,60%,55%)] rounded-full transition-all duration-[1.2s] ease-out"
        style={{ width: `${w}%` }}
      />
    </div>
  );
};

/* ────────────────────── FUNNEL BAR ────────────────────── */
const FunnelBar = ({ pct, count, delay }: { pct: number; count: number; delay: number }) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 100 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div
      className="rounded-full h-8 bg-gradient-to-r from-primary to-[hsl(22,60%,55%)] relative transition-all duration-[1.2s] ease-out"
      style={{ width: `${w}%`, minWidth: "3rem" }}
    >
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground text-[10px] font-bold">
        {count}
      </span>
    </div>
  );
};

/* ────────────────────── COUNT-UP ────────────────────── */
const CountUp = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setVal(Math.floor(p * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{val.toLocaleString("fr-FR")}</span>;
};

/* ────────────────────── SECTION WRAPPER (stagger) ────────────────────── */
const Section = ({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) => (
  <div
    className={`opacity-0 animate-[fadeUp_0.5s_ease_forwards] ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

/* ────────────────────── MAP SVG ────────────────────── */
const ArtisanMap = () => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; metier: string } | null>(null);
  const dots = [
    { cx: 120, cy: 80, name: "Kofi Asante", metier: "Sculpture" },
    { cx: 200, cy: 120, name: "Fatou Diallo", metier: "Poterie" },
    { cx: 80, cy: 160, name: "Aya Coulibaly", metier: "Tressage" },
    { cx: 260, cy: 90, name: "Moussa Traoré", metier: "Forge" },
    { cx: 160, cy: 200, name: "Abou Koné", metier: "Peinture" },
    { cx: 300, cy: 160, name: "Amara Koné", metier: "Tissage" },
    { cx: 220, cy: 220, name: "Ibrahim Soro", metier: "Bijouterie" },
    { cx: 100, cy: 240, name: "Marie Koua", metier: "Vannerie" },
  ];
  return (
    <div className="relative">
      <svg viewBox="0 0 400 300" className="w-full rounded-[2rem]" style={{ background: "hsl(33,35%,94%)" }}>
        {/* Coastline */}
        <path d="M0 250 Q80 230 160 260 Q240 280 320 240 Q360 220 400 250 L400 300 L0 300Z" fill="hsl(33,25%,88%)" />
        {/* Roads */}
        <line x1="50" y1="100" x2="350" y2="180" stroke="hsl(20,30%,80%)" strokeWidth="1.5" />
        <line x1="180" y1="40" x2="200" y2="260" stroke="hsl(20,30%,80%)" strokeWidth="1.5" />
        {/* City label */}
        <text x="180" y="155" textAnchor="middle" fontFamily="'Oswald', sans-serif" fontStyle="italic" fontSize="13" fill="hsl(50,8%,10%)">
          San Pedro
        </text>
        {/* Dots */}
        {dots.map((d, i) => (
          <g key={i} onClick={() => setTooltip(tooltip?.name === d.name ? null : { x: d.cx, y: d.cy, name: d.name, metier: d.metier })} className="cursor-pointer">
            <circle cx={d.cx} cy={d.cy} r="12" fill="none" stroke="#C3622D" strokeOpacity="0.3" className="animate-[mapPulse_2s_ease_infinite]" />
            <circle cx={d.cx} cy={d.cy} r="5" fill="#C3622D" />
          </g>
        ))}
      </svg>
      {tooltip && (
        <div
          className="glass-card absolute z-10 rounded-xl p-3 shadow-lg"
          style={{ left: `${(tooltip.x / 400) * 100}%`, top: `${(tooltip.y / 300) * 100 - 15}%`, transform: "translate(-50%,-100%)" }}
        >
          <p className="font-serif text-sm">{tooltip.name}</p>
          <p className="text-[9px] uppercase text-primary tracking-widest">{tooltip.metier}</p>
          <span className="flex items-center gap-1 text-[8px] text-green-600 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Actif
          </span>
        </div>
      )}
    </div>
  );
};

/* ────────────────────── FEED DATA ────────────────────── */
type FeedEvent = { icon: string; title: string; detail: string; time: string };

const seedEvents: FeedEvent[] = [
  { icon: "cart", title: "Commande complétée", detail: "Masque Baoulé · 45 000 FCFA", time: "il y a 1 min" },
  { icon: "chat", title: "Chat IA", detail: "Question: livraison internationale", time: "il y a 3 min" },
  { icon: "view", title: "Vue produit", detail: "Vase Sénoufo · Fatou Diallo", time: "il y a 4 min" },
  { icon: "fav", title: "Ajout favori", detail: "Statue Dan · Kofi Asante", time: "il y a 7 min" },
  { icon: "cart", title: "Panier abandonné", detail: "Pagne Baoulé · 15 000 FCFA", time: "il y a 9 min" },
  { icon: "new", title: "Nouvel artisan", detail: "Amara Koné · Tissage", time: "il y a 12 min" },
];

const cycleEvents: Omit<FeedEvent, "time">[] = [
  { icon: "view", title: "Nouvelle vue", detail: "Bracelet Akan · Moussa Traoré" },
  { icon: "cart", title: "Commande initiée", detail: "Écharpe Bogolan · 12 000 FCFA" },
  { icon: "chat", title: "Chat IA", detail: "Question: délai de livraison vers Paris" },
  { icon: "cart", title: "Ajout panier", detail: "Masque Dan · 72 000 FCFA" },
];

const feedIconMap: Record<string, { bg: string; color: string; Icon: typeof ShoppingBag }> = {
  cart: { bg: "bg-green-100", color: "text-green-700", Icon: ShoppingBag },
  view: { bg: "bg-blue-100", color: "text-blue-700", Icon: Eye },
  chat: { bg: "bg-primary/10", color: "text-primary", Icon: Sparkles },
  fav: { bg: "bg-red-100", color: "text-red-500", Icon: Heart },
  new: { bg: "bg-amber-100", color: "text-amber-700", Icon: UserPlus },
};

/* ────────────────────── MAIN DASHBOARD ────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [feed, setFeed] = useState<FeedEvent[]>(seedEvents);
  const cycleIdx = useRef(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const ev = cycleEvents[cycleIdx.current % cycleEvents.length];
      cycleIdx.current++;
      setFeed((prev) => [{ ...ev, time: "à l'instant" }, ...prev].slice(0, 8));
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  const showToast = useCallback(() => toast("Fonctionnalité disponible en production"), []);

  const objectives = [
    { name: "Croissance mensuelle visiteurs", current: "+11%", target: "+15%/mois", pct: 73, ok: false },
    { name: "Taux de rebond", current: "52%", target: "< 45%", pct: 55, ok: false },
    { name: "Durée moyenne de session", current: "2min 34s", target: "> 3min", pct: 85, ok: true },
    { name: "Transactions complètes", current: "68%", target: "> 75%", pct: 90, ok: true },
    { name: "Panier moyen", current: "34 500 FCFA", target: "> 30 000 FCFA", pct: 100, ok: true, exceeded: true },
    { name: "Artisans avec ventes actives", current: "142/240", target: "180 artisans", pct: 79, ok: false },
  ];

  const funnel = [
    { label: "Visiteurs", count: 1847, pct: 100, display: "100%" },
    { label: "Vues produit", count: 1203, pct: 65, display: "65%" },
    { label: "Panier", count: 487, pct: 26, display: "26%" },
    { label: "Checkout", count: 312, pct: 17, display: "17%" },
    { label: "Complétées", count: 214, pct: 11.6, display: "11.6%" },
  ];

  const topArtisans = [
    { name: "Kofi Asante", metier: "Sculpture", rev: "487 000 FCFA", trend: "↑+23%", up: true },
    { name: "Fatou Diallo", metier: "Poterie", rev: "312 000 FCFA", trend: "↑+18%", up: true },
    { name: "Aya Coulibaly", metier: "Tressage", rev: "278 000 FCFA", trend: "↑+9%", up: true },
    { name: "Moussa Traoré", metier: "Forge", rev: "195 000 FCFA", trend: "↓-3%", up: false },
    { name: "Abou Koné", metier: "Peinture", rev: "143 000 FCFA", trend: "↑+31%", up: true },
  ];

  const faq = [
    { q: "Quels sont les délais de livraison ?", n: 18 },
    { q: "Acceptez-vous Wave Money ?", n: 14 },
    { q: "Comment devenir artisan sur la plateforme ?", n: 11 },
    { q: "Puis-je commander depuis la France ?", n: 9 },
    { q: "Comment retourner un produit ?", n: 6 },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--surface))]">
      {/* Sticky header */}
      <header className="fixed top-0 w-full z-40 glass-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <span className="font-serif text-base italic">Admin · Tableau de bord</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest bg-[hsl(var(--surface-container))] rounded-full px-3 py-1 font-bold">Avril 2026</span>
      </header>

      <div className="max-w-2xl lg:max-w-4xl mx-auto px-6 pb-16 pt-24 space-y-8">

        {/* Demo disclaimer */}
        <Section delay={0}>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-center gap-3">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700 font-light">Données de démonstration · Les métriques seront connectées en temps réel via le backend en production.</p>
          </div>
        </Section>

        {/* S1 — HERO */}
        <Section delay={100}>
          <ScrollReveal variants={scaleReveal}>
          <div className="rounded-[2rem] p-7 relative overflow-hidden" style={{ backgroundColor: "#1A2D1A" }}>
            <div className="absolute right-0 top-0 w-48 h-48 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: "rgba(153,66,13,0.18)" }} />
            <div className="absolute left-0 bottom-0 w-32 h-32 rounded-full translate-y-1/2 -translate-x-1/2" style={{ backgroundColor: "rgba(139,26,26,0.18)" }} />
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Programme PACTE · San Pedro</p>
              <h1 className="font-serif text-3xl italic text-[hsl(36,50%,97%)]">
                Le Poste de <span className="text-primary">Commandement</span>
              </h1>
              <p className="text-sm text-[hsl(36,50%,97%,0.6)] font-light mt-2">Tableau de bord opérationnel — Avril 2026</p>
              <motion.div
                className="grid grid-cols-3 gap-3 mt-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
              >
                {[
                  { node: <AnimatedNumber value={2340000} />, l: "FCFA reversés artisans", c: "#C3622D" },
                  { node: <AnimatedNumber value={240} />, l: "Artisans actifs", c: "#D28962" },
                  { node: <AnimatedNumber value={1847} />, l: "Œuvres en ligne", c: "#A55427" },
                ].map(({ node, l, c }) => (
                  <motion.div key={l} variants={staggerItem} className="bg-white/5 rounded-xl p-4 text-center border-t-2" style={{ borderTopColor: c }}>
                    <div className="font-serif text-2xl" style={{ color: c }}>{node}</div>
                    <div className="text-[8px] uppercase tracking-widest text-[hsl(36,50%,97%,0.5)] mt-1">{l}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
          </ScrollReveal>
        </Section>

        {/* S2 — OBJECTIFS */}
        <Section delay={200}>
          <h2 className="font-serif text-xl italic mb-1">Objectifs & Performance</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">Cibles chiffrées · Évaluation objective — 3 premiers mois</p>
          <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-6 shadow-[0_20px_40px_rgba(14,13,13,0.04)]">
            <div className="space-y-5">
              {objectives.map((o, i) => (
                <div key={o.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">{o.name}</span>
                    <span className="text-sm font-serif text-primary">{o.current} / {o.target}</span>
                  </div>
                  <AnimatedBar target={o.pct} delay={i * 100} />
                  <div className="flex justify-between text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
                    <span>Actuel : {o.current}</span>
                    <span className={o.exceeded ? "text-green-600" : o.ok ? "text-green-600" : "text-destructive"}>
                      Cible : {o.target} {o.exceeded && "✓ Objectif atteint"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mt-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-light">
                2 indicateurs sous objectif ce mois. Le taux de rebond et la croissance visiteurs requièrent une action marketing. Recommandation : activer les campagnes réseaux sociaux et le référencement local.
              </p>
            </div>
          </div>
        </Section>

        {/* S3 — FUNNEL */}
        <Section delay={300}>
          <h2 className="font-serif text-xl italic mb-1">Funnel de Conversion</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">Transactions initiées vs complètes · Ce mois</p>
          <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-6">
            <div className="flex flex-col gap-3">
              {funnel.map((f, i) => (
                <div key={f.label} className="flex items-center gap-4">
                  <span className="w-28 text-[9px] uppercase tracking-widest text-muted-foreground text-right flex-shrink-0">{f.label}</span>
                  <div className="flex-1"><FunnelBar pct={f.pct} count={f.count} delay={i * 150} /></div>
                  <span className="text-sm font-serif flex-shrink-0 w-12 text-right">{f.display}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6 flex-wrap">
              <span className="bg-destructive/10 text-destructive px-4 py-2 rounded-full text-[10px] font-bold">Taux d'abandon panier : 56%</span>
              <span className="bg-[hsl(var(--surface-container))] px-4 py-2 rounded-full text-[10px] font-bold">Panier moyen : 34 500 FCFA</span>
            </div>
          </div>
        </Section>

        {/* S4 — BENTO METRICS */}
        <Section delay={400}>
          <h2 className="font-serif text-xl italic mb-1">Activité Plateforme</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">Métriques en temps réel</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Live visitors */}
            <div className="bg-primary rounded-[1.5rem] p-5">
              <div className="text-[8px] uppercase tracking-widest text-primary-foreground/70 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> EN DIRECT
              </div>
              <div className="font-serif text-4xl text-primary-foreground mt-1"><AnimatedNumber value={23} duration={800} /></div>
              <div className="text-[9px] uppercase text-primary-foreground/60">Visiteurs actifs</div>
              <svg viewBox="0 0 100 30" className="mt-2 w-full opacity-30">
                <path d="M0 20 Q10 10 20 18 Q30 25 40 12 Q50 5 60 15 Q70 22 80 10 Q90 18 100 14" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            {/* Sessions */}
            <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-5">
              <Clock className="w-4 h-4 text-primary mb-2" />
              <div className="font-serif text-3xl"><AnimatedNumber value={184} /></div>
              <div className="text-[9px] uppercase text-muted-foreground">Sessions aujourd'hui</div>
              <p className="text-[9px] text-green-600 font-bold mt-1">↑ +12% vs hier</p>
            </div>
            {/* AI chats */}
            <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-5">
              <Sparkles className="w-4 h-4 text-primary mb-2" />
              <div className="font-serif text-3xl"><AnimatedNumber value={67} /></div>
              <div className="text-[9px] uppercase text-muted-foreground">Chats IA ce mois</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-green-600 font-bold">👍 89%</span>
                <span className="text-[9px] text-muted-foreground">👎 11%</span>
              </div>
            </div>
            {/* Duration */}
            <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-5">
              <Timer className="w-4 h-4 text-primary mb-2" />
              <div className="font-serif text-3xl">2:34</div>
              <div className="text-[9px] uppercase text-muted-foreground">Durée moy. session</div>
              <p className="text-[9px] text-amber-600 mt-1">Cible : 3:00</p>
            </div>
          </div>
        </Section>

        {/* S5 — LIVE FEED */}
        <Section delay={500}>
          <h2 className="font-serif text-xl italic mb-1">Activité Récente</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Flux en temps réel</p>
          <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-5">
            {feed.slice(0, 6).map((ev, i) => {
              const meta = feedIconMap[ev.icon] || feedIconMap.view;
              return (
                <div key={`${ev.title}-${ev.detail}-${i}`} className="flex items-center gap-4 py-3 border-b border-border/10 last:border-0 animate-[fadeUp_0.3s_ease]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
                    <meta.Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{ev.detail}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground flex-shrink-0">{ev.time}</span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* S6 — MAP */}
        <Section delay={600}>
          <h2 className="font-serif text-xl italic mb-1">Présence Territoriale</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Artisans actifs · Région de San Pedro</p>
          <div className="bg-[hsl(var(--surface-container-low))] rounded-[2rem] overflow-hidden">
            <ArtisanMap />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[["6", "Quartiers couverts"], ["12km²", "Zone d'activité"], ["100%", "San Pedro"]].map(([v, l]) => (
              <div key={l} className="bg-[hsl(var(--surface-container-low))] rounded-xl p-4 text-center">
                <div className="font-serif text-xl">{v}</div>
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* S7 — TOP ARTISANS */}
        <Section delay={700}>
          <h2 className="font-serif text-xl italic mb-1">Top Artisans</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">Ce mois · Classement par revenus générés</p>
          <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-5 space-y-4">
            {topArtisans.map((a, i) => (
              <div key={a.name} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? "bg-primary text-primary-foreground" : "bg-[hsl(var(--surface-container))]"}`}>
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--surface-container))] flex-shrink-0 flex items-center justify-center font-serif italic text-lg text-muted-foreground">
                  {a.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm">{a.name}</p>
                  <p className="text-[9px] uppercase tracking-widest text-primary">{a.metier}</p>
                </div>
                <span className="font-serif text-base text-primary flex-shrink-0">{a.rev}</span>
                <span className={`text-[9px] font-bold flex-shrink-0 ${a.up ? "text-green-600" : "text-destructive"}`}>{a.trend}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* S8 — AI HEALTH */}
        <Section delay={800}>
          <h2 className="font-serif text-xl italic mb-1">Intelligence Artificielle</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">Santé du chatbot · Ce mois</p>
          <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-6">
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[hsl(var(--surface-container))] rounded-xl p-4 text-center">
                <div className="font-serif text-2xl"><AnimatedNumber value={67} /></div>
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground mt-1">Conversations</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="font-serif text-2xl text-green-800">89%</div>
                <div className="text-[8px] uppercase tracking-widest text-green-700 mt-1">Satisfaction</div>
              </div>
              <div className="bg-[hsl(var(--surface-container))] rounded-xl p-4 text-center">
                <div className="font-serif text-2xl">1m 23s</div>
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground mt-1">Tps moy. réponse</div>
              </div>
            </div>
            <p className="text-[10px] uppercase text-muted-foreground mb-3 tracking-widest">Questions les plus posées</p>
            <div className="space-y-3">
              {faq.map((f) => (
                <div key={f.q} className="flex items-center justify-between">
                  <span className="text-sm font-light truncate pr-4">{f.q}</span>
                  <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[9px] font-bold flex-shrink-0">{f.n}x</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* S9 — ALERTS */}
        <Section delay={900}>
          <h2 className="font-serif text-xl italic mb-4">Alertes Système</h2>
          <div className="space-y-3">
            {[
              { bg: "bg-red-50 border border-red-200", iconBg: "bg-red-100", iconColor: "text-red-600", Icon: AlertTriangle, title: "Stock critique — Masque Dan", desc: "Kofi Asante · 1 exemplaire restant. Risque de rupture sous 48h.", action: "Contacter artisan →" },
              { bg: "bg-amber-50 border border-amber-200", iconBg: "bg-amber-100", iconColor: "text-amber-700", Icon: TrendingDown, title: "Taux de rebond élevé", desc: "52% ce mois vs objectif 45%. Recommandation : améliorer la page d'accueil mobile.", action: "Voir le rapport →" },
              { bg: "bg-amber-50 border border-amber-200", iconBg: "bg-amber-100", iconColor: "text-amber-700", Icon: UserX, title: "3 artisans sans vente", desc: "Amara Koné, Ibrahim Soro, Marie Koua · Inactifs depuis 30+ jours.", action: "Relancer →" },
              { bg: "bg-green-50 border border-green-200", iconBg: "bg-green-100", iconColor: "text-green-700", Icon: TrendingUp, title: "Panier moyen en hausse", desc: "34 500 FCFA · +14% vs mois dernier. Objectif dépassé ✓", action: "Voir détails →" },
              { bg: "bg-blue-50 border border-blue-200", iconBg: "bg-blue-100", iconColor: "text-blue-700", Icon: Sparkles, title: "Chatbot IA performant", desc: "89% de satisfaction · 67 conversations ce mois. Aucune erreur détectée.", action: "Rapport IA →" },
            ].map((a) => (
              <div key={a.title} className={`flex items-start gap-4 rounded-[1.5rem] p-5 ${a.bg}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${a.iconBg} ${a.iconColor}`}>
                  <a.Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{a.title}</p>
                  <p className="text-xs font-light mt-1">{a.desc}</p>
                </div>
                <button onClick={showToast} className="text-[9px] uppercase font-bold underline cursor-pointer flex-shrink-0 mt-1">{a.action}</button>
              </div>
            ))}
          </div>
        </Section>

        {/* S10 — IMPACT */}
        <Section delay={1000}>
          <div className="rounded-[2rem] p-8 text-center relative overflow-hidden" style={{ backgroundColor: "#1A2D1A" }}>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full" style={{ backgroundColor: "rgba(153,66,13,0.25)" }} />
            <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full" style={{ backgroundColor: "rgba(139,26,26,0.20)" }} />
            <div className="absolute right-1/3 top-4 w-12 h-12 rounded-full" style={{ backgroundColor: "rgba(74,122,74,0.25)" }} />
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-widest text-primary mb-3">Impact Économique PACTE</p>
              <div className="font-serif text-5xl italic text-[hsl(36,50%,97%)]">
                <AnimatedNumber value={2340000} /> <span className="text-xl text-primary ml-2">FCFA</span>
              </div>
              <p className="text-sm text-[hsl(36,50%,97%,0.6)] font-light mt-2">reversés directement aux artisans de San Pedro ce trimestre</p>
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="font-serif text-2xl text-[hsl(36,50%,97%)]"><AnimatedNumber value={214} /></div>
                  <div className="text-[9px] text-[hsl(36,50%,97%,0.5)] uppercase">commandes livrées</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl text-[hsl(36,50%,97%)]"><AnimatedNumber value={142} /></div>
                  <div className="text-[9px] text-[hsl(36,50%,97%,0.5)] uppercase">artisans rémunérés</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl text-[hsl(36,50%,97%)]">100%</div>
                  <div className="text-[9px] text-[hsl(36,50%,97%,0.5)] uppercase">paiement direct</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mt-6">
                <p className="font-serif italic text-base text-[hsl(36,50%,97%,0.8)]">
                  Chaque achat sur la plateforme soutient directement un artisan de San Pedro.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* S11 — EXPORTS */}
        <Section delay={1100}>
          <div className="bg-[hsl(var(--surface-container-low))] rounded-[1.5rem] p-6">
            <h2 className="font-serif text-xl italic mb-5">Exports & Rapports</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { Icon: Download, label: "Export CSV", sub: "Données complètes" },
                { Icon: FileText, label: "Rapport PDF", sub: "Ce mois · PACTE" },
                { Icon: Share2, label: "Partager", sub: "Lien dashboard" },
                { Icon: Mail, label: "Envoyer rapport", sub: "Aux partenaires" },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={showToast}
                  className="bg-[hsl(var(--surface-container))] rounded-xl p-4 flex items-center gap-3 active:scale-95 transition-transform text-left"
                >
                  <a.Icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">{a.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

/* ────────────────────── PAGE ROOT ────────────────────── */
const AdminPage = () => {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <PasswordGate onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard />;
};

export default AdminPage;
