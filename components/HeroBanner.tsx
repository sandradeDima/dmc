"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getInformacion, toPublicStorageUrl } from "@/lib/api";

type RawBannerRecord = Record<string, unknown>;

type HeroSlide = {
  id: string;
  imageUrl: string;
  title: string | null;
  alt: string;
};

const AUTOPLAY_INTERVAL_MS = 6000;
const SWIPE_THRESHOLD_PX = 48;
const DEFAULT_HOME_HEADER_TEXT =
  "Horem ipsum dolor sit amet, consectetur adipiscing elit.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function resolveApiOrigin(): string {
  const envBase =
    process.env.NEXT_PUBLIC_DMC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000";

  return envBase.replace(/\/+$/, "").replace(/\/api\/public$/, "");
}

function normalizeBannerPayload(payload: unknown): RawBannerRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const topData = payload.data;

  if (Array.isArray(topData)) {
    return topData.filter(isRecord);
  }

  if (isRecord(topData) && Array.isArray(topData.data)) {
    return topData.data.filter(isRecord);
  }

  return [];
}

function mapToSlides(items: RawBannerRecord[]): HeroSlide[] {
  return items
    .map((item, index) => {
      const imagePath =
        asNonEmptyString(item.imagen_principal) ??
        asNonEmptyString(item.imagen_desktop) ??
        asNonEmptyString(item.imagen_mobile) ??
        asNonEmptyString(item.imagen) ??
        asNonEmptyString(item.image);

      if (!imagePath) return null;

      const imageUrl = toPublicStorageUrl(imagePath);
      if (!imageUrl) return null;

      const idValue = item.id;
      const id = idValue !== undefined ? String(idValue) : `hero-slide-${index}`;
      const title = asNonEmptyString(item.title_imagen);
      const alt =
        asNonEmptyString(item.alt_imagen) ??
        title ??
        `Banner principal ${index + 1}`;

      return {
        id,
        imageUrl,
        title,
        alt,
      };
    })
    .filter((slide): slide is HeroSlide => slide !== null);
}

