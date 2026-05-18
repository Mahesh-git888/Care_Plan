import { cookies } from "next/headers";

export const COOKIE_NAME = "portea_admin_auth";

// Cheap non-cryptographic hash so we never store the literal password as a
// cookie value. Good enough for a pilot — replace with HMAC + a server
// secret for production (or move admin auth onto Portea SSO entirely).
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  }
  return "portea_" + Math.abs(hash).toString(36);
}

export function expectedCookieValue() {
  const adminPassword = process.env.PORTEA_ADMIN_PASSWORD?.trim();
  if (!adminPassword) return null;
  return hashPassword(adminPassword);
}

export async function isAdminAuthed(): Promise<boolean> {
  const expected = expectedCookieValue();
  if (!expected) return false;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === expected;
}
