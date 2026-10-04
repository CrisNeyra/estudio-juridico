"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  addCaseEvent,
  createCase,
  inviteUser,
  uploadDocument,
  type AdminState,
} from "@/app/(portal)/admin/actions";
import { Field, inputClass } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { services } from "@/content/services";
import { ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_BYTES } from "@/lib/portal";

const initial: AdminState = { status: "idle" };

function Status({ state }: { state: AdminState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={`border-l-2 pl-4 ${state.status === "error" ? "border-destructive text-destructive" : "border-brand"}`}
    >
      {state.message}
    </p>
  );
}

function useResetOnSuccess(state: AdminState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") ref.current?.reset();
  }, [state]);
  return ref;
}

export function CreateCaseForm() {
  const [state, action] = useActionState(createCase, initial);
  return (
    <form action={action} className="grid gap-8 md:grid-cols-2">
      <div className="md:col-span-2">
        <Status state={state} />
      </div>
      <Field id="clientEmail" label="Email del cliente">
        <input id="clientEmail" name="clientEmail" type="email" required className={inputClass} />
      </Field>
      <Field id="area" label="Área">
        <select id="area" name="area" required defaultValue="" className={inputClass}>
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
      <Field id="title" label="Título del caso">
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={160}
          className={inputClass}
        />
      </Field>
      <Field id="reference" label="Referencia interna (opcional)">
        <input id="reference" name="reference" maxLength={80} className={inputClass} />
      </Field>
      <div>
        <SubmitButton pendingLabel="Creando…">Crear caso</SubmitButton>
      </div>
    </form>
  );
}

export function InviteUserForm() {
  const [state, action] = useActionState(inviteUser, initial);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="grid max-w-2xl gap-8 md:grid-cols-2">
      <div className="md:col-span-2">
        <Status state={state} />
      </div>
      <Field id="fullName" label="Nombre y apellido">
        <input id="fullName" name="fullName" required minLength={2} className={inputClass} />
      </Field>
      <Field id="invite-email" label="Email">
        <input id="invite-email" name="email" type="email" required className={inputClass} />
      </Field>
      <Field id="invite-password" label="Contraseña temporal">
        <input
          id="invite-password"
          name="password"
          type="password"
          required
          minLength={8}
          className={inputClass}
        />
      </Field>
      <Field id="role" label="Rol">
        <select id="role" name="role" defaultValue="cliente" className={inputClass}>
          <option value="cliente">Cliente</option>
          <option value="abogado">Abogado</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      <div>
        <SubmitButton pendingLabel="Invitando…">Invitar</SubmitButton>
      </div>
    </form>
  );
}

export function AddEventForm({ caseId }: { caseId: string }) {
  const [state, action] = useActionState(addCaseEvent, initial);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-8">
      <Status state={state} />
      <input type="hidden" name="caseId" value={caseId} />
      <Field id="event-title" label="Título">
        <input
          id="event-title"
          name="title"
          required
          minLength={3}
          maxLength={160}
          className={inputClass}
        />
      </Field>
      <Field id="event-description" label="Detalle (visible para el cliente)">
        <textarea
          id="event-description"
          name="description"
          rows={4}
          maxLength={4000}
          className={`${inputClass} resize-y`}
        />
      </Field>
      <div>
        <SubmitButton pendingLabel="Publicando…">Publicar novedad</SubmitButton>
      </div>
    </form>
  );
}

export function UploadDocumentForm({ caseId }: { caseId: string }) {
  const [state, setState] = useState<AdminState>(initial);
  const [pending, start] = useTransition();
  const ref = useResetOnSuccess(state);
  const router = useRouter();

  return (
    <form
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("caseId", caseId);
        const file = fd.get("file");
        if (!(file instanceof File) || file.size === 0) {
          setState({ status: "error", message: "Elegí un archivo." });
          return;
        }
        if (file.size > MAX_DOCUMENT_BYTES) {
          setState({ status: "error", message: "El archivo supera los 20 MB." });
          return;
        }
        start(async () => {
          const result = await uploadDocument(fd);
          setState(result);
          if (result.status === "success") router.refresh();
        });
      }}
      className="flex flex-col gap-8"
    >
      <Status state={state} />
      <Field id="file" label="Archivo" hint="PDF, imágenes o Word. Máximo 20 MB.">
        <input
          id="file"
          name="file"
          type="file"
          required
          accept={ALLOWED_DOCUMENT_TYPES.join(",")}
          className="mt-3 text-sm"
        />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-foreground px-8 py-4 text-background disabled:opacity-60"
      >
        {pending ? "Subiendo…" : "Compartir documento"}
      </button>
    </form>
  );
}
