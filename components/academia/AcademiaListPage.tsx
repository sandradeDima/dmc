"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AcademiaEventoItem,
  AcademiaPaginationData,
  getAcademiaList,
} from "@/lib/api";
import AcademiaEventCard from "./AcademiaEventCard";
import AcademiaHero from "./AcademiaHero";
import AcademiaPagination from "./AcademiaPagination";

function safePageValue(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function filterVisibleEvents(items: AcademiaEventoItem[]): AcademiaEventoItem[] {
  return items.filter(
    (item) =>
      item.estado?.toLowerCase() === "activo" &&
      item.estado_evento?.toLowerCase() === "programado",
  );
}

function AcademiaEventSkeleton({ index }: { index: number }) {
  return (
    <div
      key={`academia-skeleton-${index}`}
      className="overflow-hidden rounded-[18px] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.10)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)]">
        <div className="space-y-2 px-5 py-4">
          <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, row) => (
              <div
                key={`academia-skeleton-row-${index}-${row}`}
                className="h-3.5 w-2/3 animate-pulse rounded bg-slate-200"
              />
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 md:border-t-0 md:border-l md:border-slate-100">
          <div className="h-[132px] animate-pulse bg-slate-200" />
          <div className="space-y-3 px-4 py-3">
            <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-9 w-full animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcademiaListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedPage = safePageValue(searchParams.get("page"));

  const [currentPage, setCurrentPage] = useState(requestedPage);
  const [paginationData, setPaginationData] = useState<AcademiaPaginationData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentPage(requestedPage);
  }, [requestedPage]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const loadAcademia = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await getAcademiaList({
          page: currentPage,
          per_page: 8,
        });
        if (isCancelled || controller.signal.aborted) return;
        setPaginationData(response);
      } catch {
        if (!isCancelled && !controller.signal.aborted) {
          setPaginationData(null);
          setHasError(true);
        }
      } finally {
        if (!isCancelled && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadAcademia();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [currentPage]);

  const visibleEvents = useMemo(
    () => filterVisibleEvents(paginationData?.data ?? []),
    [paginationData?.data],
  );

  const isEmpty = !isLoading && !hasError && visibleEvents.length === 0;

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);

    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <AcademiaHero />

      <section className="relative z-10 -mt-24 pb-16 md:-mt-28">
        <div className="mx-auto w-full max-w-[1260px] px-6 sm:px-8 lg:px-10">
          {hasError ? (
            <div className="rounded-[18px] bg-white px-8 py-16 text-center shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
              <p className="text-lg text-[#5D6673]">
                No se pudieron cargar los eventos de Academia.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <AcademiaEventSkeleton key={`loading-${index}`} index={index} />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="rounded-[18px] bg-white px-8 py-16 text-center shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
              <p className="text-lg text-[#5D6673]">
                No hay eventos disponibles en este momento.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {visibleEvents.map((event) => (
                  <AcademiaEventCard key={event.id} event={event} />
                ))}
              </div>

              <AcademiaPagination
                links={paginationData?.links ?? []}
                isLoading={isLoading}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

