"use client";

import { toPublicStorageUrl } from "@/lib/api";

function decodeLabel(label: string): string {
  return label
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&amp;/gi, "&")
    .trim();
}

function parseDateTime(value: string | null | undefined): Date | null {
  if (!value) return null;

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
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

export function stripHtmlToText(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatAcademiaDate(value: string | null | undefined): string {
  const parsed = parseDateTime(value);
  if (!parsed) return "--";

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function formatAcademiaTimeRange(
  fechaInicio: string | null | undefined,
  fechaFin: string | null | undefined,
): string {
  const start = parseDateTime(fechaInicio);
  const end = parseDateTime(fechaFin);

  if (!start && !end) return "--";

  const timeFormatter = new Intl.DateTimeFormat("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (start && end) {
    return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
  }

  if (start) return timeFormatter.format(start);
  return timeFormatter.format(end as Date);
}
