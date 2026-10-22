import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { IMG } from "@/lib/image";

interface ProductCard {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  artisan_name: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  produits?: ProductCard[];
}

const quickActions = [
  "Trouver un cadeau",
  "Livraison internationale",
  "Devenir artisan",
  "Suivi commande",
];

const initialMessage: Message = {
  id: "init",
  role: "assistant",
  content: "Bonjour ! Je suis l'assistant d'Mains de San Pedro. Je peux vous aider à trouver une œuvre, découvrir nos artisans ou suivre votre commande. Comment puis-je vous aider ?",
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const history = updatedMessages
        .filter((m) => m.id !== "init")
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: history },
      });

      if (error) throw error;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data?.content || "Je suis désolé, je n'ai pas pu traiter votre demande.",
        produits: Array.isArray(data?.produits) ? data.produits : [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Une erreur est survenue. Veuillez réessayer." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <div className="fixed bottom-24 right-4 z-50">
          {showTooltip && (
            <div className="absolute -top-10 right-0 px-3 py-2 rounded-full bg-primary/10 backdrop-blur-sm text-[10px] text-primary whitespace-nowrap animate-fade-in">
              Chat IA disponible
            </div>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 bg-primary hover:bg-[#8E4219] text-primary-foreground rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Sparkles className="w-6 h-6 fill-current" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-destructive rounded-full" />
          </button>
        </div>
      )}

      {/* Overlay + Panel */}
      {isOpen && (
        <>
          <div className="animate-backdrop-in fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
          <div role="dialog" aria-label="Assistant" className="animate-sheet-up fixed bottom-0 left-0 right-0 z-50 h-[85svh] rounded-t-[2rem] bg-background overflow-hidden flex flex-col shadow-[0_-20px_60px_rgba(14,13,13,0.12)]">
            {/* Drag indicator */}
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-border/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <div className="flex-1">
                <p className="font-serif text-base">Assistant IA</p>
                <p className="text-xs text-ink-soft">Mains de San Pedro · PACTE</p>
              </div>
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-[9px] text-green-600">En ligne</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-border/10">
              {quickActions.map((action, i) => {
                const palette = [
                  { c: "#C3622D", bg: "rgba(153,66,13,0.10)" },
                  { c: "#A55427", bg: "rgba(45,74,45,0.10)" },
                  { c: "#864521", bg: "rgba(139,26,26,0.10)" },
                ];
                const p = palette[i % palette.length];
                return (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    style={{ color: p.c, backgroundColor: p.bg, borderColor: `${p.c}33` }}
                    className="flex-shrink-0 px-3 py-2 rounded-full text-[13px] font-semibold border transition-colors"
                  >
                    {action}
                  </button>
                );
              })}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-4 text-sm leading-relaxed font-light ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-[1.5rem] rounded-tr-sm"
                          : "bg-surface-container-low text-foreground rounded-[1.5rem] rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>

                  {/* Fiches produits */}
                  {msg.produits && msg.produits.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                      {msg.produits.map((p) => (
                        <Link
                          key={p.id}
                          to={`/boutique/${p.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex-shrink-0 w-36 bg-surface-container-low rounded-2xl overflow-hidden border border-border/20 active:scale-95 transition-transform"
                        >
                          <div className="w-full h-36 overflow-hidden">
                            {p.image_url ? (
                              <img src={IMG.thumb(p.image_url)} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: "#E8E0D5" }}>
                                <span className="font-serif italic text-[10px] text-muted-foreground">{p.category}</span>
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="font-serif text-xs text-foreground leading-snug line-clamp-2">{p.name}</p>
                            <p className="font-serif text-primary text-sm mt-1">{p.price.toLocaleString("fr-FR")} F</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{p.artisan_name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-low rounded-full p-3 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-6 pt-3 border-t border-border/10 flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Votre message…"
                className="flex-1 bg-surface-container rounded-full px-4 py-3 text-sm border-none focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-primary hover:bg-[#8E4219] text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AIChatbot;
