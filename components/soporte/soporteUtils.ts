import { MarcaItem } from "@/lib/api";

type BrandPhoneCandidate = Pick<
  MarcaItem,
  "whatsapp" | "numero_whatsapp" | "telefono"
>;

export function extractSupportPhoneFromBrand(
  brand: BrandPhoneCandidate | null | undefined,
  fallbackPhone?: string | null,
): string | null {
  const candidates = [
    brand?.whatsapp,
    brand?.numero_whatsapp,
    brand?.telefono,
    fallbackPhone,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const value = candidate.trim();
    if (value.length > 0) {
      return value;
    }
  }

  return null;
}

export function toWaMeUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;

  const digitsOnly = phone.replace(/[^\d]/g, "");
  if (digitsOnly.length === 0) return null;

  return `https://wa.me/${digitsOnly}`;
}

export function generateQrValueForBrand(
  brand: BrandPhoneCandidate | null | undefined,
  fallbackPhone?: string | null,
): string | null {
  return toWaMeUrl(extractSupportPhoneFromBrand(brand, fallbackPhone));
}

export function buildQrImageUrl(value: string | null): string | null {
  if (!value) return null;

  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    value,
  )}`;
}

export function isValidEmail(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\-\s()]/g, "");
}
