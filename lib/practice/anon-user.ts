import { newId } from "./id";

// Stand-in for real auth: a stable per-browser id so conversations can be created
// and listed against a consistent user_id before Swell's sign-in exists.
const STORAGE_KEY = "swell.practice.user-id";

let cached: string | null = null;

// useSyncExternalStore snapshot: null on the server, the stable anon id on the client
// (created on first read if one isn't already stored).
export function getAnonUserIdSnapshot(): string | null {
  if (cached) return cached;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    cached = existing ?? newId();
    if (!existing) window.localStorage.setItem(STORAGE_KEY, cached);
  } catch {
    cached = newId();
  }
  return cached;
}

export function getAnonUserIdServerSnapshot(): string | null {
  return null;
}

// The id never changes once created, so there's nothing to subscribe to.
export function subscribeAnonUserId(): () => void {
  return () => {};
}
