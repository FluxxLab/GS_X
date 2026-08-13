import type { Metadata, Viewport } from "next";
import { DM_Sans, Schoolbell, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/lib/providers/QueryProvider";


const geist = Geist({subsets:['latin'],variable:'--font-sans'});

/**
 * The ERP's UI face is DM Sans (benchmarked against standard line-of-business
 * systems — e.g. the FCT-IRS portal). It is DELIBERATELY assigned to the
 * legacy `--font-inter` variable: hundreds of components resolve their
 * font-family through that var, so retargeting it here reskins the whole
 * dashboard in one line. The public site keeps loading Inter itself inside
 * the (public) layout (Figma spec), scoped over this root value.
 * Schoolbell is the site's handwritten accent, used for section eyebrows.
 */
const inter = DM_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
});

const schoolbell = Schoolbell({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-schoolbell",
});

export const metadata: Metadata = {
  title: "GS-26 Admin Console",
  description: "Organiser dashboard for the GS-26 Gender & Inclusion Summit 2026",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "GS-26 Admin" },
  icons: { icon: "/icon-192.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#081340",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("antialiased", inter.variable, schoolbell.variable, "font-sans", geist.variable)}>
      <body className="flex flex-col">
        <QueryProvider>{children}</QueryProvider>
       
      </body>
    </html>
  );
}
