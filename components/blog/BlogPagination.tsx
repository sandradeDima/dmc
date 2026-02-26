"use client";

import { BlogPaginationLink } from "@/lib/api";

function decodeLabel(label: string): string {
  return label
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&amp;/gi, "&")
    .trim();
}

function normalizeLabel(label: string): string {
  const decoded = decodeLabel(label);

  if (/previous/i.test(decoded)) return "Anterior";
  if (/next/i.test(decoded)) return "Siguiente";

  return decoded.replace(/[«»]/g, "").trim();
}

function resolvePage(link: BlogPaginationLink): number | null {
  if (typeof link.page === "number") return link.page;
  if (!link.url) return null;

  try {
    const parsed = new URL(link.url);
    const rawPage = parsed.searchParams.get("page");
    const page = rawPage ? Number(rawPage) : NaN;

    return Number.isFinite(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
}

type BlogPaginationProps = {
  links: BlogPaginationLink[];
  isLoading?: boolean;
  onPageChange: (page: number) => void;
};

export default function BlogPagination({
  links,
  isLoading = false,
  onPageChange,
}: BlogPaginationProps) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Paginación del blog" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {links.map((link, index) => {
          const label = normalizeLabel(link.label);
          const page = resolvePage(link);
          const isDisabled = isLoading || !link.url || !page;
          const isPageNumber = typeof page === "number" && /^\d+$/.test(label);

          return (
            <li key={`${label}-${link.page ?? index}`}>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (!page) return;
                  onPageChange(page);
                }}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm transition ${
                  link.active
                    ? "bg-[#F54029] text-white"
                    : "text-[#6F7681] hover:bg-white hover:text-[#4F5965]"
                } ${isDisabled ? "cursor-not-allowed opacity-45" : ""}`}
              >
                {isPageNumber ? page : label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
