"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { MarcaItem } from "@/lib/api";
import { buildImageUrl } from "./marcasUtils";

type MarcaCardProps = {
  marca: MarcaItem;
};

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M3.5 12h17M12 3c2.3 2.2 3.7 5.4 3.7 9S14.3 18.8 12 21m0-18C9.7 5.2 8.3 8.4 8.3 12s1.4 6.8 3.7 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function normalizeWebsiteUrl(value: string | null | undefined): string | null {
  const clean = value?.trim();
  if (!clean) return null;
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
}

export default function MarcaCard({ marca }: MarcaCardProps) {
  const logoImageUrl = buildImageUrl(marca.imagen_principal);
  const imageAlt = marca.alt_imagen?.trim() || marca.nombre;
  const imageTitle = marca.title_imagen?.trim() || marca.nombre;

  const websiteDisplay = marca.url_sitio_web?.trim() || "";
  const websiteUrl = normalizeWebsiteUrl(websiteDisplay);

  return (
    <article className="flex h-full min-h-[360px] w-full max-w-[300px] flex-col overflow-hidden rounded-[18px] bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.12)]">
      <div className="flex h-[150px] items-center justify-center rounded-[14px] bg-[#F4F6F8] p-4">
        {logoImageUrl ? (
          <img
            src={logoImageUrl}
            alt={imageAlt}
            title={imageTitle}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-200 text-sm text-slate-500">
            Sin logo
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h2 className="line-clamp-2 text-center text-[22px] font-semibold leading-tight text-[#2E3B52]">
          {marca.nombre}
        </h2>

        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[#E9EEF4] px-3 text-[13px] text-[#6B7280] transition hover:bg-[#DFE6EF]"
            aria-label={`Sitio web de ${marca.nombre}`}
            title={websiteDisplay}
          >
            <span className="text-[#F54029]">
              <GlobeIcon />
            </span>
            <span className="line-clamp-1 text-[#6B7280]">{websiteDisplay}</span>
          </a>
        ) : null}

        <div className="mt-auto pt-5">
          <Link
            href={`/marcas/${marca.slug}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#F54029] px-4 text-sm font-medium text-[#F54029] transition hover:bg-[#F54029] hover:text-white"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    </article>
  );
}
