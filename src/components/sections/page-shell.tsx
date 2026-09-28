import type { CSSProperties } from "react";

/** Fondo opcional: public/images/fondos/{photo}.webp. Si no está el archivo, se ve el blanco. */
export function PageShell({ photo, children }: { photo: string; children: React.ReactNode }) {
  return (
    <div
      className="section-photo"
      style={{ "--section-photo": `url("/images/fondos/${photo}.webp")` } as CSSProperties}
    >
      {children}
    </div>
  );
}
