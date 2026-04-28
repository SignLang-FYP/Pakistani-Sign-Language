"use client";

import { useAppTheme } from "@/components/theme/useAppTheme";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useAppTheme();

  return (
    <div
      style={
        {
          minHeight: "100vh",
          "--theme-from": theme.from,
          "--theme-via": theme.via,
          "--theme-to": theme.to,
          "--theme-main": theme.from,
          background: `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}