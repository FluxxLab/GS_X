const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// The vendor token lives in an httpOnly cookie set by the backend, so it's not
// readable here. `credentials: 'include'` makes the browser attach it on every
// request; auth state is whatever the server says (401 ⇒ logged out).
async function vendorFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    clearVendorSession();
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed with status ${res.status}`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

// Drop the cached non-sensitive display info and bounce to login. The httpOnly
// cookie itself can only be cleared server-side (see vendorPortalService.logout).
function clearVendorSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vendor_info');
    localStorage.removeItem('vendor_profile');
    window.location.href = '/vendor/portal/login';
  }
}

export const vendorPortalService = {
  // The token is set as an httpOnly cookie by the backend; the body returns
  // only non-sensitive display info.
  login(email: string, password: string) {
    return vendorFetch<{
      vendorId?: string;
      email?: string;
      contactName?: string;
      companyName?: string;
    }>('/vendor-portal/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  // Clears the httpOnly cookie server-side, then the local display cache.
  async logout() {
    try {
      await vendorFetch('/vendor-portal/logout', { method: 'POST' });
    } catch {
      // best-effort — clear locally regardless
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vendor_info');
      localStorage.removeItem('vendor_profile');
    }
  },
  getProfile() {
    return vendorFetch<Record<string, unknown>>('/vendor-portal/profile');
  },
  getDashboard() {
    return vendorFetch<Record<string, unknown>>('/vendor-portal/dashboard');
  },
  getPurchaseOrders() {
    // API may return a flat array or a paginated { data } envelope; pages narrow both.
    return vendorFetch<Record<string, unknown>[] | { data: Record<string, unknown>[] }>('/vendor-portal/purchase-orders');
  },
  getContracts() {
    return vendorFetch<Record<string, unknown>[] | { data: Record<string, unknown>[] }>('/vendor-portal/contracts');
  },
  getPayments() {
    return vendorFetch<Record<string, unknown>[]>('/vendor-portal/payments');
  },
  getInvoices() {
    return vendorFetch<Record<string, unknown>[]>('/vendor-portal/invoices');
  },
  getRfqs() {
    return vendorFetch<Record<string, unknown>[]>('/vendor-portal/rfqs');
  },
  submitQuote(rfqId: string, data: { totalAmount: number; lineQuotes?: Array<{ itemId: string; unitPrice: number; amount: number }>; validUntil?: string; notes?: string }) {
    return vendorFetch<Record<string, unknown>>(`/vendor-portal/rfqs/${rfqId}/quote`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  submitInvoice(data: {
    purchaseOrderId: string;
    invoiceNumber: string;
    amount: number;
    date: string;
    description?: string;
  }) {
    return vendorFetch<Record<string, unknown>>('/vendor-portal/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
