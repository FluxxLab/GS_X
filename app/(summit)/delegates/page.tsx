export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
        Live Ops
      </h1>
      <div className="glass-card p-8 text-sm text-summit-smoke">
        Coming soon — backend endpoints for this surface aren&apos;t deployed yet.
        Use Swagger + psql in the meantime.
      </div>
    </div>
  );
}
