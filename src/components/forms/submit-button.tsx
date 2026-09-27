"use client";

import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex items-center gap-4 rounded-full bg-foreground px-8 py-4 text-base text-background transition-colors duration-300 hover:bg-brand hover:text-brand-foreground disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
      {pending ? (
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      ) : (
        <ArrowUpRight
          className="size-5 transition-transform group-hover:rotate-45"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
