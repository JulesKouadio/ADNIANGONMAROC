/**
 * Hash a password using browser WebCrypto SHA-256 with fixed app domain salt.
 * Used for username/password authentication of Hôtes d'accueil.
 */
export async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`ad_niangon_maroc_v2::${plain}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalize a phone number so it serves as a reliable unique key for identifying a soul.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, '').trim();
}
