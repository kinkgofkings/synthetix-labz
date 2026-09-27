const OPERATOR_EMAIL = "james@synthetix-labz.cloud";
const PASSWORD_SHA256 = "1b2eaf84ab4d184648df1813ae139c36e49a9cbf31cb184dd25daa8c6d1fe292";
const SESSION_KEY = "synthetix-operator";

export function operatorEmail() {
  return OPERATOR_EMAIL;
}

export function hasOperatorSession() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export async function signIn(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (normalized !== OPERATOR_EMAIL) return false;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (hex !== PASSWORD_SHA256) return false;
  sessionStorage.setItem(SESSION_KEY, "1");
  return true;
}

export function signOut() {
  sessionStorage.removeItem(SESSION_KEY);
}
