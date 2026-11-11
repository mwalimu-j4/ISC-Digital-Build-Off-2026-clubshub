"use client";

import { usePathname } from "next/navigation";

import { BackButton } from "@/components/shared/back-button";

const EXCLUDED_PREFIXES = [
  "/super-admin",
  "/club-admin",
  "/student",
  "/sign-in",
  "/auth",
  "/clubs/propose",
];

export function RouteBack() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  for (const prefix of EXCLUDED_PREFIXES) {
    if (pathname.startsWith(prefix)) return null;
  }

  return <BackButton fallbackHref="/" />;
}

