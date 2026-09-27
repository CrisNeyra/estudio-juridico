"use client";

import { CalendarDays, Download } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { bookAppointment, getSlots, type BookingState } from "@/app/(site)/turnos/actions";
import { ConsentCheckbox, Honeypot } from "@/components/forms/consent-checkbox";
import { describedBy, Field, inputClass } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { services } from "@/content/services";
import { cn } from "@/lib/utils";
import type { Slot } from "@/lib/schedule";

const initial: BookingState = { status: "idle" };

export function BookingForm({
  minDate,
  maxDate,
  defaultArea,
}: {
  minDate: string;
  maxDate: string;
  defaultArea?: string;
}) {
  const [state, action] = useActionState(bookAppointment, initial);
  const [date, setDate] = useState(state.values?.date ?? "");
  const [time, setTime] = useState(state.values?.time ?? "");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotError, setSlotError] = useState<string>();
  const [loading, startLoading] = useTransition();
  const statusRef = useRef<HTMLDivElement>(null);
  const e = state.fieldErrors ?? {};
  const v = state.values ?? {};

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
    if (state.status === "error" && state.fieldErrors?.time && date) {
      startLoading(async () => {
        const r = await getSlots(date);
        setSlots(r.slots);
        setTime("");
      });
    }
  }, [state, date]);

  const onDateChange = (value: string) => {
    setDate(value);
    setTime("");
    setSlots(null);
    setSlotError(undefined);
    if (!value) return;
    startLoading(async () => {
      const r = await getSlots(value);
      setSlots(r.slots);
      setSlotError(r.error);
    });
  };

  const icsHref = useMemo(
    () =>
      state.ics ? `data:text/calendar;charset=utf-8,${encodeURIComponent(state.ics)}` : undefined,
    [state.ics],
  );

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="border-l-2 border-brand py-4 pl-6 outline-none"
      >
        <p className="display text-4xl md:text-5xl">Solicitud enviada.</p>
        {state.summary ? <p className="mt-4 text-xl">{state.summary}</p> : null}
        <p className="mt-4 text-lg text-muted-foreground">{state.message}</p>
        {icsHref ? (
          <a
            href={icsHref}
            download="turno.ics"
            className="mt-6 inline-flex items-center gap-2 link-underline"
          >
            <Download className="size-4" aria-hidden="true" /> Agregar a mi calendario
          </a>
        ) : null}
      </div>
    );
  }

  const available = slots?.filter((s) => s.available) ?? [];

  return (
    <form action={action} noValidate className="relative grid gap-10 sm:grid-cols-2">
      {state.status === "error" && state.message ? (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="border-l-2 border-destructive py-2 pl-4 text-destructive outline-none sm:col-span-2"
        >
          {state.message}
        </div>
      ) : null}

      <fieldset className="grid gap-10 sm:col-span-2 sm:grid-cols-2">
        <legend className="mb-8 display text-3xl">1. ¿Cuándo?</legend>

        <Field id="area" label="Área" error={e.area}>
          <select
            id="area"
            name="area"
            required
            defaultValue={v.area || defaultArea || ""}
            aria-invalid={e.area ? true : undefined}
            aria-describedby={describedBy("area", e.area)}
            className={inputClass}
          >
            <option value="" disabled>
              Elegí un área
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>

        <Field id="date" label="Fecha" error={e.date} hint="Lunes a viernes. Hasta 30 días.">
          <input
            id="date"
            name="date"
            type="date"
            required
            min={minDate}
            max={maxDate}
            value={date}
            onChange={(ev) => onDateChange(ev.target.value)}
            aria-invalid={e.date ? true : undefined}
            aria-describedby={describedBy("date", e.date, "hint")}
            className={inputClass}
          />
        </Field>

        <div className="sm:col-span-2">
          <p id="time-label" className="eyebrow">
            Horario
          </p>
          <input type="hidden" name="time" value={time} />
          <div aria-live="polite" className="mt-4 min-h-12">
            {!date ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" /> Elegí una fecha para ver los
                horarios.
              </p>
            ) : loading ? (
              <p className="text-sm text-muted-foreground">Cargando horarios…</p>
            ) : slotError ? (
              <p className="text-sm text-destructive">{slotError}</p>
            ) : slots && slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No atendemos ese día. Elegí un día hábil.
              </p>
            ) : slots && available.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No quedan horarios para ese día. Probá con otra fecha.
              </p>
            ) : slots ? (
              <div
                role="radiogroup"
                aria-labelledby="time-label"
                aria-describedby={e.time ? "time-error" : undefined}
                className="flex flex-wrap gap-2"
              >
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    role="radio"
                    aria-checked={time === s.time}
                    disabled={!s.available}
                    onClick={() => setTime(s.time)}
                    className={cn(
                      "rounded-full border px-5 py-2.5 font-mono text-sm transition-colors",
                      time === s.time
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground",
                      "disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:line-through disabled:hover:border-border",
                    )}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {e.time ? (
            <p id="time-error" role="alert" className="mt-2 text-sm text-destructive">
              {e.time}
            </p>
          ) : null}
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="eyebrow">Modalidad</legend>
          <div className="mt-4 flex flex-wrap gap-6">
            {(["presencial", "videollamada"] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-2 text-lg">
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  required
                  defaultChecked={(v.mode || "videollamada") === mode}
                  className="size-4 accent-brand"
                />
                {mode === "presencial" ? "Presencial" : "Videollamada"}
              </label>
            ))}
          </div>
          {e.mode ? <p className="mt-2 text-sm text-destructive">{e.mode}</p> : null}
        </fieldset>
      </fieldset>

      <fieldset className="grid gap-10 sm:col-span-2 sm:grid-cols-2">
        <legend className="mb-8 display text-3xl">2. Tus datos</legend>

        <Field id="name" label="Nombre y apellido" error={e.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            defaultValue={v.name}
            aria-invalid={e.name ? true : undefined}
            aria-describedby={describedBy("name", e.name)}
            className={inputClass}
          />
        </Field>
        <Field id="email" label="Email" error={e.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={160}
            defaultValue={v.email}
            aria-invalid={e.email ? true : undefined}
            aria-describedby={describedBy("email", e.email)}
            className={inputClass}
          />
        </Field>
        <Field id="phone" label="Teléfono" error={e.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={30}
            defaultValue={v.phone}
            aria-invalid={e.phone ? true : undefined}
            aria-describedby={describedBy("phone", e.phone)}
            className={inputClass}
          />
        </Field>
        <Field id="notes" label="Comentario breve (opcional)" error={e.notes}>
          <input
            id="notes"
            name="notes"
            maxLength={1000}
            defaultValue={v.notes}
            aria-invalid={e.notes ? true : undefined}
            aria-describedby={describedBy("notes", e.notes)}
            className={inputClass}
          />
        </Field>
      </fieldset>

      <div className="flex flex-col gap-6 sm:col-span-2">
        <ConsentCheckbox
          error={e.consent}
          text="Acepto que el estudio use estos datos para gestionar mi turno."
        />
        <TurnstileWidget />
        <Honeypot />
        <div>
          <SubmitButton pendingLabel="Reservando…">Solicitar turno</SubmitButton>
        </div>
      </div>
    </form>
  );
}
