import AppShell from "@/components/AppShell";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

const articles: { image: string; category: string; title: string; extract: string }[] = [];

const events: { day: string; month: string; name: string; location: string; desc: string }[] = [];

const DecouvertePage = () => (
  <AppShell>
    {/* Hero */}
    <div className="bg-[#2C1810] py-16 px-6 text-center">
      <h1 className="font-serif text-4xl italic text-primary-foreground">
        La Culture Vivante de<br />San Pedro
      </h1>
      <p className="text-sm text-primary-foreground/60 font-light mt-3 max-w-xs mx-auto">
        L'artisanat ivoirien à travers ses traditions, ses techniques et ses maîtres.
      </p>
    </div>

    {/* Articles */}
    <div className="px-6 py-10 space-y-6">
      {articles.length === 0 ? (
        <div className="bg-surface-container-low rounded-[2rem] p-10 text-center">
          <h2 className="font-serif text-xl text-foreground">Nos récits arrivent bientôt</h2>
          <p className="text-sm text-muted-foreground font-light mt-2 max-w-sm mx-auto">
            Portraits d'artisans, techniques traditionnelles et histoires du patrimoine de San Pedro seront publiés ici prochainement.
          </p>
        </div>
      ) : (
        articles.map((a, i) => (
          <ScrollReveal key={a.title} delay={i * 0.1}>
          <article className="bg-background rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(14,13,13,0.04)]">
            <img src={a.image} alt={a.title} className="w-full aspect-[16/7] object-cover sepia-[0.15]" />
            <div className="p-6">
              <span className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-[13px] font-semibold text-primary backdrop-blur-sm">
                {a.category}
              </span>
              <h2 className="font-serif text-xl leading-snug mt-3">{a.title}</h2>
              <p className="text-sm text-muted-foreground font-light leading-relaxed mt-2">{a.extract}</p>
              <button className="text-primary text-[13px] font-semibold mt-4 underline">
                Lire la suite →
              </button>
            </div>
          </article>
          </ScrollReveal>
        ))
      )}
    </div>

    {/* Agenda */}
    <div className="px-6 py-8 bg-surface-container-low">
      <h2 className="font-serif text-2xl italic">Agenda Culturel 2026</h2>
      <p className="text-sm text-ink-soft mb-6">Événements à venir</p>
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {events.length === 0 ? (
          <div className="bg-background rounded-[1.5rem] p-8 text-center">
            <p className="text-sm text-muted-foreground font-light">
              Les prochains événements culturels seront annoncés ici. Restez connectés.
            </p>
          </div>
        ) : (
          events.map((e) => (
            <motion.div key={e.name} variants={staggerItem} className="flex items-center gap-4 bg-background rounded-[1.5rem] p-4">
              <div className="bg-primary text-primary-foreground rounded-xl p-3 text-center flex-shrink-0 w-14">
                <span className="font-serif text-xl font-bold block">{e.day}</span>
                <span className="text-[8px] uppercase">{e.month}</span>
              </div>
              <div>
                <p className="text-sm font-bold">{e.name}</p>
                <p className="text-[13px] font-semibold text-muted-foreground">{e.location}</p>
                <p className="text-[10px] text-muted-foreground font-light">{e.desc}</p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>

    <div className="pb-16" />
  </AppShell>
);

export default DecouvertePage;
