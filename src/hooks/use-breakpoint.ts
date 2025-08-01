"use client";

import { useEffect, useState } from "react";

const screens = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

/**
 * Checks whether a particular Tailwind CSS viewport size applies.
 *
 * @param size The size to check, which must either be included in Tailwind CSS's
 * list of default screen sizes, or added to the Tailwind CSS config file.
 *
 * @returns A boolean indicating whether the viewport size applies.
 */
export const useBreakpoint = (size: "sm" | "md" | "lg" | "xl" | "2xl") => {
  // Start with false to match server-side rendering
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const breakpoint = window.matchMedia(`(min-width: ${screens[size]})`);

    // Set the actual value after mounting
    setMatches(breakpoint.matches);

    const handleChange = (value: MediaQueryListEvent) => setMatches(value.matches);

    breakpoint.addEventListener("change", handleChange);
    return () => breakpoint.removeEventListener("change", handleChange);
  }, [size]);

  // Return false during SSR to avoid hydration mismatch
  return mounted ? matches : false;
};
