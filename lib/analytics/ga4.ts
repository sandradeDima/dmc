"use client";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";
const DEFAULT_CURRENCY = "BOB";

type PrimitiveParam = string | number | boolean;
type EventParams = Record<string, PrimitiveParam | PrimitiveParam[] | object | undefined>;

type GtagFunction = (
  command: "event" | "config" | "js",
  target: string | Date,
  params?: Record<string, unknown>,
) => void;

type TrackProductViewPayload = {
  id: number | string;
  nombre: string;
  slug: string;
  categoria?: string | null;
  subcategoria?: string | null;
  precio?: number | string | null;
  precioReferencial?: number | string | null;
  marca?: string | null;
  sku?: string | null;
  skuDmc?: string | null;
};

function getGtag(): GtagFunction | null {
  if (typeof window === "undefined") return null;

  const maybeGtag = (window as Window & { gtag?: GtagFunction }).gtag;
  return typeof maybeGtag === "function" ? maybeGtag : null;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function cleanParams(params?: EventParams): Record<string, unknown> {
  if (!params) return {};

  return Object.entries(params).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value === undefined) return acc;
    acc[key] = value;
    return acc;
  }, {});
}

export function getGaId(): string {
  return GA_ID;
}

export function isGaEnabled(): boolean {
  return Boolean(getGaId()) && Boolean(getGtag());
}

export function getPageTypeFromPath(pathname: string): string {
  const cleanPath =
    pathname !== "/" ? pathname.replace(/\/+$/, "") || "/" : pathname;

  if (cleanPath === "/") return "home";
  if (cleanPath === "/catalogo") return "catalog";
  if (cleanPath.startsWith("/producto/")) return "product_detail";
  if (cleanPath === "/cotizar") return "quote";
  if (cleanPath === "/marcas") return "brands";
  if (cleanPath.startsWith("/marcas/")) return "brand_products";
  if (cleanPath === "/soporte") return "support";
  if (cleanPath === "/academia") return "academy";
  if (cleanPath === "/blog") return "blog_list";
  if (cleanPath.startsWith("/blog/")) return "blog_detail";
  if (cleanPath === "/dmc") return "corporate";

  return "other";
}

export function trackEvent(name: string, params?: EventParams): boolean {
  const gtag = getGtag();
  if (!gtag || !getGaId()) return false;

  gtag("event", name, cleanParams(params));
  return true;
}

export function trackPageView(url: string, pageType: string): boolean {
  if (typeof window === "undefined") return false;

  const resolvedUrl = new URL(url, window.location.origin);
  return trackEvent("page_view", {
    page_location: resolvedUrl.toString(),
    page_path: `${resolvedUrl.pathname}${resolvedUrl.search}`,
    page_title: document.title,
    page_type: pageType,
  });
}

export function trackProductView(product: TrackProductViewPayload): void {
  const category = product.categoria?.trim() || product.subcategoria?.trim() || "catalog";
  const price = toNumber(product.precio ?? product.precioReferencial);

  trackEvent("view_item", {
    currency: DEFAULT_CURRENCY,
    value: price,
    page_type: "product_detail",
    item_slug: product.slug,
    sku: product.sku?.trim() || undefined,
    sku_dmc: product.skuDmc?.trim() || undefined,
    items: [
      {
        item_id: String(product.id),
        item_name: product.nombre,
        item_category: category,
        price,
        ...(product.marca?.trim() ? { item_brand: product.marca.trim() } : {}),
      },
    ],
  });
}

export function trackGenerateLead(params: {
  cta_name: string;
  page_type: string;
  source_section: string;
  lead_type?: string;
}): void {
  trackEvent("generate_lead", params);
}

export function trackChatOpen(params: {
  chat_provider: string;
  page_type: string;
  source_section?: string;
  chat_mode?: string;
  realtime_active?: boolean;
}): void {
  trackEvent("chat_open", params);
}

export function trackChatMessageSent(params: {
  chat_provider: string;
  page_type: string;
  message_length: number;
  chat_mode?: string;
  conversation_id_present?: boolean;
}): void {
  trackEvent("chat_message_sent", params);
}

export function trackChatLeadSubmit(params: {
  chat_provider: string;
  page_type: string;
  lead_type: string;
  option_slug?: string;
  option_text?: string;
}): void {
  trackEvent("chat_lead_submit", params);
}
