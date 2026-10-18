import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Kind = "artisan" | "product";

const TABLE: Record<Kind, { table: string; column: string }> = {
  artisan: { table: "favorite_artisans", column: "artisan_id" },
  product: { table: "favorite_products", column: "product_id" },
};

// Favoris du client connecté (artisans ou produits)
export function useFavorites(kind: Kind) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { table, column } = TABLE[kind];
  const key = ["favorites", kind, user?.id];

  const { data: ids = [] } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await (supabase as any).from(table).select(column);
      if (error) throw error;
      return (data ?? []).map((r: any) => r[column]);
    },
  });

  const isFavorite = (id: string) => ids.includes(id);

  const toggle = async (id: string, label?: string) => {
    if (!user) {
      toast("Connectez-vous pour enregistrer vos favoris", {
        action: { label: "Se connecter", onClick: () => (window.location.href = "/mon-espace") },
      });
      return;
    }
    const was = isFavorite(id);
    // Mise à jour immédiate de l'affichage, puis enregistrement
    qc.setQueryData<string[]>(key, (old = []) => (was ? old.filter((x) => x !== id) : [...old, id]));
    const { error } = was
      ? await (supabase as any).from(table).delete().eq(column, id).eq("user_id", user.id)
      : await (supabase as any).from(table).insert({ user_id: user.id, [column]: id });
    if (error) {
      qc.invalidateQueries({ queryKey: key });
      toast.error("Impossible d'enregistrer ce favori");
      return;
    }
    if (label) toast.success(was ? `${label} retiré de vos favoris` : `${label} ajouté à vos favoris`);
  };

  return { ids, isFavorite, toggle, loggedIn: !!user };
}
