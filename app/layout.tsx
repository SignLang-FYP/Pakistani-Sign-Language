import "./globals.css";
import type { Metadata } from "next";
import ThemeWrapper from "@/components/theme/ThemeWrapper";

export const metadata: Metadata = {
  title: "SignLang",
  description: "Empowering Communication Beyond Words",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}