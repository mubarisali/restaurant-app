"use client";
import { useEffect } from "react";

/**
 * Makes in-page links (href="#section") scroll smoothly without adding "#section" to the URL.
 * Also clears any hash already in the URL on first load.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const scrollToId = (id: string) => {
      const el = id && id !== "hero" ? document.getElementById(id) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearHash = () => {
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };

    // Arrived with a hash (e.g. an old /#feedback link): go there, then tidy the URL
    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      clearHash();
      setTimeout(() => scrollToId(id), 100);
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement).closest("a");
      const href = link?.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      scrollToId(href.slice(1));
      clearHash();
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
