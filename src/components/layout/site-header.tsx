"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { navigation, site } from "@/content/site";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          className="group flex items-baseline gap-2"
          aria-label={`${site.name}, inicio`}
        >
          <span className="font-serif text-2xl leading-none tracking-tight">{site.name}</span>
          <span className="hidden eyebrow sm:inline">{site.tagline}</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative text-sm transition-colors",
                    "after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-500 hover:after:scale-x-100",
                    isActive(item.href)
                      ? "text-foreground after:scale-x-100"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/portal"
            className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline"
          >
            Clientes
          </Link>
          <Link
            href="/turnos"
            className="ml-2 hidden rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-colors duration-300 hover:bg-brand hover:text-brand-foreground sm:inline-flex"
          >
            Pedir turno
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex size-11 items-center justify-center lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-none p-8 sm:max-w-md">
              <SheetTitle className="eyebrow">Menú</SheetTitle>
              <SheetDescription className="sr-only">
                Navegación principal del sitio
              </SheetDescription>
              <nav aria-label="Móvil" className="mt-10">
                <ul className="flex flex-col gap-4">
                  {[
                    ...navigation,
                    { href: "/turnos", label: "Pedir turno" },
                    { href: "/portal", label: "Portal de clientes" },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className="display text-4xl transition-colors hover:text-brand"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
