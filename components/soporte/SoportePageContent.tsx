"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getInformacion,
  getMarcasList,
  MarcaItem,
  postSoporte,
} from "@/lib/api";
import { buildImageUrl } from "@/components/marcas/marcasUtils";
import SoporteHero from "./SoporteHero";
import {
  buildQrImageUrl,
  extractSupportPhoneFromBrand,
  generateQrValueForBrand,
  isValidEmail,
  sanitizePhoneInput,
} from "./soporteUtils";

type SoporteFormValues = {
  nombre_apellido: string;
  telefono: string;
  mail: string;
  mensaje: string;
};

type FormErrors = Partial<Record<keyof SoporteFormValues | "marca", string>>;

const INITIAL_VALUES: SoporteFormValues = {
  nombre_apellido: "",
  telefono: "",
  mail: "",
  mensaje: "",
};

const HOVER_GRADIENT =
  "linear-gradient(138deg, #EF4F39 0%, rgba(86,100,111,0.8) 78%, rgba(86,100,111,1) 100%)";

function normalizeWebsiteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

function filterActiveBrands(items: MarcaItem[]): MarcaItem[] {
  return items.filter((item) => item.estado?.toLowerCase() === "activo");
}

async function getAllActiveBrands(): Promise<MarcaItem[]> {
  const collected: MarcaItem[] = [];
  let currentPage = 1;

  while (true) {
    const response = await getMarcasList({ page: currentPage, per_page: 100 });
    collected.push(...filterActiveBrands(response.data));

    if (!response.next_page_url || currentPage >= response.last_page) {
      break;
    }

    currentPage += 1;
  }

  const deduped = Array.from(new Map(collected.map((item) => [item.id, item])).values());

  return deduped.sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
}

function HeadsetIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M4 13v3a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2Zm16 0v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13a8 8 0 1 1 16 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 18v2.2a1.8 1.8 0 0 1-1.8 1.8H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M7.7 3h2.7c.5 0 .9.3 1 .8l.8 3.4a1 1 0 0 1-.4 1.1l-1.8 1.2c.9 1.9 2.4 3.5 4.2 4.5l1.4-1.7a1 1 0 0 1 1.1-.3l3.2 1a1 1 0 0 1 .7 1v2.8a1 1 0 0 1-.9 1c-8.2.8-14.8-5.8-14-14A1 1 0 0 1 7.7 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="m4 7 8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QrIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M15 15h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm2-2h2v2h-2zm2 2h2v2h-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function BrandSelectorSkeleton({ index }: { index: number }) {
  return (
    <div
      key={`brand-skeleton-${index}`}
      className="animate-pulse rounded-[16px] border border-white/20 bg-white/90 p-3"
    >
      <div className="h-14 rounded-[12px] bg-slate-200" />
      <div className="mx-auto mt-2 h-3 w-2/3 rounded bg-slate-200" />
    </div>
  );
}

function validateForm(values: SoporteFormValues, hasBrand: boolean): FormErrors {
  const errors: FormErrors = {};

  if (!hasBrand) {
    errors.marca = "Selecciona una marca para continuar.";
  }

  if (!values.nombre_apellido.trim()) {
    errors.nombre_apellido = "El nombre y apellido es obligatorio.";
  }

  const phone = values.telefono.trim();
  const digits = phone.replace(/[^\d]/g, "");
  if (!phone) {
    errors.telefono = "El teléfono es obligatorio.";
  } else if (digits.length < 6) {
    errors.telefono = "Ingresa un teléfono válido.";
  }

  if (!isValidEmail(values.mail)) {
    errors.mail = "Ingresa un correo válido.";
  }

  if (!values.mensaje.trim()) {
    errors.mensaje = "El mensaje es obligatorio.";
  }

  return errors;
}

