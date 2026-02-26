"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getMarcasList,
  MarcaItem,
  MarcasPaginationData,
} from "@/lib/api";
import MarcaCard from "./MarcaCard";
import MarcasHero from "./MarcasHero";
import MarcasPagination from "./MarcasPagination";

function safePageValue(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function normalizeSearchValue(raw: string | null): string {
  return raw?.trim() ?? "";
}

function filterActiveMarcas(items: MarcaItem[]): MarcaItem[] {
  return items.filter((item) => item.estado?.toLowerCase() === "activo");
}

function MarcaSkeletonCard({ index }: { index: number }) {
  return (
    <div
      key={`marca-skeleton-${index}`}
      className="h-full min-h-[360px] w-full max-w-[300px] animate-pulse rounded-[18px] bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.10)]"
    >
      <div className="h-[150px] rounded-[14px] bg-slate-200" />
      <div className="mt-4 h-8 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 h-5 w-1/2 rounded bg-slate-200" />
      <div className="mt-8 h-10 w-full rounded-full bg-slate-200" />
    </div>
  );
}

export default function MarcasListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedPage = safePageValue(searchParams.get("page"));
  const requestedNombre = normalizeSearchValue(searchParams.get("nombre"));

  const [currentPage, setCurrentPage] = useState(requestedPage);
  const [searchTerm, setSearchTerm] = useState(requestedNombre);
  const [searchInput, setSearchInput] = useState(requestedNombre);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [paginationData, setPaginationData] = useState<MarcasPaginationData | null>(
    null,
  );

  useEffect(() => {
    setCurrentPage(requestedPage);
    setSearchTerm(requestedNombre);
    setSearchInput(requestedNombre);
  }, [requestedNombre, requestedPage]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const loadMarcas = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await getMarcasList({
          page: currentPage,
          per_page: 12,
          nombre: searchTerm || undefined,
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

    void loadMarcas();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [currentPage, searchTerm]);

  const visibleMarcas = useMemo(
    () => filterActiveMarcas(paginationData?.data ?? []),
    [paginationData?.data],
  );

  const isEmpty = !isLoading && !hasError && visibleMarcas.length === 0;

  const updateUrl = (page: number, nombre: string) => {
    const params = new URLSearchParams();

    if (nombre) {
      params.set("nombre", nombre);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleSearchSubmit = () => {
    const normalized = searchInput.trim();
    setCurrentPage(1);
    setSearchTerm(normalized);
    updateUrl(1, normalized);
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    updateUrl(page, searchTerm);
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <MarcasHero
        searchValue={searchInput}
        onSearchValueChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        isLoading={isLoading}
      />

      <section className="relative z-10 -mt-20 pb-16 md:-mt-24">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-10">
          {hasError ? (
            <div className="rounded-[18px] bg-white px-8 py-14 text-center shadow-[0_14px_32px_rgba(15,23,42,0.10)]">
              <p className="text-lg text-[#5D6673]">No se pudieron cargar las marcas.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 justify-items-center gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <MarcaSkeletonCard key={`marca-loading-${index}`} index={index} />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="rounded-[18px] bg-white px-8 py-14 text-center shadow-[0_14px_32px_rgba(15,23,42,0.10)]">
              <p className="text-lg text-[#5D6673]">No se encontraron marcas.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 justify-items-center gap-5 md:grid-cols-2 xl:grid-cols-4">
                {visibleMarcas.map((marca) => (
                  <MarcaCard key={marca.id} marca={marca} />
                ))}
              </div>

              <MarcasPagination
                links={paginationData?.links ?? []}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
