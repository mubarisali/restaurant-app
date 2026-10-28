"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, ChefHat, Bike, PackageCheck, UtensilsCrossed, CheckCircle2, Search, RefreshCw } from "lucide-react";
import { fetchOrder } from "@/lib/api";
import { Order } from "@/types";

const LAST_ORDER_KEY = "spice-garden-last-order";
export const ORDER_PLACED_EVENT = "spice-garden:order-placed";

export function rememberOrder(order: Order) {
  try {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ orderId: order.orderId, phone: order.phone }));
  } catch {}
  window.dispatchEvent(new CustomEvent(ORDER_PLACED_EVENT, { detail: order }));
}

function recalledOrder(): { orderId: string; phone: string } | null {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const STEP_INFO: Record<string, { label: string; icon: React.ElementType }> = {
  placed: { label: "Order placed", icon: ClipboardList },
  preparing: { label: "Preparing", icon: ChefHat },
  out_for_delivery: { label: "Out for delivery", icon: Bike },
  ready: { label: "Ready for pickup", icon: PackageCheck },
  served: { label: "Served", icon: UtensilsCrossed },
  delivered: { label: "Delivered", icon: CheckCircle2 },
  completed: { label: "Picked up", icon: CheckCircle2 },
};

export const ORDER_TYPE_LABEL = { "dine-in": "🍽️ Dine-in", takeaway: "🥡 Takeaway", delivery: "🛵 Delivery" };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function OrderProgress({ order }: { order: Order }) {
  const current = order.steps.indexOf(order.status);
  const finished = current === order.steps.length - 1;
  return (
    <div>
      <div className="flex items-start">
        {order.steps.map((step, i) => {
          const info = STEP_INFO[step] ?? { label: step, icon: ClipboardList };
          const Icon = info.icon;
          const done = i <= current;
          return (
            <div key={step} className="flex-1 flex flex-col items-center text-center relative">
              {i > 0 && (
                <div
                  className={`absolute top-5 right-1/2 w-full h-1 -z-0 ${i <= current ? "bg-orange-500" : "bg-amber-200"}`}
                />
              )}
              <motion.div
                initial={false}
                animate={{ scale: i === current && !finished ? [1, 1.12, 1] : 1 }}
                transition={{ repeat: i === current && !finished ? Infinity : 0, duration: 1.6 }}
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  done ? "bg-orange-500 text-white" : "bg-amber-100 text-amber-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className={`mt-2 text-xs font-medium ${done ? "text-amber-900" : "text-amber-400"}`}>
                {info.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-amber-700 mt-4">
        {finished
          ? "Enjoy your meal! 🎉"
          : `Estimated ${order.orderType === "delivery" ? "delivery" : "ready"} by ${formatTime(order.estimatedReadyAt)}`}
      </p>
    </div>
  );
}

/** Page section: look up an order by ID + phone and follow its progress */
export function OrderTracker() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (id: string, ph: string, quiet = false) => {
    if (!quiet) {
      setLoading(true);
      setError("");
    }
    try {
      setOrder(await fetchOrder(id, ph));
    } catch (e) {
      if (!quiet) {
        setOrder(null);
        setError(e instanceof Error ? e.message : "Couldn't find that order.");
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  // Show the customer's most recent order automatically, and pick up new ones as they're placed
  useEffect(() => {
    const last = recalledOrder();
    if (last) {
      setOrderId(last.orderId);
      setPhone(last.phone);
      lookup(last.orderId, last.phone, true);
    }
    const onPlaced = (e: Event) => {
      const placed = (e as CustomEvent<Order>).detail;
      setOrderId(placed.orderId);
      setPhone(placed.phone);
      setOrder(placed);
      setError("");
    };
    window.addEventListener(ORDER_PLACED_EVENT, onPlaced);
    return () => window.removeEventListener(ORDER_PLACED_EVENT, onPlaced);
  }, [lookup]);

  // Refresh while the order is still in progress
  const inProgress = order && order.steps.indexOf(order.status) < order.steps.length - 1;
  useEffect(() => {
    if (!order || !inProgress) return;
    const t = setInterval(() => lookup(order.orderId, order.phone, true), 20000);
    return () => clearInterval(t);
  }, [order, inProgress, lookup]);

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border-2 border-amber-100 bg-white focus:outline-none focus:border-orange-400 text-amber-900 placeholder-amber-300 text-sm";

  return (
    <section id="track" className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1 rounded-full mb-3">
            🛵 Live Order Status
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-amber-900 mb-3">Track Your Order</h2>
          <p className="text-gray-500">Enter your order ID and the phone number you used at checkout.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (orderId.trim() && phone.trim()) lookup(orderId, phone);
          }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <input className={inputCls} placeholder="Order ID (e.g. SG-1001)" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          <input className={inputCls} placeholder="Phone number" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold"
          >
            <Search className="w-4 h-4" /> {loading ? "Checking…" : "Track"}
          </button>
        </form>

        {error && <p className="text-center text-red-600 text-sm mb-4">{error}</p>}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 rounded-2xl border border-amber-100 p-5 md:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-xs text-amber-500">Order</p>
                <p className="font-bold text-amber-900 text-xl">{order.orderId}</p>
                <p className="text-sm text-amber-700">
                  {ORDER_TYPE_LABEL[order.orderType]}
                  {order.tableNumber && ` · Table ${order.tableNumber}`} · placed {formatTime(order.createdAt)}
                </p>
              </div>
              <button
                onClick={() => lookup(order.orderId, order.phone)}
                className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            <OrderProgress order={order} />

            <div className="mt-6 pt-4 border-t border-amber-200 space-y-1.5 text-sm">
              {order.items.map((line) => (
                <div key={line.id} className="flex justify-between text-amber-800">
                  <span>
                    {line.quantity} × {line.name}
                  </span>
                  <span>₹{line.lineTotal}</span>
                </div>
              ))}
              <div className="flex justify-between text-amber-600 pt-2">
                <span>Taxes (5%){order.deliveryFee > 0 && " + delivery"}</span>
                <span>₹{order.tax + order.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-900 text-base">
                <span>Total (pay on {order.orderType === "delivery" ? "delivery" : "counter"})</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
