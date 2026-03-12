import { getMe, Me } from "../api/me";
import { getToken, clearToken } from "./token";

const ME_KEY = "pmp_me_cache";

export function getCachedMe(): Me | null {
  const raw = localStorage.getItem(ME_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Me; } catch { return null; }
}

export function setCachedMe(me: Me) {
  localStorage.setItem(ME_KEY, JSON.stringify(me));
}

export async function loadMeOrNull(): Promise<Me | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const me = await getMe();
    setCachedMe(me);
    return me;
  } catch (e) {
    clearToken();
    localStorage.removeItem(ME_KEY);
    return null;
  }
}
