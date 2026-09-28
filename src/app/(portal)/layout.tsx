import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { getAuthContext, isStaff } from "@/lib/auth";
import { signOut } from "@/app/(portal)/portal/actions";

export const metadata: Metadata = {
  title: "Portal de clientes",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();
  const signedIn = ctx.configured && ctx.user;
  const staff = signedIn && isStaff(ctx.profile?.role);

  return (
    <>
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-serif text-2xl leading-none">
              {site.name}
            </Link>
            <span className="eyebrow">Portal</span>
          </div>
          <nav aria-label="Portal" className="flex items-center gap-1 text-sm">
            {signedIn ? (
              <>
                <Link
                  href="/portal"
                  className="px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  Mis casos
                </Link>
                <Link
                  href="/portal/seguridad"
                  className="px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  Seguridad
                </Link>
                {staff ? (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    Administración
                  </Link>
                ) : null}
                <form action={signOut}>
                  <button
                    type="submit"
                    className="px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    Salir
                  </button>
                </form>
              </>
            ) : null}
          </nav>
        </div>
      </header>
      <main id="contenido" className="container-page flex-1 py-12 md:py-20">
        {children}
      </main>
    </>
  );
}
