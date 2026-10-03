"use client";

import { reportClientError } from "@/lib/observability/client-report";
import { useEffect } from "react";

/**
 * Replaces the root layout when it fails. Must define its own html/body.
 */
export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const recover = retry ?? reset;

  useEffect(() => {
    reportClientError(error, {
      event: "global_error_boundary",
      portal: "root",
    });
  }, [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          background: "#F7F2E8",
          color: "#141A22",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "36rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#8B4513",
              margin: 0,
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              margin: "0.75rem 0 0",
              fontSize: "1.75rem",
              fontWeight: 600,
            }}
          >
            The site could not recover
          </h1>
          <p style={{ margin: "1rem 0 0", color: "#4B5563", lineHeight: 1.5 }}>
            Please refresh the page. If this keeps happening, contact the club
            and share the reference below.
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
            {recover ? (
              <button
                type="button"
                onClick={() => recover()}
                style={{
                  height: "2.75rem",
                  padding: "0 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  background: "#141A22",
                  color: "#fff",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            ) : null}
            {/* global-error replaces the root layout — Next.js Link is unavailable here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "2.75rem",
                padding: "0 1rem",
                borderRadius: "0.375rem",
                border: "1px solid #D1D5DB",
                color: "#141A22",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Go home
            </a>
          </div>
          {error.digest ? (
            <p
              style={{
                marginTop: "1.5rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "#9CA3AF",
              }}
            >
              Ref: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