async function fetchHeroSlides(signal: AbortSignal): Promise<HeroSlide[]> {
  const apiOrigin = resolveApiOrigin();
  const endpoints = [
    "/banner",
    `${apiOrigin}/banner`,
    `${apiOrigin}/api/public/banner`,
    `${apiOrigin}/api/public/banners`,
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
        cache: "no-store",
      });

      if (!response.ok) {
        lastError = new Error(
          `Banner endpoint ${endpoint} returned ${response.status}`,
        );
        continue;
      }

      const payload: unknown = await response.json();
      const items = normalizeBannerPayload(payload);

      return mapToSlides(items);
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error("Unknown error");
    }
  }

  throw lastError ?? new Error("Unable to load banner slides");
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 lg:h-[38px] lg:w-[38px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 20L16.3 16.3M18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroBanner() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedSlideIds, setFailedSlideIds] = useState<string[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [mainHeaderText, setMainHeaderText] = useState(DEFAULT_HOME_HEADER_TEXT);

  useEffect(() => {
    const controller = new AbortController();

    const loadSlides = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const fetchedSlides = await fetchHeroSlides(controller.signal);
        setSlides(fetchedSlides);
      } catch {
        if (controller.signal.aborted) return;
        setSlides([]);
        setErrorMessage("No se pudieron cargar los banners en este momento.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadSlides();

    const loadMainHeaderText = async () => {
      try {
        const response = await getInformacion();
        if (controller.signal.aborted) return;

        const textoHome = response?.Informacion?.texto_home?.trim();
        if (textoHome) {
          setMainHeaderText(textoHome);
        }
      } catch {
        if (controller.signal.aborted) return;
      }
    };

    void loadMainHeaderText();

    return () => controller.abort();
  }, []);

  const visibleSlides = useMemo(
    () => slides.filter((slide) => !failedSlideIds.includes(slide.id)),
    [slides, failedSlideIds],
  );

  useEffect(() => {
    if (activeIndex >= visibleSlides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, visibleSlides.length]);

  const hasCarousel = visibleSlides.length > 1;

  const goNext = useCallback(() => {
    setActiveIndex((current) =>
      visibleSlides.length === 0 ? 0 : (current + 1) % visibleSlides.length,
    );
  }, [visibleSlides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) =>
      visibleSlides.length === 0
        ? 0
        : (current - 1 + visibleSlides.length) % visibleSlides.length,
    );
  }, [visibleSlides.length]);

  useEffect(() => {
    if (!hasCarousel || isPaused) return;

    const timer = setInterval(goNext, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [goNext, hasCarousel, isPaused]);

  const handleImageError = useCallback((slideId: string) => {
    setFailedSlideIds((current) =>
      current.includes(slideId) ? current : [...current, slideId],
    );
  }, []);

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
    setTouchEndX(null);
    setIsPaused(true);
  };

  const onTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    setTouchEndX(event.changedTouches[0]?.clientX ?? null);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || !hasCarousel) {
      setIsPaused(false);
      return;
    }

    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      if (delta > 0) goNext();
      else goPrev();
    }

    setIsPaused(false);
  };

  const showFallbackBackground = visibleSlides.length === 0;

  return (
    <section className="relative w-full">
      <div
        className="relative h-[360px] min-h-[320px] overflow-hidden bg-slate-900 sm:h-[440px] md:h-[560px] lg:h-[700px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {showFallbackBackground ? (
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#1f2a37,#3b4c5f)]" />
        ) : (
          visibleSlides.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.imageUrl}
              alt={slide.alt}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              onError={() => handleImageError(slide.id)}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))
        )}

        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(68,68,68,0.92)_0%,rgba(68,68,68,0.66)_20%,rgba(68,68,68,0.28)_40%,rgba(68,68,68,0)_58%)] lg:w-[596px]" />

        <div className="absolute inset-0 z-10 flex items-start px-6 pt-[118px] sm:px-8 sm:pt-[136px] md:pt-[170px] lg:px-0 lg:pt-[297px]">
          <div className="max-w-[425px] lg:ml-[47px]">
            <h1 className="text-[24px] leading-[1.2] font-normal text-white sm:text-[27px] lg:text-[30.185px]">
              {mainHeaderText}
            </h1>

            <Link
              href="/cotizar"
              className="mt-6 inline-flex h-[49.954px] w-[191px] items-center justify-center rounded-[19.1px] bg-[#ef4f39] text-[18px] font-normal text-white transition-colors hover:bg-[#de3f2a] lg:text-[22.175px]"
            >
              Cotiza ahora
            </Link>

            {isLoading && (
              <p className="mt-3 text-xs text-white/75">Cargando banners...</p>
            )}

            {!isLoading && errorMessage && (
              <p className="mt-3 text-xs text-rose-200">{errorMessage}</p>
            )}
          </div>
        </div>

        {hasCarousel && (
          <div className="absolute bottom-4 left-5 z-20 flex h-[37px] items-center gap-1 sm:left-7 lg:bottom-[23px] lg:left-[47px]">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Slide anterior"
              className="flex h-[37px] w-[24px] items-center justify-center text-[36px] leading-none text-white/90 transition-opacity hover:opacity-75"
            >
              &#8249;
            </button>

            <div className="flex items-center gap-1.5">
              {visibleSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Ir al slide ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-[8px] w-[8px] rounded-full transition-all ${
                    index === activeIndex
                      ? "bg-[#ef4f39]"
                      : "bg-white/80 hover:bg-white"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label="Siguiente slide"
              className="flex h-[37px] w-[24px] items-center justify-center text-[36px] leading-none text-white/90 transition-opacity hover:opacity-75"
            >
              &#8250;
            </button>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex translate-y-1/2 justify-center px-4">
        <div className="pointer-events-auto flex h-[58px] w-full max-w-[773px] items-center rounded-[42px] bg-[#eeeeee] pl-6 pr-3 shadow-[0px_3.387px_10.329px_0px_rgba(0,0,0,0.17)] md:h-[70px] md:pl-8 md:pr-4 lg:h-[82.973px]">
          <input
            type="text"
            placeholder="Buscar productos"
            className="w-full bg-transparent text-[16px] font-light tracking-[0.2px] text-[#b6b6b6] placeholder:text-[16px] placeholder:font-light placeholder:text-[#b6b6b6] focus:outline-none md:text-[19px] md:placeholder:text-[19px] lg:text-[21.963px] lg:tracking-[0.439px] lg:placeholder:text-[21.963px]"
            aria-label="Buscar productos"
          />
          <button
            type="button"
            aria-label="Buscar productos"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-[#ef4f39] transition-colors hover:bg-[#e2e2e2]"
          >
            <SearchIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
