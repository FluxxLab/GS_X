import Link from "next/link";

export default function SummitNotFound() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Page not found
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          That admin page doesn&apos;t exist. It may have been renamed.
        </p>
      </header>
      <div className="glass-card p-6">
        <Link
          href="/overview"
          className="inline-block rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          Back to Overview
        </Link>
      </div>
    </div>
  );
}
