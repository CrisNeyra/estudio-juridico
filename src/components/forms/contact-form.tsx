"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContact, type FormState } from "@/app/(site)/contacto/actions";
import { ConsentCheckbox, Honeypot } from "@/components/forms/consent-checkbox";
import { describedBy, Field, inputClass } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { services } from "@/content/services";

const initial: FormState = { status: "idle" };

export function ContactForm({ defaultArea }: { defaultArea?: string }) {
  const [state, action] = useActionState(submitContact, initial);
  const statusRef = useRef<HTMLDivElement>(null);
  const e = state.fieldErrors ?? {};
  const v = state.values ?? {};

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="border-l-2 border-brand py-4 pl-6 outline-none"
      >
        <p className="display text-4xl">Mensaje enviado.</p>
        <p className="mt-4 text-lg text-muted-foreground">{state.message}</p>
      </div>
    );
  }

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

      <Field id="phone" label="Teléfono (opcional)" error={e.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          defaultValue={v.phone}
          aria-invalid={e.phone ? true : undefined}
          aria-describedby={describedBy("phone", e.phone)}
          className={inputClass}
        />
      </Field>

      <Field id="area" label="Área de consulta" error={e.area}>
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
          <option value="otra">Otra / No sé</option>
        </select>
      </Field>

      <Field
        id="message"
        label="Tu consulta"
        error={e.message}
        hint="No incluyas datos sensibles de terceros. Todo lo que nos cuentes está amparado por el secreto profesional."
        className="sm:col-span-2"
      >
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          minLength={20}
          maxLength={3000}
          defaultValue={v.message}
          aria-invalid={e.message ? true : undefined}
          aria-describedby={describedBy("message", e.message, "hint")}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="flex flex-col gap-6 sm:col-span-2">
        <ConsentCheckbox
          error={e.consent}
          text="Acepto que el estudio use estos datos solo para responder mi consulta."
        />
        <TurnstileWidget />
        <Honeypot />
        <div>
          <SubmitButton pendingLabel="Enviando…">Enviar consulta</SubmitButton>
        </div>
      </div>
    </form>
  );
}
