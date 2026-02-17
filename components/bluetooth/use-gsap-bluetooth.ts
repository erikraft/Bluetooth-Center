"use client";

import { useEffect, useRef } from "react";

export function useGsapBluetoothAnimations() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);

      if (!mounted || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.from(".gsap-hero", {
          opacity: 0,
          y: 26,
          duration: 0.95,
          ease: "power3.out",
        });

        gsap.utils.toArray<HTMLElement>(".gsap-reveal").forEach((item, index) => {
          gsap.from(item, {
            opacity: 0,
            y: 30,
            duration: 0.7,
            delay: index * 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 87%",
              toggleActions: "play none none reverse",
            },
          });
        });

        gsap.from(".gsap-terminal", {
          opacity: 0,
          x: 24,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-terminal",
            start: "top 88%",
          },
        });
      }, rootRef);

      cleanup = () => ctx.revert();
    };

    void run();

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  return rootRef;
}
