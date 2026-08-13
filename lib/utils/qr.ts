// `qrcode` is a browser-capable lib we only need inside client components, so we
// lazy-import it at call time (same approach as the export helpers) to keep it
// out of the SSR/server bundle.

/** Render `text` as a PNG data-URL QR code (square, `size` px). */
export async function makeQrDataUrl(text: string, size = 240): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#081340", light: "#FFFFFF" },
  });
}
