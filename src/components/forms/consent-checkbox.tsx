import Link from "next/link";

export function ConsentCheckbox({ error, text }: { error?: string; text: string }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consent-error" : undefined}
          className="mt-0.5 size-4 shrink-0 accent-brand"
        />
        <span className="text-muted-foreground">
          {text} Leí la{" "}
          <Link href="/privacidad" className="text-foreground link-underline">
            política de privacidad
          </Link>
          .
        </span>
      </label>
      {error ? (
        <p id="consent-error" className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Hidden from humans and assistive tech; bots tend to fill every input. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        No completar
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
