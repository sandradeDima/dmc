"use client";

/* eslint-disable @next/next/no-img-element */
import CotizarHero from "./CotizarHero";
import CotizacionFormCard from "./CotizacionFormCard";

export default function CotizarPageContent() {
  return (
    <div className="bg-[#E8E8E8]">
      <CotizarHero />

      <section className="relative z-10 -mt-10 pb-8 md:-mt-12 md:pb-10">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-10">
          <div className="h-[calc(100svh-220px)] overflow-hidden rounded-[30px] bg-[#DDE0E8] shadow-[0_16px_36px_rgba(15,23,42,0.12)] md:h-[calc(100svh-250px)]">
            <div className="grid h-full grid-cols-1 items-stretch xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
              <div className="overflow-hidden xl:h-full">
                <img
                  src="/assets/heros/cotizar_main.png"
                  alt="Asesor de ventas atendiendo una solicitud de cotización"
                  title="Cotización DMC"
                  className="h-[200px] w-full object-cover md:h-[260px] xl:h-full"
                />
              </div>

              <div className="h-full overflow-y-auto p-4 sm:p-5 lg:p-6">
                <CotizacionFormCard embedded />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
