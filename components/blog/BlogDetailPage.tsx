"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BlogPostItem,
  getBlogDetalle,
  getBlogList,
} from "@/lib/api";
import BlogHero from "./BlogHero";
import {
  buildImageUrl,
  formatBlogDate,
  normalizeBlogHtml,
  stripHtmlToText,
} from "./blogUtils";

const SIDEBAR_LIMIT = 3;

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

function normalizePost(input: unknown): BlogPostItem | null {
  if (!input || typeof input !== "object") return null;

  const item = input as Partial<BlogPostItem>;
  if (!item.slug || !item.titulo || !item.id) return null;

  return {
    id: Number(item.id),
    titulo: String(item.titulo),
    descripcion_corta:
      typeof item.descripcion_corta === "string" ? item.descripcion_corta : null,
    contenido: typeof item.contenido === "string" ? item.contenido : null,
    imagen_portada:
      typeof item.imagen_portada === "string" ? item.imagen_portada : null,
    title_imagen:
      typeof item.title_imagen === "string" ? item.title_imagen : null,
    alt_imagen: typeof item.alt_imagen === "string" ? item.alt_imagen : null,
    fecha_publicacion:
      typeof item.fecha_publicacion === "string" ? item.fecha_publicacion : null,
    estado_blog: typeof item.estado_blog === "string" ? item.estado_blog : "",
    estado: typeof item.estado === "string" ? item.estado : "",
    slug: String(item.slug),
    autor_id:
      typeof item.autor_id === "number"
        ? item.autor_id
        : item.autor_id === null
          ? null
          : null,
    autor:
      item.autor && typeof item.autor === "object"
        ? {
            id: Number((item.autor as { id?: number }).id ?? 0),
            name: String((item.autor as { name?: string }).name ?? ""),
            email: String((item.autor as { email?: string }).email ?? ""),
          }
        : null,
  };
}

function isPublishedPost(item: BlogPostItem): boolean {
  return (
    item.estado?.toLowerCase() === "activo" &&
    item.estado_blog?.toLowerCase() === "publicado"
  );
}

function resolveAuthorName(item: BlogPostItem): string {
  const name = item.autor?.name?.trim();
  return name && name.length > 0 ? name : "Autor";
}

