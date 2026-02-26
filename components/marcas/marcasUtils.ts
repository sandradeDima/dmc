"use client";

import { MarcaItem, toPublicStorageUrl } from "@/lib/api";

function decodeLabel(label: string): string {
  return label
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&amp;/gi, "&")
    .trim();
}

export function buildImageUrl(relativePath?: string | null): string | null {
  return toPublicStorageUrl(relativePath);
}

export function normalizePaginationLabel(label: string): string {
  const decoded = decodeLabel(label);

  if (/previous/i.test(decoded)) return "Anterior";
  if (/next/i.test(decoded)) return "Siguiente";

  return decoded.replace(/[«»]/g, "").trim();
}

export function normalizeBrandValue(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatBrandTitleFromSlug(slug: string): string {
  const clean = slug.trim().replace(/[-_]+/g, " ").trim();
  if (!clean) return "Marca";

  if (clean.length <= 4) return clean.toUpperCase();

  return clean
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function extractWhatsAppNumber(marca: MarcaItem): string | null {
  const rawCandidates = [
    marca.whatsapp,
    marca.numero_whatsapp,
    marca.telefono,
  ];

  for (const candidate of rawCandidates) {
    if (!candidate) continue;
    const trimmed = candidate.trim();
    if (trimmed.length > 0) return trimmed;
  }

  return null;
}

export function toWaMeUrl(number: string | null | undefined): string | null {
  if (!number) return null;

  const digitsOnly = number.replace(/[^\d]/g, "");
  if (digitsOnly.length === 0) return null;

  return `https://wa.me/${digitsOnly}`;
}

export function resolvePageFromLink(
  url: string | null | undefined,
  pageFromApi: number | null | undefined,
): number | null {
  if (typeof pageFromApi === "number" && Number.isFinite(pageFromApi)) {
    return pageFromApi;
  }

  if (!url) return null;

  try {
    const parsed = new URL(url);
    const raw = parsed.searchParams.get("page");
    if (!raw) return null;

    const page = Number(raw);
    return Number.isFinite(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
}