export default function SoportePageContent() {
  const [brands, setBrands] = useState<MarcaItem[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [fallbackPhone, setFallbackPhone] = useState<string | null>(null);
  const [fallbackEmail, setFallbackEmail] = useState<string | null>(null);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [hasBrandError, setHasBrandError] = useState(false);

  const [values, setValues] = useState<SoporteFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const feedbackRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!feedback) return;

    feedbackRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [feedback]);

  useEffect(() => {
    let isCancelled = false;

    const loadSupportData = async () => {
      setIsLoadingBrands(true);
      setHasBrandError(false);

      try {
        const [brandsResponse, informacionResponse] = await Promise.all([
          getAllActiveBrands(),
          getInformacion().catch(() => null),
        ]);

        if (isCancelled) return;

        setBrands(brandsResponse);
        setFallbackPhone(informacionResponse?.Informacion?.telefono?.trim() || null);
        setFallbackEmail(informacionResponse?.Informacion?.correo?.trim() || null);

        setSelectedBrandId((previous) => {
          if (previous && brandsResponse.some((item) => item.id === previous)) {
            return previous;
          }

          return brandsResponse[0]?.id ?? null;
        });
      } catch {
        if (isCancelled) return;
        setBrands([]);
        setFallbackPhone(null);
        setFallbackEmail(null);
        setSelectedBrandId(null);
        setHasBrandError(true);
      } finally {
        if (!isCancelled) {
          setIsLoadingBrands(false);
        }
      }
    };

    void loadSupportData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const selectedBrand = useMemo(
    () => brands.find((item) => item.id === selectedBrandId) ?? null,
    [brands, selectedBrandId],
  );

  const selectedBrandLogo = buildImageUrl(selectedBrand?.imagen_principal);
  const selectedBrandWebsite = normalizeWebsiteUrl(selectedBrand?.url_sitio_web);

  const supportPhone = useMemo(
    () => extractSupportPhoneFromBrand(selectedBrand, fallbackPhone),
    [fallbackPhone, selectedBrand],
  );

  const whatsappUrl = useMemo(
    () => generateQrValueForBrand(selectedBrand, fallbackPhone),
    [fallbackPhone, selectedBrand],
  );

  const qrImageUrl = useMemo(() => buildQrImageUrl(whatsappUrl), [whatsappUrl]);

  const updateField = <K extends keyof SoporteFormValues>(
    key: K,
    value: SoporteFormValues[K],
  ) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;

      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const nextErrors = validateForm(values, Boolean(selectedBrand));
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedBrand) return;

    setIsSubmitting(true);

    try {
      const brandContext = `Marca seleccionada: ${selectedBrand.nombre} (ID ${selectedBrand.id})`;

      await postSoporte({
        nombre_completo: values.nombre_apellido.trim(),
        telefono: values.telefono.trim(),
        email: values.mail.trim(),
        mensaje: `${values.mensaje.trim()}\n\n${brandContext}`,
      });

      setValues(INITIAL_VALUES);
      setErrors({});
      setFeedback({
        type: "success",
        message: "Solicitud de soporte enviada correctamente.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "No se pudo enviar la solicitud de soporte.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <SoporteHero />

      <section className="relative z-10 -mt-10 pb-10 md:-mt-12 md:pb-12">
        <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-[30px] bg-[#DDE0E8] shadow-[0_18px_38px_rgba(15,23,42,0.14)]">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch">
              <aside className="flex flex-col bg-[#5F6B76] px-4 py-5 sm:px-5 sm:py-6 lg:h-full lg:min-h-0 lg:overflow-hidden lg:px-6">
                <h2 className="text-center text-[20px] font-semibold text-white lg:text-left">
                  Selecciona la marca
                </h2>

                {hasBrandError ? (
                  <div className="mt-4 rounded-[14px] border border-white/30 bg-white/10 p-3 text-center text-sm text-white/90">
                    No se pudieron cargar las marcas.
                  </div>
                ) : null}

                {errors.marca ? (
                  <p className="mt-3 text-center text-[13px] text-[#FFD2CD] lg:text-left">
                    {errors.marca}
                  </p>
                ) : null}

                <div className="mt-4 max-h-[320px] flex-1 space-y-2.5 overflow-y-auto pb-1 pr-1 lg:max-h-[520px] xl:max-h-[560px]">
                  {isLoadingBrands
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <BrandSelectorSkeleton key={index} index={index} />
                      ))
                    : brands.map((brand) => {
                        const logoUrl = buildImageUrl(brand.imagen_principal);
                        const isActive = selectedBrandId === brand.id;

                        return (
                          <button
                            key={brand.id}
                            type="button"
                            onClick={() => {
                              setSelectedBrandId(brand.id);
                              setErrors((previous) => {
                                if (!previous.marca) return previous;
                                const next = { ...previous };
                                delete next.marca;
                                return next;
                              });
                            }}
                            className={`group relative w-full overflow-hidden rounded-[16px] border p-2.5 text-left transition-all duration-250 ${
                              isActive
                                ? "border-[#F54029] bg-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                                : "border-white/20 bg-white/95 hover:border-white/40"
                            }`}
                            aria-pressed={isActive}
                          >
                            <div className="relative z-10 flex h-[52px] items-center justify-center rounded-[12px] bg-white transition-opacity duration-250 group-hover:opacity-10">
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt={brand.alt_imagen?.trim() || brand.nombre}
                                  title={brand.title_imagen?.trim() || brand.nombre}
                                  className="h-full w-auto max-w-full object-contain p-1"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-[#3A4655]">
                                  {brand.nombre}
                                </span>
                              )}
                            </div>

                            <p className="relative z-10 mt-1.5 text-center text-[11px] font-semibold tracking-[0.02em] text-[#4A5563] transition-opacity duration-250 group-hover:opacity-0">
                              {brand.nombre}
                            </p>

                            <span
                              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
                              style={{ backgroundImage: HOVER_GRADIENT }}
                            />

                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 scale-95 transition-all duration-250 group-hover:scale-100 group-hover:opacity-100">
                              <HeadsetIcon className="h-10 w-10" />
                            </span>

                            {isActive ? (
                              <span className="pointer-events-none absolute inset-0 rounded-[16px] ring-2 ring-[#F54029]/75" />
                            ) : null}
                          </button>
                        );
                      })}

                  {!isLoadingBrands && !hasBrandError && brands.length === 0 ? (
                    <div className="rounded-[14px] border border-white/30 bg-white/10 p-3 text-center text-sm text-white/90">
                      No hay marcas disponibles.
                    </div>
                  ) : null}
                </div>
              </aside>

              <div className="bg-[#ECEFF4] px-4 py-4 sm:px-5 sm:py-5 lg:min-h-0 lg:px-6 lg:py-6">
                <div className="rounded-[18px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:p-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-[58px] min-w-[120px] items-center justify-center rounded-[12px] bg-[#F5F7FA] px-3">
                      {selectedBrandLogo ? (
                        <img
                          src={selectedBrandLogo}
                          alt={selectedBrand?.alt_imagen?.trim() || selectedBrand?.nombre || "Marca"}
                          title={selectedBrand?.title_imagen?.trim() || selectedBrand?.nombre || "Marca"}
                          className="h-full w-auto max-w-[150px] object-contain py-1"
                        />
                      ) : (
                        <span className="text-[14px] font-semibold text-[#3A4655]">
                          {selectedBrand?.nombre || "Marca"}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-[22px] font-semibold leading-none text-[#2F3B52]">
                        {selectedBrand?.nombre || "Selecciona una marca"}
                      </h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-[#677486]">
                        {selectedBrand?.descripcion?.trim() ||
                          "Completa el formulario para que nuestro equipo de soporte te contacte."}
                      </p>
                    </div>
                  </div>

                  {selectedBrandWebsite ? (
                    <a
                      href={selectedBrandWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D7DEE9] px-3 py-1.5 text-[13px] font-medium text-[#5E6A7B] transition hover:border-[#F54029] hover:text-[#F54029]"
                    >
                      Sitio web: {selectedBrandWebsite}
                    </a>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-stretch">
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="h-full rounded-[22px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:p-5"
                  >
                    <h4 className="text-[20px] font-semibold leading-none text-[#2F3B52]">
                      Formulario de soporte
                    </h4>

                    <div className="mt-3 space-y-2.5">
                      <div>
                        <label
                          htmlFor="soporte_nombre"
                          className="mb-1 block text-[13px] font-medium text-[#4F5965]"
                        >
                          Nombre y Apellido*
                        </label>
                        <input
                          id="soporte_nombre"
                          type="text"
                          value={values.nombre_apellido}
                          onChange={(event) =>
                            updateField("nombre_apellido", event.target.value)
                          }
                          className="h-11 w-full rounded-[12px] border border-transparent bg-[#F5F7FA] px-3.5 text-[14px] text-[#334155] outline-none transition focus:border-[#F54029]/55"
                          placeholder="Nombre y apellido"
                          autoComplete="name"
                        />
                        {errors.nombre_apellido ? (
                          <p className="mt-1 text-[12px] text-[#D33E2B]">
                            {errors.nombre_apellido}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="soporte_telefono"
                            className="mb-1 block text-[13px] font-medium text-[#4F5965]"
                          >
                            Teléfono*
                          </label>
                          <input
                            id="soporte_telefono"
                            type="tel"
                            value={values.telefono}
                            onChange={(event) =>
                              updateField("telefono", sanitizePhoneInput(event.target.value))
                            }
                            className="h-11 w-full rounded-[12px] border border-transparent bg-[#F5F7FA] px-3.5 text-[14px] text-[#334155] outline-none transition focus:border-[#F54029]/55"
                            placeholder="Ej. 77050407"
                            autoComplete="tel"
                          />
                          {errors.telefono ? (
                            <p className="mt-1 text-[12px] text-[#D33E2B]">{errors.telefono}</p>
                          ) : null}
                        </div>

                        <div>
                          <label
                            htmlFor="soporte_mail"
                            className="mb-1 block text-[13px] font-medium text-[#4F5965]"
                          >
                            Mail*
                          </label>
                          <input
                            id="soporte_mail"
                            type="email"
                            value={values.mail}
                            onChange={(event) => updateField("mail", event.target.value)}
                            className="h-11 w-full rounded-[12px] border border-transparent bg-[#F5F7FA] px-3.5 text-[14px] text-[#334155] outline-none transition focus:border-[#F54029]/55"
                            placeholder="correo@ejemplo.com"
                            autoComplete="email"
                          />
                          {errors.mail ? (
                            <p className="mt-1 text-[12px] text-[#D33E2B]">{errors.mail}</p>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="soporte_mensaje"
                          className="mb-1 block text-[13px] font-medium text-[#4F5965]"
                        >
                          Mensaje*
                        </label>
                        <textarea
                          id="soporte_mensaje"
                          value={values.mensaje}
                          onChange={(event) => updateField("mensaje", event.target.value)}
                          className="min-h-[96px] w-full resize-y rounded-[12px] border border-transparent bg-[#F5F7FA] px-3.5 py-2.5 text-[14px] text-[#334155] outline-none transition focus:border-[#F54029]/55"
                          placeholder="Describe tu consulta de soporte"
                        />
                        {errors.mensaje ? (
                          <p className="mt-1 text-[12px] text-[#D33E2B]">{errors.mensaje}</p>
                        ) : null}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedBrand || hasBrandError}
                        className="inline-flex h-10 w-full items-center justify-center rounded-full border border-[#F54029] bg-white px-4 text-[15px] font-semibold text-[#F54029] transition hover:bg-[#F54029] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {isSubmitting ? "Enviando..." : "Enviar"}
                      </button>

                      {feedback ? (
                        <p
                          ref={feedbackRef}
                          className={`text-center text-[13px] font-medium ${
                            feedback.type === "success" ? "text-[#2E7D32]" : "text-[#D33E2B]"
                          }`}
                        >
                          {feedback.message}
                        </p>
                      ) : null}
                    </div>
                  </form>

                  <aside className="h-full rounded-[22px] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                    <div className="overflow-hidden rounded-[14px]">
                      <img
                        src="/assets/heros/soporte_main.png"
                        alt="Canal de atención de soporte"
                        title="Soporte DMC"
                        className="h-[84px] w-full object-cover"
                      />
                    </div>

                    <div className="mt-4 rounded-[14px] bg-[#F5F7FA] p-4">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7A8594]">
                        Soporte WhatsApp
                      </p>

                      <div className="mt-2 space-y-2 text-[14px] text-[#4E5967]">
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-[#F54029]" />
                          <span>{supportPhone || "No disponible"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MailIcon className="h-4 w-4 text-[#F54029]" />
                          <span>{fallbackEmail || "No disponible"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[14px] border border-[#E4E8EF] p-4 text-center">
                      <div className="mb-3 inline-flex items-center gap-2 text-[13px] font-medium text-[#5C6776]">
                        <QrIcon className="h-4 w-4 text-[#F54029]" />
                        Escanea para chatear por WhatsApp
                      </div>

                      {qrImageUrl ? (
                        <img
                          src={qrImageUrl}
                          alt={`QR de WhatsApp para ${selectedBrand?.nombre || "soporte"}`}
                          title="QR de soporte por WhatsApp"
                          className="mx-auto h-[148px] w-[148px] rounded-[10px] border border-[#E6EAF1] bg-white p-2"
                        />
                      ) : (
                        <div className="mx-auto flex h-[148px] w-[148px] items-center justify-center rounded-[10px] border border-dashed border-[#CCD3DE] bg-[#F5F7FA] text-[13px] text-[#7A8594]">
                          Sin número disponible
                        </div>
                      )}

                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-[#F54029] px-4 text-[14px] font-semibold text-[#F54029] transition hover:bg-[#F54029] hover:text-white"
                        >
                          Abrir WhatsApp
                        </a>
                      ) : null}
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
