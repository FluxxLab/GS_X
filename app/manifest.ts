import type { MetadataRoute } from "next";

// Required by `output: "export"`: the manifest is generated once at build time.
export const dynamic = "force-static";

/**
 * Web app manifest: makes the console installable (home-screen / desktop app)
 * and gives it a branded splash. Served by Next at /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GS-26 Admin Console",
    short_name: "GS-26 Admin",
    description: "Organiser dashboard for the GS-26 Gender & Inclusion Summit 2026.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#090415",
    theme_color: "#090415",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
