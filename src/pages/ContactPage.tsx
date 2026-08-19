import { useState } from "react";
import { Mail, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

const subjects = ["Je veux acheter", "Je suis artisan", "Partenariat", "Question commande"];

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [message, setMessage] = useState("");

  return (
    <AppShell>
      {/* Header */}
      <div className="px-6 pt-24 pb-6">
        <h1 className="font-serif text-3xl italic">Contactez-nous</h1>
        <p className="text-[10px] uppercase text-muted-foreground tracking-widest mt-1">Notre équipe répond sous 48h</p>
      </div>

      {/* Form */}
      <ScrollReveal className="px-6 space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Nom complet</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-container-low rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Votre nom" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-container-low rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="votre@email.com" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Sujet</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-surface-container-low rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none appearance-none">
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="bg-surface-container-low rounded-xl p-4 w-full border-none text-sm font-light h-32 resize-none focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Votre message…" />
        </div>
        <button className="w-full h-14 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full uppercase tracking-widest text-[11px] font-bold">
          Envoyer le message
        </button>
      </ScrollReveal>

      {/* Quick contacts */}
      <motion.div
        className="px-6 mt-8 grid grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        <motion.div variants={staggerItem} className="bg-surface-container-low rounded-xl p-5 text-center">
          <Mail className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground break-all">contact@artisanat-sanpedro.ci</p>
        </motion.div>
        <motion.div variants={staggerItem} className="bg-surface-container-low rounded-xl p-5 text-center">
          <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground">San Pedro, Centre-ville</p>
        </motion.div>
      </motion.div>

      {/* Réseaux sociaux — espace prévu, à compléter dès la création des comptes */}
      <div className="px-6 mt-8">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 text-center">Suivez-nous</p>
        <div className="bg-surface-container-low rounded-xl p-5 text-center">
          <p className="text-sm text-muted-foreground font-light">
            Nos réseaux sociaux arrivent bientôt.
          </p>
        </div>
      </div>

      {/* Chat IA CTA */}
      <div className="px-6 mt-4 pb-16">
        <div className="bg-primary/5 rounded-[1.5rem] p-6 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-serif text-lg mt-2">Notre assistant IA répond immédiatement</h3>
          <p className="text-sm text-muted-foreground font-light mt-2">Questions sur les produits, artisans, commandes — 24h/24</p>
          <button className="mt-4 h-12 px-8 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full uppercase tracking-widest text-[10px] font-bold">
            Ouvrir le Chat IA
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default ContactPage;
