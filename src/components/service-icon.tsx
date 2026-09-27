import {
  Briefcase,
  Building,
  Gavel,
  House,
  Landmark,
  Receipt,
  Scroll,
  ShieldCheck,
  ShoppingBag,
  Users,
  type LucideProps,
} from "lucide-react";
import type { ServiceIcon as IconKey } from "@/content/services";

const icons = {
  scroll: Scroll,
  users: Users,
  briefcase: Briefcase,
  gavel: Gavel,
  building: Building,
  house: House,
  landmark: Landmark,
  shield: ShieldCheck,
  shopping: ShoppingBag,
  receipt: Receipt,
} satisfies Record<IconKey, React.ComponentType<LucideProps>>;

export function ServiceIcon({ name, ...props }: { name: IconKey } & LucideProps) {
  const Icon = icons[name];
  return <Icon strokeWidth={1.25} aria-hidden="true" {...props} />;
}
