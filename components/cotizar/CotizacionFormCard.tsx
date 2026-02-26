"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { postCotizacion } from "@/lib/api";

type CotizacionPerfil = "corporativa_personal" | "distribucion";

type CotizacionFormValues = {
  nombre_apellido: string;
  telefono: string;
  email: string;
  ciudad: string;
  cliente_exterior: boolean;
  perfil: CotizacionPerfil | "";
  mensaje: string;
};

type FormErrors = Partial<Record<keyof CotizacionFormValues, string>>;

const INITIAL_VALUES: CotizacionFormValues = {
  nombre_apellido: "",
  telefono: "",
  email: "",
  ciudad: "",
  cliente_exterior: false,
  perfil: "",
  mensaje: "",
};

const CITY_OPTIONS = [
  "Santa Cruz",
  "La Paz",
  "Cochabamba",
  "Sucre",
  "Tarija",
  "Oruro",
  "Potosí",
  "Beni",
  "Pando",
];

function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\-\s()]/g, "");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateForm(values: CotizacionFormValues): FormErrors {
  const errors: FormErrors = {};

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

  if (!values.cliente_exterior && !values.ciudad) {
    errors.ciudad = "Selecciona una ciudad.";
  }

  if (!values.perfil) {
    errors.perfil = "Selecciona un perfil de compra.";
  }

  if (!isValidEmail(values.email)) {
    errors.email = "Ingresa un correo válido.";
  }

  return errors;
}

type CotizacionFormCardProps = {
  embedded?: boolean;
};

