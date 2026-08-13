import { Archivo, Inter } from "next/font/google";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const summitInter = Inter({ subsets: ["latin"], variable: "--font-summit" });

export default function SummitAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${archivo.variable} ${summitInter.variable} relative flex min-h-screen w-full items-center justify-center bg-summit-violet p-4 font-[family-name:var(--font-summit)] text-summit-lilac`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('/bg-luxe.jpg')] bg-cover bg-center opacity-15" />
      <div className="pointer-events-none absolute inset-0 bg-summit-violet/70" />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
