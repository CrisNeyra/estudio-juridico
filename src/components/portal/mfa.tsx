"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Field, inputClass } from "@/components/forms/field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Factor = { id: string; friendly_name?: string; status: string };

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      id="code"
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

/** Second-factor challenge for users who already enrolled TOTP. */
export function MfaChallenge({ next }: { next: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const verify = () =>
    start(async () => {
      setError(undefined);
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp.find((f) => f.status === "verified");
      if (!factor) return setError("No encontramos un segundo factor configurado.");
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
      if (error) return setError("Código incorrecto o vencido.");
      router.replace(next);
      router.refresh();
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        verify();
      }}
      className="flex max-w-sm flex-col gap-8"
    >
      <Field id="code" label="Código de 6 dígitos" error={error}>
        <CodeInput value={code} onChange={setCode} />
      </Field>
      <button
        type="submit"
        disabled={pending || code.length !== 6}
        className="self-start rounded-full bg-foreground px-8 py-4 text-background disabled:opacity-50"
      >
        {pending ? "Verificando…" : "Verificar"}
      </button>
    </form>
  );
}

/** Enroll / remove TOTP factors (Google Authenticator, 1Password, Authy, etc.). */
export function MfaManager() {
  const router = useRouter();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(
    null,
  );
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string }>();
  const [pending, start] = useTransition();

  const load = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = (await supabase?.auth.mfa.listFactors()) ?? {};
    setFactors((data?.totp ?? []) as Factor[]);
  };

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();
    supabase?.auth.mfa.listFactors().then(({ data }) => {
      if (active) setFactors((data?.totp ?? []) as Factor[]);
    });
    return () => {
      active = false;
    };
  }, []);

  const verified = factors.filter((f) => f.status === "verified");

  const enroll = () =>
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      for (const f of factors.filter((f) => f.status !== "verified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `TOTP ${Date.now()}`,
      });
      if (error || !data)
        return setMessage({ type: "error", text: "No pudimos iniciar la configuración." });
      setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    });

  const confirm = () =>
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase || !enrolling) return;
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrolling.id,
        code,
      });
      if (error) return setMessage({ type: "error", text: "Código incorrecto. Probá de nuevo." });
      setEnrolling(null);
      setCode("");
      setMessage({ type: "ok", text: "Verificación en dos pasos activada." });
      await load();
      router.refresh();
    });

  const remove = (id: string) =>
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      setMessage(
        error
          ? { type: "error", text: "Para desactivarla, primero verificá tu código actual." }
          : { type: "ok", text: "Verificación en dos pasos desactivada." },
      );
      await load();
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

      {verified.length > 0 ? (
        <div className="flex items-center justify-between gap-6">
          <p>
            Estado: <strong>activada</strong>
          </p>
          <button
            type="button"
            onClick={() => remove(verified[0]!.id)}
            disabled={pending}
            className="text-sm link-underline"
          >
            Desactivar
          </button>
        </div>
      ) : enrolling ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirm();
          }}
          className="space-y-8"
        >
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>Abrí tu app de autenticación (Google Authenticator, 1Password, Authy…).</li>
            <li>Escaneá el código QR o ingresá la clave manualmente.</li>
            <li>Escribí el código de 6 dígitos que te muestra la app.</li>
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL SVG generated by Supabase */}
          <img
            src={enrolling.qr}
            alt="Código QR para configurar la verificación en dos pasos"
            className="size-48 rounded bg-white p-2"
          />
          <p className="text-sm text-muted-foreground">
            Clave manual: <code className="break-all text-foreground">{enrolling.secret}</code>
          </p>
          <Field id="code" label="Código de 6 dígitos">
            <CodeInput value={code} onChange={setCode} />
          </Field>
          <button
            type="submit"
            disabled={pending || code.length !== 6}
            className="rounded-full bg-foreground px-8 py-4 text-background disabled:opacity-50"
          >
            Activar
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Estado: <strong className="text-foreground">desactivada</strong>. Agregá una capa extra
            de seguridad con un código temporal desde tu celular.
          </p>
          <button
            type="button"
            onClick={enroll}
            disabled={pending}
            className="rounded-full bg-foreground px-8 py-4 text-background disabled:opacity-50"
          >
            Configurar verificación en dos pasos
          </button>
        </div>
      )}
    </div>
  );
}

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string }>();
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      if (password.length < 12)
        return setMessage({ type: "error", text: "Usá al menos 12 caracteres." });
      if (password !== confirm)
        return setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      const supabase = createSupabaseBrowserClient();
      const { error } = (await supabase?.auth.updateUser({ password })) ?? {};
      if (error) return setMessage({ type: "error", text: "No pudimos actualizar la contraseña." });
      setPassword("");
      setConfirm("");
      setMessage({ type: "ok", text: "Contraseña actualizada." });
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex max-w-lg flex-col gap-8"
    >
      {message ? (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`border-l-2 pl-4 ${message.type === "error" ? "border-destructive text-destructive" : "border-brand"}`}
        >
          {message.text}
        </p>
      ) : null}
      <Field
        id="new-password"
        label="Nueva contraseña"
        hint="Mínimo 12 caracteres. Recomendamos una frase."
      >
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field id="confirm-password" label="Repetir contraseña">
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-foreground px-8 py-4 disabled:opacity-50"
      >
        Guardar contraseña
      </button>
    </form>
  );
}
