"use client";

import { useEffect, useRef } from "react";

/** Fondo de video del hero: respeta prefers-reduced-motion (frame estático). */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      if (mq.matches) {
        video.pause();
        video.currentTime = 0;
        return;
      }
      void video.play().catch(() => {
        /* autoplay bloqueado por el navegador */
      });
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <video
      ref={ref}
      className="hero-video absolute inset-0 size-full object-cover object-[62%_top] brightness-110 contrast-105"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  );
}
