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

const SITE_NAME = "GS-26 Admin Console";
const SITE_DESCRIPTION =
  "Organiser dashboard for the GS-26 Gender & Inclusion Summit 2026";

export const metadata: Metadata = {
  /**
   * Absolute URLs for the share card. Open Graph consumers - WhatsApp, Slack,
   * Twitter - do not resolve relative image paths, so without a base the card
   * silently falls back to the favicon.
   */
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gs-x.pic-policycentre.workers.dev",
  ),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "GS-26 Admin" },
  icons: { icon: "/icon-192.png", apple: "/apple-icon.png" },
  /**
   * Declared explicitly rather than left to Next's defaults. With no openGraph
   * block a link unfurl has no image to use and falls back to whatever icon it
   * can find - which is how the seed repo's branding ended up on the WhatsApp
   * preview. `app/opengraph-image.png` is picked up by file convention and
   * emitted as an absolute URL against metadataBase.
   */
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  // An organiser console has nothing to gain from being indexed, and the
  // login page leaking into search results is a small attack-surface gift.
  robots: { index: false, follow: false },
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
    <html
      lang="en"
      // The console is dark-only. Without this the shadcn tokens resolve to
      // their light defaults, which is why Select popovers rendered white:
      // they portal to document.body, so a class on an inner layout cannot
      // reach them.
      className={cn("dark antialiased", inter.variable, schoolbell.variable, "font-sans", geist.variable)}
    >
      <body className="flex flex-col">
        <QueryProvider>{children}</QueryProvider>
       
      </body>
    </html>
  );
}
