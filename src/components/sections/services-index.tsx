import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ServiceIcon } from "@/components/service-icon";
import { services } from "@/content/services";

/**
 * Editorial numbered index. Hover/focus reveals the description on desktop; on touch
 * devices the description is always visible because there is no hover.
 */
export function ServicesIndex({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ol className="border-t border-border">
      {services.map((service, i) => (
        <li key={service.slug} className="border-b border-border">
          <Link
            href={`/servicios/${service.slug}`}
            className="group grid grid-cols-[3rem_1fr_auto] items-start gap-x-4 py-7 md:grid-cols-[5rem_1fr_1fr_3rem] md:items-center md:gap-x-8 md:py-9"
          >
            <span className="pt-2 font-mono text-xs text-muted-foreground md:pt-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Heading className="display text-3xl transition-[color,transform] duration-500 group-hover:translate-x-2 group-hover:text-brand group-focus-visible:text-brand sm:text-4xl md:text-6xl">
              {service.title}
            </Heading>
            <ArrowUpRight
              className="mt-2 size-6 text-muted-foreground transition-transform duration-500 group-hover:rotate-45 group-hover:text-brand md:order-last md:mt-0 md:size-8"
              strokeWidth={1}
              aria-hidden="true"
            />
            <p className="col-start-2 mt-3 flex items-center gap-3 text-sm text-muted-foreground md:col-start-3 md:row-start-1 md:mt-0 md:translate-y-2 md:text-base md:opacity-0 md:transition-[opacity,transform] md:duration-500 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
              <ServiceIcon name={service.icon} className="hidden size-6 shrink-0 md:block" />
              {service.short}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
