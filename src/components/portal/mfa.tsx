"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import {
  confirmTotp,
  enrollTotp,
  removeTotp,
  verifyMfaChallenge,
  type MfaState,
} from "@/app/(portal)/portal/mfa-actions";
import { Field, inputClass } from "@/components/forms/field";

function CodeInput({
  value,
  onChange,
  name = "code",
}: {
  value: string;
  onChange: (v: string) => void;
  name?: string;
}) {
  return (
    <input
      id="code"
      name={name}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={6}
      required
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      className={`${inputClass} font-mono tracking-[0.5em]`}
    />
  );
}

const initial: MfaState = { status: "idle" };

/** Second-factor challenge for users who already enrolled TOTP. */
export function MfaChallenge({ next }: { next: string }) {
  const [code, setCode] = useState("");
  const [state, action] = useActionState(verifyMfaChallenge, initial);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-8">
      <input type="hidden" name="next" value={next} />
      <Field
        id="code"
        label="Código de 6 dígitos"
        error={state.status === "error" ? state.message : undefined}
      >
        <CodeInput value={code} onChange={setCode} />
      </Field>
      <button
        type="submit"
        disabled={code.length !== 6}
        className="self-start rounded-full bg-foreground px-8 py-4 text-background disabled:opacity-50"
      >
        Verificar
      </button>
    </form>
  );
}

/** Enroll / remove TOTP factors (Google Authenticator, 1Password, Authy, etc.). */
export function MfaManager({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState<{ qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string }>();
  const [pending, start] = useTransition();
  const [confirmState, confirmAction] = useActionState(confirmTotp, initial);

  const isEnabled = enabled || confirmState.status === "ok";
  const showEnrolling = Boolean(enrolling) && confirmState.status !== "ok";

  const enroll = () =>
    start(async () => {
      const result = await enrollTotp();
      if (result.status === "error" || !result.qr || !result.secret) {
        return setMessage({ type: "error", text: result.message ?? "No pudimos iniciar." });
      }
      setEnrolling({ qr: result.qr, secret: result.secret });
      setMessage(undefined);
    });

  const remove = () =>
    start(async () => {
      const result = await removeTotp();
      setMessage({
        type: result.status === "error" ? "error" : "ok",
        text: result.message ?? "",
      });
      setEnrolling(null);
      setCode("");
      router.refresh();
    });

  return (
    <div className="max-w-lg space-y-8">
      {message ? (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`border-l-2 pl-4 ${message.type === "error" ? "border-destructive text-destructive" : "border-brand"}`}
        >
          {message.text}
        </p>
      ) : null}
      {confirmState.message ? (
        <p
          role={confirmState.status === "error" ? "alert" : "status"}
          className={`border-l-2 pl-4 ${confirmState.status === "error" ? "border-destructive text-destructive" : "border-brand"}`}
        >
          {confirmState.message}
        </p>
      ) : null}

      {isEnabled && !showEnrolling ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            La verificación en dos pasos está activa. El equipo del estudio debe usarla para acceder
            a datos de clientes.
          </p>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-sm text-destructive underline-offset-4 hover:underline"
          >
            Desactivar
          </button>
        </div>
      ) : null}

      {!isEnabled && !showEnrolling ? (
        <button
          type="button"
          onClick={enroll}
          disabled={pending}
          className="rounded-full bg-foreground px-8 py-4 text-background disabled:opacity-50"
        >
          {pending ? "Preparando…" : "Activar verificación en dos pasos"}
        </button>
      ) : null}

      {showEnrolling && enrolling ? (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Escaneá el código con Google Authenticator, 1Password o Authy e ingresá el código de 6
            dígitos.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrolling.qr} alt="Código QR para autenticador" className="size-48" />
          <p className="font-mono text-sm break-all text-muted-foreground">{enrolling.secret}</p>
          <form action={confirmAction} className="flex flex-col gap-6">
            <Field id="code" label="Código de 6 dígitos">
              <CodeInput value={code} onChange={setCode} />
            </Field>
            <button
              type="submit"
              disabled={code.length !== 6}
              className="self-start rounded-full bg-foreground px-8 py-4 text-background disabled:opacity-50"
            >
              Confirmar
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
