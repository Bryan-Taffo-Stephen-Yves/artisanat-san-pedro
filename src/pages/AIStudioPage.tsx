import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Copy, Upload, Loader2, Check, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { createProduct, PRODUCT_CATEGORIES } from "@/hooks/useCreateProduct";

interface ArtisanSession {
  id: string;
  slug: string;
  name: string;
}

const AIStudioPage = () => {
  const navigate = useNavigate();

  // Session artisan (nécessaire pour lier le produit)
  const [session, setSession] = useState<ArtisanSession | null>(null);
  useEffect(() => {
    const stored = sessionStorage.getItem("artisan_connecte");
    if (!stored) { navigate("/espace-artisan/login"); return; }
    try { setSession(JSON.parse(stored)); }
    catch { navigate("/espace-artisan/login"); }
  }, [navigate]);

  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setGeneratedText("");
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { type: "product-description", description: description.trim() },
      });
      if (error) throw error;
      setGeneratedText(data?.content || "Erreur lors de la génération.");
    } catch (err) {
      console.error("Generation error:", err);
      setGeneratedText("Une erreur est survenue lors de la génération. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
      setShowForm(true);
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(generatedText);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePublish = async () => {
    setFeedback(null);
    if (!session) { setFeedback({ type: "err", msg: "Session expirée, reconnecte-toi." }); return; }

    setIsPublishing(true);
    const result = await createProduct({
      artisanId: session.id,
      artisanSlug: session.slug,
      name: productName,
      price: Number(price),
      stock: Number(stock || "1"),
      category,
      description: generatedText || description,
      imageFile,
    });
    setIsPublishing(false);

    if (result.ok) {
      setFeedback({
        type: "ok",
        msg: result.status === "pending"
          ? "Merci ! Votre produit est envoyé à l'équipe PACTE. Il apparaîtra sur le site dès qu'il sera validé."
          : "Produit publié avec succès !",
      });
      // Réinitialise le formulaire
      setProductName(""); setPrice(""); setStock("");
      setCategory(PRODUCT_CATEGORIES[0]);
      setImageFile(null); setImagePreview("");
      setDescription(""); setGeneratedText(""); setShowForm(false);
      // Redirige vers le dashboard après un court délai
      setTimeout(() => navigate("/espace-artisan"), result.status === "pending" ? 3000 : 1400);
    } else {
      setFeedback({ type: "err", msg: result.error || "Échec de la publication." });
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="px-6 pt-24 pb-6">
        <button onClick={() => navigate("/espace-artisan")} className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">IA STUDIO</p>
        <h1 className="font-serif text-3xl text-foreground">Le Conteur</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">
          Décrivez votre œuvre, l'IA génère une fiche professionnelle.
        </p>
      </div>

      {/* Input description */}
      <div className="px-6">
        <div className="bg-surface-container-low rounded-[2rem] p-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">01 — DÉCRIVEZ VOTRE ŒUVRE</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none resize-none"
            placeholder="Ex : masque en bois d'ébène sculpté à la main, motifs traditionnels Dan..."
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full h-14 mt-4 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full uppercase tracking-widest text-[11px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</> : <><Sparkles className="w-4 h-4" /> Générer la fiche</>}
          </button>
        </div>
      </div>

      {/* Texte généré */}
      {generatedText && (
        <div className="px-6 mt-4">
          <div className="bg-primary/5 rounded-2xl p-5 relative">
            <button onClick={handleCopy} className="absolute top-4 right-4 text-muted-foreground hover:text-primary">
              <Copy className="w-4 h-4" />
            </button>
            <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Description générée</p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{generatedText}</p>
          </div>
        </div>
      )}

      {/* Formulaire produit */}
      {showForm && (
        <div className="px-6 mt-4 animate-fade-in">
          <div className="bg-surface-container-low rounded-[2rem] p-6">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">02 — INFORMATIONS DU PRODUIT</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Nom du produit</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Masque Dan Ancestral"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Prix en FCFA</label>
                  <input
                    type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Stock disponible</label>
                  <input
                    type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                    className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="5"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none appearance-none"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Photo</label>
                <label className="rounded-xl border-2 border-dashed border-muted-foreground/30 p-6 text-center cursor-pointer hover:border-primary/40 transition-colors block">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Aperçu" className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Cliquez pour choisir une photo</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* Feedback publication */}
              {feedback && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${feedback.type === "ok" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {feedback.type === "ok" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {feedback.msg}
                </div>
              )}

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full h-14 mt-2 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full uppercase tracking-widest text-[11px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPublishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publication...</> : "Publier le produit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="px-6 mt-6 pb-16">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[
            { step: "1", title: "Décrivez", text: "Quelques mots sur votre œuvre" },
            { step: "2", title: "Générez", text: "L'IA rédige en 5 secondes" },
            { step: "3", title: "Publiez", text: "L'équipe PACTE vérifie puis met en ligne" },
          ].map((s) => (
            <div key={s.step} className="bg-primary/5 rounded-xl p-4 min-w-[140px] text-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                {s.step}
              </div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.title}</p>
              <p className="text-xs text-foreground font-light mt-1">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default AIStudioPage;
