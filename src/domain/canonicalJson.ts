const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Serialisasi JSON kanonik dengan kunci objek terurut secara deterministik
 * sehingga SHA-256 checksum selalu identik pada konten data yang sama.
 */
export function canonicalStringify(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortKeysDeep(item));
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(record).sort();
    for (const key of keys) {
      sorted[key] = sortKeysDeep(record[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * SEC-003: Mendeteksi keberadaan kunci prototype pollution di raw JSON text atau struktur objek.
 */
export function hasDangerousPrototypeKeys(rawText: string): boolean {
  // Cepat periksa keberadaan literal kunci berbahaya dalam JSON string sebelum/sesudah parse
  if (/"(?:__proto__|constructor|prototype)"\s*:/.test(rawText)) {
    return true;
  }
  return false;
}

export function objectHasDangerousKeys(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => objectHasDangerousKeys(item));
  }
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) return true;
      if (objectHasDangerousKeys((value as Record<string, unknown>)[key])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Menghitung SHA-256 hex lowercase menggunakan Web Crypto API.
 */
export async function computeSha256Hex(text: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle?.digest !== 'function') {
    throw new Error('Web Crypto API (crypto.subtle) tidak tersedia pada konteks ini.');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
