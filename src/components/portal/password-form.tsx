"use client";

import { useActionState } from "react";
import { changePassword, type PasswordState } from "@/app/(portal)/portal/password-actions";
import { Field, inputClass } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";

const initial: PasswordState = { status: "idle" };

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, initial);
  return (
    <form action={action} className="flex max-w-md flex-col gap-8">
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`border-l-2 pl-4 ${state.status === "error" ? "border-destructive text-destructive" : "border-brand"}`}
        >
          {state.message}
        </p>
      ) : null}
      <Field id="current" label="Contraseña actual">
        <input
          id="current"
          name="current"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      <Field id="next" label="Nueva contraseña">
        <input
          id="next"
          name="next"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <div>
        <SubmitButton pendingLabel="Guardando…">Cambiar contraseña</SubmitButton>
      </div>
    </form>
  );
}
