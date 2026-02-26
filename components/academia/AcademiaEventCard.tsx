"use client";

/* eslint-disable @next/next/no-img-element */
import { AcademiaEventoItem } from "@/lib/api";
import {
  buildImageUrl,
  formatAcademiaDate,
  formatAcademiaTimeRange,
  stripHtmlToText,
} from "./academiaUtils";

type AcademiaEventCardProps = {
  event: AcademiaEventoItem;
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M7 3v3M17 3v3M4 10h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M12 7.5v4.8l3 1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M12 20s6.5-5.8 6.5-10A6.5 6.5 0 1 0 5.5 10c0 4.2 6.5 10 6.5 10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M6.5 4.5h3l1.1 3.3-1.7 1.6c1 2 2.6 3.6 4.6 4.6l1.6-1.7 3.4 1.1v3a2 2 0 0 1-2.2 2A13.7 13.7 0 0 1 4.5 6.7a2 2 0 0 1 2-2.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalizeExternalUrl(value: string | null | undefined): string | null {
  const clean = value?.trim();
  if (!clean) return null;

  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
}

export default function AcademiaEventCard({ event }: AcademiaEventCardProps) {
  const imageUrl = buildImageUrl(event.imagen_portada);
  const altText = event.alt_imagen?.trim() || event.titulo;
  const titleText = event.title_imagen?.trim() || event.titulo;
  const excerpt =
    stripHtmlToText(event.descripcion)?.trim() || "Sin descripción disponible.";

  const dateLabel = formatAcademiaDate(event.fecha_inicio);
  const timeLabel = formatAcademiaTimeRange(event.fecha_inicio, event.fecha_fin);
  const locationLabel = event.ubicacion?.trim() || "Ubicación por confirmar";
  const phoneLabel = event.telefono?.trim() || "Sin teléfono";

  const enrollUrl = normalizeExternalUrl(event.enlace_plataforma);

  return (
    <article className="overflow-hidden rounded-[18px] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
      <div className="grid min-h-[285px] grid-rows-[1fr_auto]">
        <div className="grid grid-cols-1 gap-4 px-4 pb-4 pt-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)]">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-[20px] font-semibold leading-tight text-[#7A7A7A]">
              {event.titulo}
            </h2>
            <p className="mt-2 line-clamp-4 text-[13px] font-normal leading-[1.25] text-[#7A7A7A]">
              {excerpt}
            </p>
          </div>

          <div className="h-[132px] w-full overflow-hidden rounded-[12px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={altText}
                title={titleText}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-500">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-[#D3D3D3] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_195px] sm:items-center">
          <div className="space-y-1.5 text-[11px] font-normal text-[#7A7A7A]">
            <div className="flex items-center gap-2">
              <span className="text-[#F54029]">
                <CalendarIcon />
              </span>
              <span>{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#F54029]">
                <ClockIcon />
              </span>
              <span>{timeLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#F54029]">
                <LocationIcon />
              </span>
              <span className="line-clamp-1">{locationLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#F54029]">
                <PhoneIcon />
              </span>
              <span>{phoneLabel}</span>
            </div>
          </div>

          <div className="flex min-h-[90px] flex-col items-stretch justify-between gap-3">
            <div className="min-h-[24px]">
              {event.tipo_evento?.nombre ? (
                <span className="inline-flex rounded-full bg-[#E9EEF4] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#5E6A76]">
                  {event.tipo_evento.nombre}
                </span>
              ) : null}
            </div>

            {enrollUrl ? (
              <a
                href={enrollUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-full items-center justify-center rounded-full border border-[#F54029] px-4 text-[12px] font-medium text-[#F54029] transition hover:bg-[#F54029] hover:text-white"
              >
                Inscríbete aquí
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-9 w-full cursor-not-allowed items-center justify-center rounded-full border border-[#F54029]/40 px-4 text-[12px] font-medium text-[#F54029]/50"
              >
                Inscríbete aquí
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
