import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// In-memory stand-in for the IndexedDB layer so the queue logic is tested in
// isolation. Reset per test.
let store: Record<string, unknown>[] = [];
vi.mock("./idb", () => ({
  idbGetAll: vi.fn(async () => store),
  idbPut: vi.fn(async (v: Record<string, unknown>) => {
    const i = store.findIndex((x) => x.id === v.id);
    if (i >= 0) store[i] = v; else store.push(v);
  }),
  idbDelete: vi.fn(async (id: string) => { store = store.filter((x) => x.id !== id); }),
}));

function setOnline(v: boolean) {
  Object.defineProperty(navigator, "onLine", { value: v, configurable: true });
}

// Each test re-imports the module so its in-memory queue starts empty.
async function freshOutbox() {
  vi.resetModules();
  return import("./outbox");
}

const INVOICE = { endpoint: "/vendor-portal/invoices", body: { invoiceNumber: "INV-1" }, label: "Invoice INV-1", kind: "invoice" };

describe("offline outbox", () => {
  beforeEach(() => {
    store = [];
    setOnline(true);
  });
  afterEach(() => vi.restoreAllMocks());

  it("sends immediately when online and returns the response", async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({ id: "srv-1" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const outbox = await freshOutbox();

    const res = await outbox.submit(INVOICE);
    expect(res).toEqual({ queued: false, data: { id: "srv-1" } });
    // The idempotency key must ride along so a replay can dedupe.
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBeTruthy();
    expect(store).toHaveLength(0);
  });

  it("queues the write when offline instead of failing", async () => {
    vi.stubGlobal("fetch", vi.fn());
    setOnline(false);
    const outbox = await freshOutbox();

    const res = await outbox.submit(INVOICE);
    expect(res).toEqual({ queued: true });
    expect(store).toHaveLength(1);
    expect(store[0]).toMatchObject({ status: "queued", endpoint: INVOICE.endpoint });
  });

  it("queues the write when the network drops mid-send", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network"); }));
    const outbox = await freshOutbox();

    const res = await outbox.submit(INVOICE);
    expect(res.queued).toBe(true);
    expect(store).toHaveLength(1);
  });

  it("throws (does not queue) on a validation rejection", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "Bad PO" }), { status: 400 })));
    const outbox = await freshOutbox();

    await expect(outbox.submit(INVOICE)).rejects.toThrow("Bad PO");
    expect(store).toHaveLength(0);
  });

  it("flush delivers a queued item once, drops it, and notifies onSynced", async () => {
    // First: offline submit to enqueue.
    setOnline(false);
    vi.stubGlobal("fetch", vi.fn());
    const outbox = await freshOutbox();
    await outbox.submit(INVOICE);
    expect(store).toHaveLength(1);

    // Then: come online with a working server and flush.
    setOnline(true);
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "srv-1" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const synced: string[] = [];
    outbox.onSynced((item) => synced.push(item.id));

    await outbox.flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store).toHaveLength(0);
    expect(synced).toHaveLength(1);
  });

  it("flush dead-letters a permanent failure but keeps a transient one queued", async () => {
    setOnline(false);
    vi.stubGlobal("fetch", vi.fn());
    const outbox = await freshOutbox();
    await outbox.submit(INVOICE); // permanent case
    await outbox.submit({ ...INVOICE, body: { invoiceNumber: "INV-2" }, label: "Invoice INV-2" }); // transient case

    setOnline(true);
    // First item 400 (permanent), second 503 (transient).
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Bad" }), { status: 400 }))
      .mockResolvedValueOnce(new Response("", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    await outbox.flush();
    const statuses = store.map((x) => x.status).sort();
    expect(statuses).toEqual(["failed", "queued"]);
  });
});
