export async function login(email: string, password: string){
    const res = await fetch("/api/gs26/auth/login",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            
        },
        body: JSON.stringify({email, password})
    });
    if(!res.ok){
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Login failed");
    }
}

export async function logout() {
  const { disconnectSocket } = await import("./socket");
  disconnectSocket();
  await fetch("/api/gs26/auth/logout", { method: "POST" });
  window.location.href = "/signin";
}


