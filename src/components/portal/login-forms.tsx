"use client";

import { useActionState, useState } from "react";
import { sendMagicLink, signInWithPassword, type AuthState } from "@/app/(portal)/portal/actions";
import { Field, inputClass } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";

const initial: AuthState = { status: "idle" };

export function LoginForms({ next }: { next?: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction] = useActionState(signInWithPassword, initial);
  const [mlState, mlAction] = useActionState(sendMagicLink, initial);
  const state = mode === "password" ? pwState : mlState;

  return (
    <div className="max-w-md">
      <div
        role="tablist"
        aria-label="Método de acceso"
        className="mb-10 flex gap-6 border-b border-border"
      >
        {(
          [
            ["password", "Contraseña"],
            ["magic", "Enlace por email"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
              mode === key
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`mb-8 border-l-2 pl-4 ${state.status === "error" ? "border-destructive text-destructive" : "border-brand"}`}
        >
          {state.message}
        </p>
      ) : null}

      <form action={mode === "password" ? pwAction : mlAction} className="flex flex-col gap-8">
        <input type="hidden" name="next" value={next ?? ""} />
        <Field id="email" label="Email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />
        </Field>
        {mode === "password" ? (
          <Field id="password" label="Contraseña">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              className={inputClass}
            />
          </Field>
        ) : null}
        <div>
          <SubmitButton pendingLabel="Ingresando…">
            {mode === "password" ? "Ingresar" : "Enviarme el enlace"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
