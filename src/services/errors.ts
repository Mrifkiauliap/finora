import type { ZodError } from 'zod';

export type ServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE_VIOLATION'
  | 'INTEGRITY_ERROR'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'STORAGE_UNAVAILABLE'
  | 'CHECKSUM_MISMATCH'
  | 'UNSUPPORTED_VERSION';

export interface ServiceError {
  code: ServiceErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };

export class ServiceDomainError extends Error {
  readonly serviceError: ServiceError;

  constructor(serviceError: ServiceError) {
    super(serviceError.message);
    this.name = 'ServiceDomainError';
    this.serviceError = serviceError;
  }
}

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function err<T = never>(
  code: ServiceErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>
): ServiceResult<T> {
  return {
    ok: false,
    error: fieldErrors ? { code, message, fieldErrors } : { code, message },
  };
}

export function mapZodError<T = never>(zodError: ZodError): ServiceResult<T> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of zodError.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_root';
    const existing = fieldErrors[key] ?? [];
    existing.push(issue.message);
    fieldErrors[key] = existing;
  }
  const firstMessage = zodError.issues[0]?.message ?? 'Data masukan tidak valid.';
  return err('VALIDATION_ERROR', firstMessage, fieldErrors);
}

export function mapDexieError<T = never>(error: unknown): ServiceResult<T> {
  if (error instanceof ServiceDomainError) {
    return { ok: false, error: error.serviceError };
  }

  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name?: unknown }).name)
      : '';
  const msg =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message)
      : '';

  if (
    name === 'QuotaExceededError' ||
    msg.toLowerCase().includes('quota')
  ) {
    return err(
      'STORAGE_QUOTA_EXCEEDED',
      'Ruang penyimpanan browser penuh. Unduh Backup JSON sekarang untuk mengamankan data Anda, lalu kosongkan ruang disk atau hapus data lama.'
    );
  }

  if (
    name === 'SecurityError' ||
    name === 'InvalidStateError' ||
    name === 'OpenFailedError' ||
    name === 'DatabaseClosedError'
  ) {
    return err(
      'STORAGE_UNAVAILABLE',
      'Penyimpanan lokal browser (IndexedDB) tidak tersedia atau diblokir oleh pengaturan privasi/mode Private browser.'
    );
  }

  if (name === 'ConstraintError') {
    return err(
      'CONFLICT',
      'Terjadi bentrok kunci unik data pada penyimpanan lokal.'
    );
  }

  return err(
    'INTEGRITY_ERROR',
    'Terjadi kendala saat memproses data lokal. Silakan coba lagi.'
  );
}

export function generateUuid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  throw new Error('crypto.randomUUID tidak tersedia.');
}
