import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Delete, ArrowRight, Loader2, User } from "lucide-react";

type Step = "login" | "pin";

const ArtisanLoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("login");
  const [loginId, setLoginId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDigit = (digit: string) => {
    setError("");
    if (step === "login") {
      if (loginId.length < 3) setLoginId(loginId + digit);
    } else {
      if (pin.length < 4) setPin(pin + digit);
    }
  };

  const handleDelete = () => {
    setError("");
    if (step === "login") setLoginId(loginId.slice(0, -1));
    else setPin(pin.slice(0, -1));
  };

  const handleNext = () => {
    if (loginId.length === 0) {
      setError("Entre ton numéro");
      return;
    }
    // Normalise sur 3 chiffres (1 -> 001)
    setLoginId(loginId.padStart(3, "0"));
    setStep("pin");
    setError("");
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      setError("Le code doit avoir 4 chiffres");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: rpcError } = await (supabase as any).rpc("verifier_pin_artisan", {
        p_login_id: loginId.padStart(3, "0"),
        p_pin: pin,
      });
      if (rpcError) throw rpcError;

      const result = Array.isArray(data) ? data[0] : data;
      if (result && result.succes) {
        // Stocke l'artisan connecté (session simple)
        sessionStorage.setItem("artisan_connecte", JSON.stringify({
          id: result.artisan_id,
          slug: result.artisan_slug,
          name: result.artisan_name,
        }));
        navigate("/espace-artisan");
      } else {
        setError("Numéro ou code incorrect");
        setPin("");
      }
    } catch (e) {
      console.error(e);
      setError("Une erreur est survenue. Réessaie.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const currentValue = step === "login" ? loginId : pin;
  const maxLength = step === "login" ? 3 : 4;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      {/* Logo / titre */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary hover:bg-[#8E4219] flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-serif text-2xl italic text-foreground">Espace Artisan</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {step === "login" ? "Entre ton numéro" : "Entre ton code secret"}
        </p>
      </div>

      {/* Affichage des chiffres saisis */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center font-serif text-3xl ${
              currentValue[i]
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border/30 text-transparent"
            }`}
          >
            {step === "pin" && currentValue[i] ? "●" : currentValue[i] || "0"}
          </div>
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-destructive text-sm mb-4 text-center">{error}</p>
      )}

      {/* Pavé numérique */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleDigit(n.toString())}
            disabled={loading}
            className="w-20 h-20 rounded-full bg-surface-container-low text-foreground font-serif text-3xl active:scale-90 active:bg-primary/10 transition-all disabled:opacity-50"
          >
            {n}
          </button>
        ))}
        {/* Bouton supprimer */}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-20 h-20 rounded-full flex items-center justify-center text-muted-foreground active:scale-90 transition-all disabled:opacity-50"
        >
          <Delete className="w-7 h-7" />
        </button>
        {/* Zéro */}
        <button
          onClick={() => handleDigit("0")}
          disabled={loading}
          className="w-20 h-20 rounded-full bg-surface-container-low text-foreground font-serif text-3xl active:scale-90 active:bg-primary/10 transition-all disabled:opacity-50"
        >
          0
        </button>
        {/* Bouton valider */}
        <button
          onClick={step === "login" ? handleNext : handleVerifyPin}
          disabled={loading}
          className="w-20 h-20 rounded-full bg-primary hover:bg-[#8E4219] text-white flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <ArrowRight className="w-7 h-7" />}
        </button>
      </div>

      {/* Retour à l'étape précédente */}
      {step === "pin" && (
        <button
          onClick={() => { setStep("login"); setPin(""); setError(""); }}
          className="text-muted-foreground text-sm underline"
        >
          ← Changer de numéro
        </button>
      )}
    </div>
  );
};

export default ArtisanLoginPage;
