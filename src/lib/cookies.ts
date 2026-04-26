// Lightweight cookie helpers — first-party, no third-party tracking.
// All storage is gated behind explicit user consent via `hasCookieConsent()`.

export const COOKIE_CONSENT_KEY = "mk_cookie_consent";
export const COOKIE_CONSENT_ACCEPTED = "accepted";
export const COOKIE_CONSENT_DECLINED = "declined";

export type CookieConsentValue =
  | typeof COOKIE_CONSENT_ACCEPTED
  | typeof COOKIE_CONSENT_DECLINED;

const DEFAULT_MAX_AGE_DAYS = 180;

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

export function setCookie(
  name: string,
  value: string,
  maxAgeDays: number = DEFAULT_MAX_AGE_DAYS,
): void {
  if (!isBrowser()) return;
  const maxAgeSeconds = Math.max(0, Math.floor(maxAgeDays * 24 * 60 * 60));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const target = `${name}=`;
  const parts = document.cookie ? document.cookie.split(";") : [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length));
    }
  }
  return null;
}

export function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function getCookieConsent(): CookieConsentValue | null {
  const value = getCookie(COOKIE_CONSENT_KEY);
  if (value === COOKIE_CONSENT_ACCEPTED || value === COOKIE_CONSENT_DECLINED) {
    return value;
  }
  return null;
}

export function setCookieConsent(value: CookieConsentValue): void {
  setCookie(COOKIE_CONSENT_KEY, value, 365);
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("mk:cookie-consent", { detail: value }));
  }
}

export function hasCookieConsent(): boolean {
  return getCookieConsent() === COOKIE_CONSENT_ACCEPTED;
}

// ── Project unlock helpers ─────────────────────────────────────────────
const UNLOCK_PREFIX = "mk_unlock_";

function unlockCookieName(slug: string): string {
  // Sanitize slug for cookie-name safety.
  const safe = slug.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${UNLOCK_PREFIX}${safe}`;
}

export function isProjectUnlocked(slug: string): boolean {
  if (!isBrowser()) return false;
  // Cookie persists across sessions only when consent is granted.
  if (hasCookieConsent() && getCookie(unlockCookieName(slug)) === "1") {
    return true;
  }
  // Fallback: per-tab session unlock (works without consent).
  try {
    return window.sessionStorage.getItem(unlockCookieName(slug)) === "1";
  } catch {
    return false;
  }
}

export function markProjectUnlocked(slug: string): void {
  if (!isBrowser()) return;
  // Always remember for the current tab.
  try {
    window.sessionStorage.setItem(unlockCookieName(slug), "1");
  } catch {
    /* ignore quota / privacy mode */
  }
  // Persist across visits only with consent.
  if (hasCookieConsent()) {
    setCookie(unlockCookieName(slug), "1", DEFAULT_MAX_AGE_DAYS);
  }
}
