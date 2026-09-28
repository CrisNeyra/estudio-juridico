"use client";

import { SmoothScroll } from "@/components/motion/smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}
