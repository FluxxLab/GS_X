"use client";
import { useState, } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { login } from "@/lib/summit/auth";
import Image from "next/image";

const inputCls =
  "w-full rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac placeholder:text-summit-smoke/60 focus:border-summit-cerise";

  export default function SigninPage(){
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState<boolean>(false);

    async function submit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setPending(true);
        setError(null);
        try{
            await login(email, password);
            router.push("/overview");
        } catch(err){
            setError((err as Error).message);
        } finally {
            setPending(false);
        }
    }

    return (
    <form onSubmit={submit} className="glass-card flex flex-col gap-4 p-8">
      <div className="flex items-center gap-2">
        <Image
  src="/Gender-Summit-Logo-02.png"
  alt="GS-26 logo"
  width={48}
  height={48}
  className="h-6 w-auto"
/>

        <span className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
          GS-26 Admin
        </span>
      </div>
      <p className="text-sm text-summit-smoke">Organiser sign-in. Admin-tier accounts only.</p>
      <input
        className={inputCls}
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={inputCls}
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-summit-cream">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
