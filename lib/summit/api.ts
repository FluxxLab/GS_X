 export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
    ){
        super(message);
    }
 }
    export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
        const res = await fetch(`/api/gs26${path}`,{
            ...init,
            headers: {
                "Content-type": "application/json",
                ...init.headers
            },
        });

        if(res.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/signin")){
            window.location.href = "/signin";
        }

        if(!res.ok){
            const body = await res.json().catch(() => null);
            const msg = Array.isArray(body?.message) ? body.message.join(",") :(body?.message ?? res.statusText);
            throw new ApiError(res.status, msg);
        }
        return res.status === 204 ? (undefined as T): res.json();
    }
 