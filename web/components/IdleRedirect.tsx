"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const IDLE_MS = 2 * 60 * 1000; // reset kiosk após 2 min parado

export function IdleRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (pathname.startsWith("/admin")) return;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (pathname !== "/") router.push("/");
      }, IDLE_MS);
    };
    const events = ["touchstart", "mousemove", "keydown", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [pathname, router]);

  return null;
}
