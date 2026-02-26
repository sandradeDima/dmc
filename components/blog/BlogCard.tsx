"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { BlogPostItem } from "@/lib/api";
import { buildImageUrl, formatBlogDate } from "./blogUtils";

function resolveAuthorLabel(post: BlogPostItem): string {
  const name = post.autor?.name?.trim();
  return name && name.length > 0 ? name : "Autor";
}

type BlogCardProps = {
  post: BlogPostItem;
};

export default function BlogCard({ post }: BlogCardProps) {
  const coverImageUrl = buildImageUrl(post.imagen_portada);
  const imageAlt = post.alt_imagen?.trim() || post.titulo;
  const imageTitle = post.title_imagen?.trim() || post.titulo;
  const authorLabel = resolveAuthorLabel(post);
  const publishedDate = formatBlogDate(post.fecha_publicacion);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block w-full max-w-[360px] overflow-hidden rounded-[18px] bg-[#F8F8F8] shadow-[0_14px_34px_rgba(15,23,42,0.12)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative h-[218px] overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={imageAlt}
            title={imageTitle}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-300 text-sm text-slate-600">
            Sin imagen
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.85))]" />
        <h2 className="absolute bottom-3 left-4 right-4 line-clamp-2 text-[16px] font-semibold leading-tight text-white">
          {post.titulo}
        </h2>
      </div>

      <div className="space-y-2 px-4 py-3">
        <p className="text-[12px] text-[#737B88]">
          {authorLabel} - {publishedDate}
        </p>
        <p className="line-clamp-3 text-[14px] leading-snug text-[#56646F]">
          {post.descripcion_corta?.trim() || "Sin descripción disponible."}
        </p>
      </div>
    </Link>
  );
}
