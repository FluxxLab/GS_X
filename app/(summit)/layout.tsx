import { Archivo, Inter } from "next/font/google";
import { SummitSidebar } from "./_components/SummitSidebar";
import RealtimeRefresher from "./_components/RealtimeRefresher";
import { CommandPalette } from "./_components/CommandPalette";
import AuthGuard from "./_components/AuthGuard";

const archivo = Archivo({subsets:["latin"], variable: "--font-archivo"});
const summitInter = Inter({subsets: ["latin"], variable: "--font-submit"});

export default function SummitLayout({children}: {children: React.ReactNode}){
   return (
    <div
      className={`${archivo.variable} ${summitInter.variable} relative min-h-screen w-full bg-summit-violet font-[family-name:var(--font-summit)] text-summit-lilac`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('/bg-luxe.jpg')] bg-cover bg-center opacity-15" />
      <div className="pointer-events-none absolute inset-0 bg-summit-violet/70" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1280px]">
        <SummitSidebar />
        <main className="min-w-0 flex-1 px-5 pt-8 pb-10">
          <AuthGuard>
            <RealtimeRefresher />
            <CommandPalette />
            {children}
          </AuthGuard>
        </main>
      </div>
    </div>
  );
};