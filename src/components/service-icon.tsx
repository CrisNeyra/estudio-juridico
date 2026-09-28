import { Briefcase, Gavel, Scroll, ShieldCheck, Users, type LucideProps } from "lucide-react";
import type { ServiceIcon as IconKey } from "@/content/services";

const icons = {
  scroll: Scroll,
  users: Users,
  briefcase: Briefcase,
  gavel: Gavel,
  shield: ShieldCheck,
} satisfies Record<IconKey, React.ComponentType<LucideProps>>;

export function ServiceIcon({ name, ...props }: { name: IconKey } & LucideProps) {
  const Icon = icons[name];
  return <Icon strokeWidth={1.25} aria-hidden="true" {...props} />;
}
