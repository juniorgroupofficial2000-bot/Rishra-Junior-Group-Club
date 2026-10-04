/**
 * Shown when the deployment is missing required Vercel environment variables.
 * Server Component — English-only operator guidance.
 */
export function EnvSetupPanel({ message }: { message: string }) {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#F7F2E8",
        color: "#141A22",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: "40rem", width: "100%" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#8B4513",
          }}
        >
          Deployment setup required
        </p>
        <h1
          style={{
            margin: "0.75rem 0 0",
            fontSize: "1.75rem",
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          Environment variables are missing
        </h1>
        <p style={{ margin: "1rem 0 0", color: "#4B5563", lineHeight: 1.55 }}>
          The site deployed on Vercel, but required configuration is not set.
          Add these in Vercel → Project → Settings → Environment Variables
          (Production and Preview), then redeploy.
        </p>
        <pre
          style={{
            margin: "1.25rem 0 0",
            padding: "1rem",
            overflow: "auto",
            borderRadius: "0.5rem",
            background: "#141A22",
            color: "#F7F2E8",
            fontSize: "0.8rem",
            lineHeight: 1.55,
          }}
        >{`APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
APP_URL=https://rishra-junior-group-club.vercel.app
NEXT_PUBLIC_APP_URL=https://rishra-junior-group-club.vercel.app
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB
AUTH_SECRET=<at-least-32-random-characters>
CRON_SECRET=<at-least-32-random-characters>
PAYMENT_PROVIDER=mock
PAYMENT_MODE=test
MEDIA_STORAGE_DRIVER=local
REPOSITORY_DRIVER=prisma`}</pre>
        <p
          style={{
            margin: "1.25rem 0 0",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.75rem",
            color: "#6B7280",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message}
        </p>
      </div>
    </main>
  );
}
