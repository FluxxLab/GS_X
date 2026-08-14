"use client";

/**
 * Last resort: catches errors thrown by the ROOT layout itself, which
 * (summit)/error.tsx cannot see. It replaces the root layout entirely, so it
 * must render its own <html> and <body> — and it cannot rely on the summit
 * theme tokens, hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#090415",
          color: "#F6F4FB",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>GS-26 Admin is down</h1>
          <p style={{ fontSize: 14, color: "#9C93AE", marginBottom: 20 }}>
            The dashboard failed to start. Try again; if it persists, the API may be unreachable.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#E5259A",
              color: "white",
              border: 0,
              borderRadius: 20,
              padding: "10px 20px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
