import "./globals.css";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import ThemeWrapper from "@/components/theme/ThemeWrapper";
import ModalProvider from "@/components/common/ModalProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      {/*
        suppressHydrationWarning: browser extensions (Grammarly, form fillers)
        inject attributes such as data-gr-ext-installed / fdprocessedid into the
        DOM before React hydrates, which otherwise reports a false mismatch.
      */}
      <body suppressHydrationWarning>
        <ModalProvider>
          <ThemeWrapper>{children}</ThemeWrapper>
        </ModalProvider>
      </body>
    </html>
  );
}
