"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getMarcasList,
  getProductosList,
  MarcaItem,
  ProductoItem,
  ProductosPaginationData,
} from "@/lib/api";
import BrandProductCard from "./BrandProductCard";
import BrandProductsHero from "./BrandProductsHero";
import MarcasPagination from "./MarcasPagination";
import {
  formatBrandTitleFromSlug,
  normalizeBrandValue,
} from "./marcasUtils";

function safePageValue(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function normalizeSearchValue(raw: string | null): string {
  return raw?.trim() ?? "";
}

function matchesBrand(item: ProductoItem, normalizedBrandSlug: string): boolean {
  const marcaNombre = item.marca?.nombre?.trim();
  if (!marcaNombre) return false;

  const normalizedMarcaNombre = normalizeBrandValue(marcaNombre);
  if (!normalizedMarcaNombre) return false;

  return (
    normalizedMarcaNombre === normalizedBrandSlug ||
    normalizedMarcaNombre.includes(normalizedBrandSlug) ||
    normalizedBrandSlug.includes(normalizedMarcaNombre)
  );
}

function filterProductsByBrand(
  items: ProductoItem[],
  normalizedBrandSlug: string,
): ProductoItem[] {
  if (!normalizedBrandSlug) return items;

  const withBrandName = items.filter((item) => {
    const marcaNombre = item.marca?.nombre?.trim();
    return Boolean(marcaNombre && normalizeBrandValue(marcaNombre));
  });

  // If backend does not include nested marca in this payload, trust backend filter.
  if (withBrandName.length === 0) return items;

  return withBrandName.filter((item) => matchesBrand(item, normalizedBrandSlug));
}

function matchesMarcaSlug(marca: MarcaItem, normalizedSlug: string): boolean {
  if (!normalizedSlug) return false;

  const normalizedMarcaSlug = normalizeBrandValue(marca.slug);
  const normalizedMarcaNombre = normalizeBrandValue(marca.nombre);

  return (
    normalizedMarcaSlug === normalizedSlug ||
    normalizedMarcaNombre === normalizedSlug ||
    normalizedMarcaSlug.includes(normalizedSlug) ||
    normalizedSlug.includes(normalizedMarcaSlug)
  );
}

async function resolveBrandBySlug(slug: string): Promise<MarcaItem | null> {
  const normalizedSlug = normalizeBrandValue(slug);
  if (!normalizedSlug) return null;

  let currentPage = 1;
  while (true) {
    const response = await getMarcasList({
      page: currentPage,
      per_page: 100,
    });

    const match = response.data.find((marca) => matchesMarcaSlug(marca, normalizedSlug));
    if (match) return match;

    if (!response.next_page_url || currentPage >= response.last_page) {
      return null;
    }

    currentPage += 1;
  }
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M15 18l-6-6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductSkeletonCard({ index }: { index: number }) {
  return (
    <div
      key={`brand-product-skeleton-${index}`}
      className="h-full min-h-[402px] w-full max-w-[310px] animate-pulse rounded-[24px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.12)]"
    >
      <div className="h-[230px] rounded-t-[24px] bg-slate-200" />
      <div className="space-y-2 px-4 py-3">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-5/6 rounded bg-slate-200" />
      </div>
      <div className="px-4 pb-4">
        <div className="mx-auto h-10 w-[190px] rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

type BrandProductsPageProps = {
  slug: string;
};

export default function BrandProductsPage({ slug }: BrandProductsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedPage = safePageValue(searchParams.get("page"));
  const requestedNombre = normalizeSearchValue(searchParams.get("nombre"));

  const normalizedSlug = normalizeBrandValue(slug);
  const fallbackTitle = formatBrandTitleFromSlug(slug);

  const [currentPage, setCurrentPage] = useState(requestedPage);
  const [searchTerm, setSearchTerm] = useState(requestedNombre);
  const [searchInput, setSearchInput] = useState(requestedNombre);
  const [brandTitle, setBrandTitle] = useState(fallbackTitle);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [normalizedBrandMatch, setNormalizedBrandMatch] = useState(normalizedSlug);
  const [isBrandResolved, setIsBrandResolved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [paginationData, setPaginationData] = useState<ProductosPaginationData | null>(
    null,
  );

  useEffect(() => {
    setCurrentPage(requestedPage);
    setSearchTerm(requestedNombre);
    setSearchInput(requestedNombre);
  }, [requestedNombre, requestedPage]);

  useEffect(() => {
    let isCancelled = false;

    const loadBrand = async () => {
      setIsLoading(true);
      setHasError(false);
      setIsBrandResolved(false);
      setPaginationData(null);

      try {
        const brand = await resolveBrandBySlug(slug);
        if (isCancelled) return;

        if (!brand) {
          setBrandId(null);
          setBrandTitle(fallbackTitle);
          setNormalizedBrandMatch(normalizedSlug);
        } else {
          const safeTitle = brand.nombre?.trim() || fallbackTitle;
          setBrandId(brand.id);
          setBrandTitle(safeTitle);
          setNormalizedBrandMatch(normalizeBrandValue(safeTitle) || normalizedSlug);
        }
      } catch {
        if (!isCancelled) {
          setBrandId(null);
          setBrandTitle(fallbackTitle);
          setNormalizedBrandMatch(normalizedSlug);
          setHasError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsBrandResolved(true);
        }
      }
    };

    void loadBrand();

    return () => {
      isCancelled = true;
    };
  }, [fallbackTitle, normalizedSlug, slug]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const loadProductos = async () => {
      if (!isBrandResolved) return;

      if (brandId === null) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const response = await getProductosList({
          page: currentPage,
          per_page: 12,
          nombre: searchTerm || undefined,
          marca: brandId,
        });
        if (isCancelled || controller.signal.aborted) return;

        const filteredItems = filterProductsByBrand(response.data, normalizedBrandMatch);

        const apiTitle = filteredItems.find((item) => item.marca?.nombre?.trim())
          ?.marca?.nombre;
        if (apiTitle?.trim()) {
          setBrandTitle(apiTitle.trim());
        }

        setPaginationData({
          ...response,
          data: filteredItems,
        });
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

    void loadProductos();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [brandId, currentPage, isBrandResolved, normalizedBrandMatch, searchTerm]);

  const visibleProducts = useMemo(() => paginationData?.data ?? [], [paginationData?.data]);

  const isEmpty = !isLoading && !hasError && visibleProducts.length === 0;

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
      <BrandProductsHero
        title={brandTitle}
        searchValue={searchInput}
        onSearchValueChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        isLoading={isLoading}
      />

      <section className="relative z-10 -mt-20 pb-16 md:-mt-24">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-10">
          <div className="mb-7 flex items-center">
            <Link
              href="/marcas"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#F54029] transition hover:bg-white/80"
              aria-label="Volver a marcas"
            >
              <ArrowLeftIcon />
            </Link>

            <div className="flex-1 px-3 text-center">
              <h2 className="text-[22px] font-medium text-[#F5F7FA] md:text-[24px]">
                Productos
              </h2>
              <div className="mx-auto mt-2 h-px w-full max-w-[780px] bg-white/60" />
            </div>

            <div className="h-10 w-10" />
          </div>

          {hasError ? (
            <div className="rounded-[18px] bg-white px-8 py-14 text-center shadow-[0_14px_32px_rgba(15,23,42,0.10)]">
              <p className="text-lg text-[#5D6673]">
                No se pudieron cargar los productos de esta marca.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeletonCard key={`loading-product-${index}`} index={index} />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="rounded-[18px] bg-white px-8 py-14 text-center shadow-[0_14px_32px_rgba(15,23,42,0.10)]">
              <p className="text-lg text-[#5D6673]">
                No hay productos disponibles para esta marca.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <BrandProductCard key={product.id} product={product} />
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
