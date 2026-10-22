// Copie locale des dernières listes (produits, artisans) : à la visite suivante,
// le site s'affiche immédiatement, puis se met à jour en arrière-plan.
// Ce n'est qu'un accélérateur : sans stockage (navigation privée), rien ne change.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function readSnapshot<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const { at, data } = JSON.parse(raw);
    if (!at || Date.now() - at > MAX_AGE_MS) return undefined;
    return data as T;
  } catch {
    return undefined;
  }
}

export function writeSnapshot(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* stockage plein ou indisponible : on s'en passe */
  }
}