function SidebarCard({ post }: { post: BlogPostItem }) {
  const imageUrl = buildImageUrl(post.imagen_portada);
  const title = post.titulo;
  const date = formatBlogDate(post.fecha_publicacion);
  const author = resolveAuthorName(post);
  const description =
    post.descripcion_corta?.trim() ||
    stripHtmlToText(post.contenido) ||
    "Sin descripción disponible.";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block overflow-hidden rounded-[18px] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.10)]"
    >
      <div className="relative h-[260px] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.alt_imagen?.trim() || title}
            title={post.title_imagen?.trim() || title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
          style={{ backgroundImage: "url('/assets/heros/blog_inside.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(239,79,57,0.71),rgba(86,100,111,0.71))]" />

        <h3 className="absolute bottom-4 left-4 right-4 line-clamp-2 text-[17px] font-semibold leading-tight text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-2 px-4 py-3">
        <p className="text-[12px] text-[#737B88]">
          {author} - {date}
        </p>
        <p className="line-clamp-3 text-[14px] leading-snug text-[#56646F]">{description}</p>
      </div>
    </Link>
  );
}

function DetailLoadingSkeleton() {
  return (
    <section>
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[26px] bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
            <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-[420px] animate-pulse rounded-[22px] bg-slate-200" />
            <div className="mt-6 h-10 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-5 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="mt-6 space-y-3">
              <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-11/12 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <aside className="rounded-[26px] bg-[#EDEDED] p-4 sm:p-5">
            <div className="space-y-4">
              {Array.from({ length: SIDEBAR_LIMIT }).map((_, index) => (
                <div
                  key={`sidebar-skeleton-${index}`}
                  className="overflow-hidden rounded-[18px] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.10)]"
                >
                  <div className="h-[260px] animate-pulse bg-slate-200" />
                  <div className="space-y-2 px-4 py-3">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

type BlogDetailPageProps = {
  slug: string;
};

export default function BlogDetailPage({ slug }: BlogDetailPageProps) {
  const [post, setPost] = useState<BlogPostItem | null>(null);
  const [sidebarPosts, setSidebarPosts] = useState<BlogPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const [detailResponse, listResponse] = await Promise.all([
          getBlogDetalle(slug),
          getBlogList({ page: 1, per_page: 12 }),
        ]);

        if (isCancelled) return;

        const normalizedDetail = normalizePost(detailResponse);
        const normalizedList = (listResponse.data ?? [])
          .map((item) => normalizePost(item))
          .filter((item): item is BlogPostItem => item !== null)
          .filter(isPublishedPost);

        const detailFromList = normalizedList.find((item) => item.slug === slug) ?? null;
        const mergedDetail = normalizedDetail
          ? {
              ...normalizedDetail,
              autor: normalizedDetail.autor ?? detailFromList?.autor ?? null,
            }
          : detailFromList;

        if (!mergedDetail || !isPublishedPost(mergedDetail)) {
          setPost(null);
          setSidebarPosts([]);
          setHasError(true);
          return;
        }

        const related = normalizedList
          .filter((item) => item.slug !== mergedDetail.slug)
          .slice(0, SIDEBAR_LIMIT);

        setPost(mergedDetail);
        setSidebarPosts(related);
      } catch {
        if (!isCancelled) {
          setPost(null);
          setSidebarPosts([]);
          setHasError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  const normalizedContent = useMemo(
    () => normalizeBlogHtml(post?.contenido),
    [post?.contenido],
  );

  const fallbackContent = useMemo(() => {
    if (!post) return "Contenido no disponible.";
    return (
      stripHtmlToText(post.descripcion_corta) ||
      stripHtmlToText(post.contenido) ||
      "Contenido no disponible."
    );
  }, [post]);

  const featuredImage = buildImageUrl(post?.imagen_portada);
  const imageAlt = post?.alt_imagen?.trim() || post?.titulo || "Artículo";
  const imageTitle = post?.title_imagen?.trim() || post?.titulo || "Artículo";
  const authorLabel = post ? resolveAuthorName(post) : "Autor";
  const publishedDate = formatBlogDate(post?.fecha_publicacion ?? null);

  return (
    <div className="min-h-screen bg-white">
      <BlogHero compact />

      {isLoading ? (
        <section className="pb-16 pt-8">
          <DetailLoadingSkeleton />
        </section>
      ) : hasError || !post ? (
        <section className="pb-16 pt-8">
          <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-10">
            <div className="rounded-[22px] bg-white px-8 py-14 text-center shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
              <p className="text-lg text-[#5D6673]">No se pudo cargar el artículo.</p>
              <Link
                href="/blog"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#F54029] px-5 py-2 text-sm font-medium text-[#F54029] transition hover:bg-[#F54029] hover:text-white"
              >
                <ArrowLeftIcon />
                Volver al blog
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="pb-16 pt-8">
          <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              <article className="bg-transparent p-0">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#F54029] transition hover:text-[#dd351f]"
                >
                  <ArrowLeftIcon />
                  Volver
                </Link>

                <div className="mt-5 overflow-hidden rounded-[22px] bg-slate-200">
                  {featuredImage ? (
                    <img
                      src={featuredImage}
                      alt={imageAlt}
                      title={imageTitle}
                      className="h-[300px] w-full object-cover sm:h-[360px] lg:h-[430px]"
                    />
                  ) : (
                    <div className="flex h-[300px] w-full items-center justify-center text-sm text-slate-600 sm:h-[360px] lg:h-[430px]">
                      Sin imagen
                    </div>
                  )}
                </div>

                <h1 className="mt-6 text-[30px] font-semibold leading-tight text-[rgb(92,104,115)] sm:text-[36px]">
                  {post.titulo}
                </h1>
                <p className="mt-3 text-[14px] text-[#6B7280]">
                  {authorLabel} - {publishedDate}
                </p>

                {normalizedContent ? (
                  <div
                    className="mt-6 text-[#3F4956] [&_a]:text-[#F54029] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#CBD5E1] [&_blockquote]:pl-4 [&_h1]:mt-8 [&_h1]:text-[32px] [&_h1]:font-semibold [&_h2]:mt-7 [&_h2]:text-[28px] [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-[24px] [&_h3]:font-semibold [&_img]:my-5 [&_img]:rounded-[14px] [&_li]:mb-2 [&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_p]:mb-4 [&_p]:text-[17px] [&_p]:leading-relaxed [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-[12px] [&_pre]:bg-slate-100 [&_pre]:p-4 [&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc"
                    dangerouslySetInnerHTML={{ __html: normalizedContent }}
                  />
                ) : (
                  <p className="mt-6 text-[17px] leading-relaxed text-[#3F4956]">
                    {fallbackContent}
                  </p>
                )}
              </article>

              <aside className="rounded-[26px] bg-[#EDEDED] p-4 sm:p-5">
                <div className="space-y-4">
                  {sidebarPosts.length > 0 ? (
                    sidebarPosts.map((item) => <SidebarCard key={item.slug} post={item} />)
                  ) : (
                    <div className="rounded-[18px] bg-white px-5 py-6 text-sm text-[#64748B]">
                      No hay artículos relacionados disponibles.
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
