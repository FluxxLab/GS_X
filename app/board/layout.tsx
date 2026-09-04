import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";

/**
 * The venue departures board lives outside the (summit) group on purpose: it
 * runs on a TV in the wings with nobody to log in, so it must not inherit the
 * console's session check. It loads the same two faces the console uses so it
 * reads as the summit's own screen rather than a third-party widget.
 */
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const inter = Inter({ subsets: ["latin"], variable: "--font-summit" });

export const metadata: Metadata = {
  title: "GS-26 Venue Board",
  description: "What is live now and next in every room at the Gender & Inclusion Summit 2026.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#090415",
  // a TV never pinches; locking scale keeps a stray remote gesture from
  // zooming the board mid-session
  maximumScale: 1,
  userScalable: false,
};

export default function BoardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${archivo.variable} ${inter.variable} h-dvh w-screen overflow-hidden bg-summit-violet font-[family-name:var(--font-summit)] text-summit-lilac`}
    >
      {children}
    </div>
  );
}