export default function CotizacionFormCard({ embedded = false }: CotizacionFormCardProps) {
  const [values, setValues] = useState<CotizacionFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const feedbackRef = useRef<HTMLParagraphElement | null>(null);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  useEffect(() => {
    if (!feedback) return;

    feedbackRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [feedback]);

  const updateField = <K extends keyof CotizacionFormValues>(
    key: K,
    value: CotizacionFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleExteriorToggle = (isExterior: boolean) => {
    setValues((prev) => ({
      ...prev,
      cliente_exterior: isExterior,
      ciudad: isExterior ? "" : prev.ciudad,
    }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next.cliente_exterior;
      if (isExterior) {
        delete next.ciudad;
      }
      return next;
    });
  };

  const handleCancel = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setFeedback(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await postCotizacion({
        nombre_completo: values.nombre_apellido.trim(),
        telefono: values.telefono.trim(),
        email: values.email.trim(),
        ciudad: values.cliente_exterior ? "" : values.ciudad,
        es_cliente_exterior: values.cliente_exterior,
        tipo_cotizacion: values.perfil as CotizacionPerfil,
        mensaje: values.mensaje.trim() || null,
      });

      setFeedback({
        type: "success",
        message: "Cotización enviada correctamente.",
      });
      setValues(INITIAL_VALUES);
      setErrors({});
    } catch {
      setFeedback({
        type: "error",
        message: "No se pudo enviar la cotización. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${
        embedded
          ? "rounded-[20px] bg-transparent p-0 shadow-none"
          : "rounded-[30px] bg-[#DDE0E8] p-6 shadow-[0_16px_36px_rgba(15,23,42,0.12)] sm:p-8"
      }`}
    >
      <h2 className="text-center text-[22px] font-semibold leading-none text-[#2F3B52] sm:text-[25px]">
        Formulario
      </h2>

      <form className="mt-3 space-y-2.5" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="nombre_apellido"
            className="mb-1 block text-[12px] font-medium text-[#4F5965] sm:text-[13px]"
          >
            Nombre y Apellido*
          </label>
          <input
            id="nombre_apellido"
            type="text"
            value={values.nombre_apellido}
            onChange={(event) => updateField("nombre_apellido", event.target.value)}
            required
            className="h-10 w-full rounded-[12px] border border-transparent bg-white px-3.5 text-[13px] text-[#334155] outline-none transition focus:border-[#F54029]/50"
            placeholder="Nombre y apellido"
            autoComplete="name"
          />
          {errors.nombre_apellido ? (
            <p className="mt-1 text-[12px] text-[#D33E2B]">{errors.nombre_apellido}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="telefono"
            className="mb-1 block text-[12px] font-medium text-[#4F5965] sm:text-[13px]"
          >
            Teléfono*
          </label>
          <input
            id="telefono"
            type="tel"
            value={values.telefono}
            onChange={(event) =>
              updateField("telefono", sanitizePhoneInput(event.target.value))
            }
            required
            className="h-10 w-full rounded-[12px] border border-transparent bg-white px-3.5 text-[13px] text-[#334155] outline-none transition focus:border-[#F54029]/50"
            placeholder="Ej. 77050407"
            autoComplete="tel"
          />
          {errors.telefono ? (
            <p className="mt-1 text-[12px] text-[#D33E2B]">{errors.telefono}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-[12px] font-medium text-[#4F5965] sm:text-[13px]"
          >
            Mail*
          </label>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
            className="h-10 w-full rounded-[12px] border border-transparent bg-white px-3.5 text-[13px] text-[#334155] outline-none transition focus:border-[#F54029]/50"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
          />
          {errors.email ? (
            <p className="mt-1 text-[12px] text-[#D33E2B]">{errors.email}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="ciudad"
            className="mb-1 block text-[12px] font-medium text-[#4F5965] sm:text-[13px]"
          >
            Ciudad*
          </label>
          <select
            id="ciudad"
            value={values.ciudad}
            onChange={(event) => updateField("ciudad", event.target.value)}
            required={!values.cliente_exterior}
            disabled={values.cliente_exterior}
            className="h-10 w-full rounded-[12px] border border-transparent bg-white px-3.5 text-[13px] text-[#334155] outline-none transition focus:border-[#F54029]/50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">
              {values.cliente_exterior ? "No aplica para cliente exterior" : "Seleccione"}
            </option>
            {CITY_OPTIONS.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.ciudad ? (
            <p className="mt-1 text-[12px] text-[#D33E2B]">{errors.ciudad}</p>
          ) : null}
        </div>

        <div className="rounded-[12px] bg-white px-3 py-1.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-medium text-[#4F5965] sm:text-[13px]">
              ¿Es cliente del exterior?:*
            </p>

            <div className="flex items-center gap-2">
              <span
                className={`text-[12px] font-medium ${
                  !values.cliente_exterior ? "text-[#4F5965]" : "text-[#A0A6B0]"
                }`}
              >
                NO
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={values.cliente_exterior}
                aria-label="Cliente del exterior"
                onClick={() => handleExteriorToggle(!values.cliente_exterior)}
                className="relative inline-flex h-6 w-10 items-center rounded-full bg-[#E2E6EC] transition focus:outline-none focus:ring-2 focus:ring-[#F54029]/40"
              >
                <span
                  className={`inline-block h-[18px] w-[18px] rounded-full bg-[#F54029] transition-transform ${
                    values.cliente_exterior ? "translate-x-[20px]" : "translate-x-[2px]"
                  }`}
                />
              </button>

              <span
                className={`text-[12px] font-medium ${
                  values.cliente_exterior ? "text-[#4F5965]" : "text-[#A0A6B0]"
                }`}
              >
                SI
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[12px] font-medium text-[#4F5965] sm:text-[13px]">
            Para brindarte la información adecuada, indícanos tu perfil:*
          </p>

          <fieldset className="rounded-[16px] bg-white px-4 py-2.5">
            <legend className="sr-only">Perfil</legend>

            <label className="flex cursor-pointer items-start gap-2 py-1.5 text-[14px] text-[#556070]">
              <input
                type="radio"
                name="perfil"
                value="corporativa_personal"
                checked={values.perfil === "corporativa_personal"}
                onChange={() => updateField("perfil", "corporativa_personal")}
                required
                className="mt-1 h-4 w-4 accent-[#F54029]"
              />
              <span>Compras corporativas o personales</span>
            </label>

            <label className="flex cursor-pointer items-start gap-2 py-1.5 text-[14px] text-[#556070]">
              <input
                type="radio"
                name="perfil"
                value="distribucion"
                checked={values.perfil === "distribucion"}
                onChange={() => updateField("perfil", "distribucion")}
                required
                className="mt-1 h-4 w-4 accent-[#F54029]"
              />
              <span>Compras para distribución</span>
            </label>

            {errors.perfil ? (
              <p className="mt-1 text-[12px] text-[#D33E2B]">{errors.perfil}</p>
            ) : null}
          </fieldset>
        </div>

        <div>
          <label
            htmlFor="mensaje"
            className="mb-1 block text-[12px] font-medium text-[#4F5965] sm:text-[13px]"
          >
            Mensaje (opcional)
          </label>
          <textarea
            id="mensaje"
            value={values.mensaje}
            onChange={(event) => updateField("mensaje", event.target.value)}
            className="min-h-[72px] w-full resize-y rounded-[12px] border border-transparent bg-white px-3.5 py-2.5 text-[13px] text-[#334155] outline-none transition focus:border-[#F54029]/50"
            placeholder="Escribe tu solicitud"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-[#CFD4DD] px-4 text-[14px] font-medium text-[#4F5965] transition hover:bg-[#C6CCD6] disabled:cursor-not-allowed disabled:opacity-55"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-[#F54029] bg-white px-4 text-[14px] font-semibold text-[#F54029] transition hover:bg-[#F54029] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>

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

        {!isSubmitting && hasErrors ? (
          <p className="text-center text-[12px] text-[#6B7280]">
            Revisa los campos obligatorios para continuar.
          </p>
        ) : null}
      </form>
    </div>
  );
}
