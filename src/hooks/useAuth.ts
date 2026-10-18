import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Compte client (Supabase Auth). Une seule écoute de session pour tout le
// site, partagée par tous les composants (cartes produit, en-tête, etc.).
type AuthState = { user: User | null; loading: boolean };
let state: AuthState = { user: null, loading: true };
const listeners = new Set<() => void>();
let started = false;

function setState(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

function start() {
  if (started) return;
  started = true;
  supabase.auth.getSession().then(({ data }) => {
    setState({ user: data.session?.user ?? null, loading: false });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    setState({ user: session?.user ?? null, loading: false });
  });
}

function subscribe(cb: () => void) {
  start();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export interface ClientProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  avatar_url: string | null;
}

export async function fetchProfile(userId: string): Promise<ClientProfile | null> {
  const { data } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    full_name: data.full_name ?? data.display_name ?? null,
    phone: data.phone ?? null,
    delivery_address: data.delivery_address ?? null,
    delivery_city: data.delivery_city ?? null,
    avatar_url: data.avatar_url ?? null,
  };
}
