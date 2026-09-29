"use client";

import Script from "next/script";
import { useEffect, useId, useState } from "react";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: string | HTMLElement,
        opts: {
          sitekey: string;
          language?: string;
          theme?: string;
          callback?: (token: string) => void;
          "error-callback"?: (code: string) => void;
        },
      ) => string;
      remove: (id: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

/** Renders Cloudflare Turnstile only when a site key is configured. */
export function TurnstileWidget() {
  const reactId = useId();
  const containerId = `cf-turnstile-${reactId.replace(/:/g, "")}`;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;

    let widgetId: string | undefined;

    const mount = () => {
      const el = document.getElementById(containerId);
      if (!el || !window.turnstile) return;
      el.innerHTML = "";
      try {
        widgetId = window.turnstile.render(el, {
          sitekey: siteKey,
          language: "es",
          theme: "auto",
          "error-callback": (code) => {
            setError(
              code === "110200"
                ? "Dominio no autorizado en Turnstile. Agregá estudiosardoflorencia.vercel.app en Hostnames."
                : code === "110100" || code === "110110"
                  ? "Site Key inválida. Revisá que Site Key y Secret Key sean del mismo widget."
                  : `Turnstile no cargó (código ${code}). Probá en ventana privada o revisá la config en Cloudflare.`,
            );
          },
        });
      } catch {
        setError("No se pudo inicializar Turnstile. Recargá la página.");
      }
    };

    window.onTurnstileLoad = mount;
    if (window.turnstile) mount();

    return () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          /* ignore */
        }
      }
    };
  }, [containerId]);

  if (!siteKey) return null;

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad"
        strategy="afterInteractive"
      />
      <div id={containerId} className="cf-turnstile min-h-16" />
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
