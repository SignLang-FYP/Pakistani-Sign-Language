"use client";

import { useAppTheme } from "@/components/theme/useAppTheme";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useAppTheme();

  // The theme only supplies the accent; the page surface stays white.
  return (
    <div
      className="min-h-screen"
      style={{ "--accent": theme.accent } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
