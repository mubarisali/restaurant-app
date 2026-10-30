const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// The backend runs on Render's free tier, which sleeps when idle and answers with 5xx errors
// (or not at all) for ~30-60s while waking up. Retry GETs through that window instead of failing.
async function getWithRetry(url: string, attempts = 8, delayMs = 5000): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(20000) });
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  throw lastError;
}

export async function fetchMenu() {
  const res = await getWithRetry(`${API_BASE}/api/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function fetchRestaurant() {
  const res = await getWithRetry(`${API_BASE}/api/restaurant`);
  if (!res.ok) throw new Error("Failed to fetch restaurant info");
  return res.json();
}

export async function fetchBestsellers() {
  const res = await getWithRetry(`${API_BASE}/api/bestsellers`);
  if (!res.ok) throw new Error("Failed to fetch bestsellers");
  return res.json();
}


export async function fetchSpecials() {
  const res = await getWithRetry(`${API_BASE}/api/specials`);
  if (!res.ok) throw new Error("Failed to fetch today's specials");
  return res.json();
}

export async function fetchMeals() {
  const res = await getWithRetry(`${API_BASE}/api/meals`);
  if (!res.ok) throw new Error("Failed to fetch meals");
  return res.json();
}

export async function fetchCombos() {
  const res = await getWithRetry(`${API_BASE}/api/combos`);
  if (!res.ok) throw new Error("Failed to fetch combos");
  return res.json();
}

export async function fetchFeedback(params: { itemId?: number; general?: boolean; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.itemId !== undefined) qs.set("item_id", String(params.itemId));
  if (params.general) qs.set("general", "true");
  if (params.limit) qs.set("limit", String(params.limit));
  const res = await getWithRetry(`${API_BASE}/api/feedback?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch feedback");
  return res.json();
}

export async function fetchFeedbackSummary() {
  const res = await getWithRetry(`${API_BASE}/api/feedback/summary`);
  if (!res.ok) throw new Error("Failed to fetch feedback summary");
  return res.json();
}

export async function postFeedback(body: { itemId: number | null; name: string; rating: number; comment: string }) {
  const res = await fetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return res.json();
}

async function errorDetail(res: Response, fallback: string) {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
  } catch {}
  return fallback;
}

export async function placeOrder(order: import("@/types").OrderRequest) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(await errorDetail(res, "Couldn't place your order. Please try again."));
  return res.json();
}

export async function fetchOrder(orderId: string, phone: string) {
  const res = await getWithRetry(`${API_BASE}/api/orders/${encodeURIComponent(orderId.trim())}?phone=${encodeURIComponent(phone.trim())}`);
  if (!res.ok) throw new Error(await errorDetail(res, "Couldn't find that order."));
  return res.json();
}
