"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BlogPaginationData,
  BlogPostItem,
  getBlogList,
} from "@/lib/api";
import BlogCard from "./BlogCard";
import BlogHero from "./BlogHero";
import BlogPagination from "./BlogPagination";

function safePageValue(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function BlogCardSkeleton({ index }: { index: number }) {
  return (
    <div
      key={`blog-skeleton-${index}`}
      className="w-full max-w-[360px] overflow-hidden rounded-[18px] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.10)]"
    >
      <div className="h-[218px] animate-pulse bg-slate-200" />
      <div className="space-y-2 px-4 py-3">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

function filterPublishedPosts(items: BlogPostItem[]): BlogPostItem[] {
  return items.filter(
    (item) =>
      item.estado?.toLowerCase() === "activo" &&
      item.estado_blog?.toLowerCase() === "publicado",
  );
}

export default function BlogListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedPage = safePageValue(searchParams.get("page"));

  const [currentPage, setCurrentPage] = useState(requestedPage);
  const [paginationData, setPaginationData] = useState<BlogPaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentPage(requestedPage);
  }, [requestedPage]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const loadBlogPage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await getBlogList({ page: currentPage, per_page: 9 });
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

    void loadBlogPage();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [currentPage]);

  const visiblePosts = useMemo(
    () => filterPublishedPosts(paginationData?.data ?? []),
    [paginationData?.data],
  );

  const isEmpty = !isLoading && !hasError && visiblePosts.length === 0;

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
      <BlogHero />

      <section className="relative z-10 -mt-24 pb-16 md:-mt-28">
        <div className="mx-auto w-full max-w-[1260px] px-6 sm:px-8 lg:px-10">
          {hasError ? (
            <div className="rounded-[18px] bg-white px-8 py-16 text-center shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
              <p className="text-lg text-[#5D6673]">No se pudo cargar el blog.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <BlogCardSkeleton key={`loading-${index}`} index={index} />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="rounded-[18px] bg-white px-8 py-16 text-center shadow-[0_14px_34px_rgba(15,23,42,0.10)]">
              <p className="text-lg text-[#5D6673]">
                No hay artículos publicados por el momento.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visiblePosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <BlogPagination
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
