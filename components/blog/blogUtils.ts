"use client";

import { toPublicStorageUrl } from "@/lib/api";

const ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

function decodeHtmlEntities(value: string): string {
  let decoded = value;

  Object.entries(ENTITY_MAP).forEach(([entity, replacement]) => {
    decoded = decoded.replace(new RegExp(entity, "gi"), replacement);
  });

  if (typeof window !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }

  return decoded;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildImageUrl(relativePath?: string | null): string | null {
  return toPublicStorageUrl(relativePath);
}

export function formatBlogDate(value: string | null): string {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function stripHtmlToText(value: string | null | undefined): string {
  if (!value) return "";

  const decoded = decodeHtmlEntities(value);

  return decoded
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeAndNormalizeHtml(value: string): string {
  if (typeof window === "undefined") {
    const plain = stripHtmlToText(value);
    return plain ? `<p>${escapeHtml(plain)}</p>` : "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");

  doc
    .querySelectorAll("script, style, iframe, object, embed, link, meta")
    .forEach((node) => node.remove());

  const allowedTags = new Set([
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "a",
    "img",
    "pre",
    "code",
    "hr",
  ]);

  const elements = Array.from(doc.body.querySelectorAll("*"));

  elements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (!allowedTags.has(tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const valueAttr = attribute.value;

      if (name.startsWith("on") || name === "style" || name === "class" || name === "id") {
        element.removeAttribute(attribute.name);
        return;
      }

      if (tagName === "a") {
        if (name !== "href" && name !== "target" && name !== "rel") {
          element.removeAttribute(attribute.name);
          return;
        }

        if (
          name === "href" &&
          !/^(https?:|mailto:|tel:|\/|#)/i.test(valueAttr)
        ) {
          element.removeAttribute("href");
          return;
        }

        return;
      }

      if (tagName === "img") {
        if (name !== "src" && name !== "alt" && name !== "title") {
          element.removeAttribute(attribute.name);
          return;
        }

        if (name === "src" && /^javascript:/i.test(valueAttr)) {
          element.remove();
        }

        return;
      }

      if (name !== "href") {
        element.removeAttribute(attribute.name);
      }
    });

    if (tagName === "a") {
      const href = element.getAttribute("href");
      if (href && /^https?:\/\//i.test(href)) {
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      } else {
        element.removeAttribute("target");
        element.removeAttribute("rel");
      }
    }
  });

  return doc.body.innerHTML.trim();
}

export function normalizeBlogHtml(value: string | null | undefined): string | null {
  if (!value || value.trim().length === 0) return null;

  let normalized = value.trim().replace(/\r/g, "");

  normalized = normalized.replace(
    /<pre[^>]*class=["'][^"']*ql-syntax[^"']*["'][^>]*>([\s\S]*?)<\/pre>/gi,
    "$1",
  );

  normalized = decodeHtmlEntities(normalized);
  if (/&lt;|&gt;|&#\d+;|&#x[0-9a-f]+;/i.test(normalized)) {
    normalized = decodeHtmlEntities(normalized);
  }

  normalized = normalized
    .replace(/<p>\s*(<(?:h[1-6]|p|ul|ol|li|blockquote|pre|img|a)\b[\s\S]*?)\s*<\/p>/gi, "$1")
    .replace(/<p>\s*<\/p>/gi, "");

  const sanitized = sanitizeAndNormalizeHtml(normalized);
  if (sanitized.length === 0) return null;

  return sanitized;
}
