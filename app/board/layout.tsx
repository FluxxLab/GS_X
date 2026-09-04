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
      // `--u` is the board's unit: everything on it is sized in multiples of
      // it. One viewport-width percent on a TV, where the board fills the
      // screen; larger on a phone, where 1vw is four pixels and the board
      // scrolls instead of fitting.
      className={`${archivo.variable} ${inter.variable} min-h-dvh w-screen overflow-y-auto bg-summit-violet font-[family-name:var(--font-summit)] text-summit-lilac [--u:2.6vw] md:h-dvh md:overflow-hidden md:[--u:1vw]`}
    >
      {children}
    </div>
  );
}
