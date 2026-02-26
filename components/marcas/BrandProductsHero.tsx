"use client";

type BrandProductsHeroProps = {
  title: string;
  searchValue: string;
  isLoading?: boolean;
  onSearchValueChange: (value: string) => void;
  onSearchSubmit: () => void;
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="m16 16 4.2 4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BrandProductsHero({
  title,
  searchValue,
  isLoading = false,
  onSearchValueChange,
  onSearchSubmit,
}: BrandProductsHeroProps) {
  return (
    <section className="relative h-[400px] overflow-hidden md:h-[477px]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/heros/marcas_inside.png')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(239,79,57,0.71),rgba(86,100,111,0.71))]" />

      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="w-full px-6">
          <h1 className="text-center text-[36px] font-semibold leading-none text-white">
            {title}
          </h1>

          <form
            className="mx-auto mt-12 flex w-full max-w-[720px] items-center rounded-full bg-white p-2 pl-5 shadow-[0_12px_30px_rgba(15,23,42,0.2)]"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit();
            }}
          >
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              placeholder="Buscar productos"
              className="h-10 w-full border-0 bg-transparent text-[15px] text-[#4F5965] placeholder:text-[#98A0AB] outline-none"
              aria-label="Buscar productos de la marca"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[#F54029] transition ${
                isLoading ? "cursor-not-allowed opacity-50" : "hover:bg-[#F54029]/10"
              }`}
              aria-label="Buscar"
            >
              <SearchIcon />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
