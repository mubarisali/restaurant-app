const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchMenu() {
  const res = await fetch(`${API_BASE}/api/menu`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function fetchRestaurant() {
  const res = await fetch(`${API_BASE}/api/restaurant`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch restaurant info");
  return res.json();
}

export async function fetchBestsellers() {
  const res = await fetch(`${API_BASE}/api/bestsellers`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch bestsellers");
  return res.json();
}


export async function fetchSpecials() {
  const res = await fetch(`${API_BASE}/api/specials`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch today's specials");
  return res.json();
}

export async function fetchMeals() {
  const res = await fetch(`${API_BASE}/api/meals`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meals");
  return res.json();
}

export async function fetchCombos() {
  const res = await fetch(`${API_BASE}/api/combos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch combos");
  return res.json();
}

export async function fetchFeedback(params: { itemId?: number; general?: boolean; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.itemId !== undefined) qs.set("item_id", String(params.itemId));
  if (params.general) qs.set("general", "true");
  if (params.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${API_BASE}/api/feedback?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch feedback");
  return res.json();
}

export async function fetchFeedbackSummary() {
  const res = await fetch(`${API_BASE}/api/feedback/summary`, { cache: "no-store" });
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
  const res = await fetch(
    `${API_BASE}/api/orders/${encodeURIComponent(orderId.trim())}?phone=${encodeURIComponent(phone.trim())}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(await errorDetail(res, "Couldn't find that order."));
  return res.json();
}
