"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      aria-label="Cambiar entre modo claro y oscuro"
    >
      <Sun className="size-[18px] dark:hidden" strokeWidth={1.5} aria-hidden="true" />
      <Moon className="hidden size-[18px] dark:block" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
