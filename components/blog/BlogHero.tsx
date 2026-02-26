"use client";

type BlogHeroProps = {
  compact?: boolean;
};

export default function BlogHero({ compact = false }: BlogHeroProps) {
  return (
    <section
      className={`relative overflow-hidden ${
        compact ? "h-[180px] md:h-[210px]" : "h-[400px] md:h-[477px]"
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/heros/blog.png')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(239,79,57,0.71),rgba(86,100,111,0.71))]" />

      <div className="relative z-10 flex h-full items-center justify-center">
        <h1 className="text-center text-[36px] font-semibold leading-none text-white">
          Blog
        </h1>
      </div>
    </section>
  );
}
