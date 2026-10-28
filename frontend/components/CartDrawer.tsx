"use client";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { placeOrder } from "@/lib/api";
import { Order, OrderType } from "@/types";
import { ORDER_TYPE_LABEL, OrderProgress, rememberOrder } from "./Order";

// Mirrors the backend's pricing; the server recalculates the final bill
const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;
const FREE_DELIVERY_ABOVE = 499;

type Step = "cart" | "checkout" | "done";

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem, clearCart, total, count } =
    useCart();
  const [step, setStep] = useState<Step>("cart");
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [form, setForm] = useState({ name: "", phone: "", address: "", table: "", notes: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  const tax = Math.round(total * TAX_RATE);
  const deliveryFee = orderType === "delivery" && step !== "cart" && total < FREE_DELIVERY_ABOVE ? DELIVERY_FEE : 0;
  const grandTotal = total + tax + deliveryFee;

  const close = () => {
    setIsOpen(false);
    if (step === "done") {
      setStep("cart");
      setPlaced(null);
    }
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: field === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value }));

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setError("Please enter a valid 10-digit mobile number.");
    if (orderType === "delivery" && !form.address.trim()) return setError("Please enter your delivery address.");
    setError("");
    setSubmitting(true);
    try {
      const order: Order = await placeOrder({
        customerName: form.name.trim(),
        phone: form.phone,
        orderType,
        address: orderType === "delivery" ? form.address.trim() : undefined,
        tableNumber: orderType === "dine-in" ? form.table.trim() || undefined : undefined,
        notes: form.notes.trim() || undefined,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      });
      rememberOrder(order);
      setPlaced(order);
      setStep("done");
      clearCart();
      setForm((f) => ({ ...f, notes: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const trackOrder = () => {
    close();
    setTimeout(() => document.getElementById("track")?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border-2 border-amber-100 bg-white focus:outline-none focus:border-orange-400 text-amber-900 placeholder-amber-300 text-sm";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-amber-100 bg-amber-50">
              <div className="flex items-center gap-2">
                {step === "checkout" ? (
                  <button onClick={() => setStep("cart")} aria-label="Back to cart" className="p-1 -ml-1 rounded-full hover:bg-amber-200">
                    <ArrowLeft className="w-5 h-5 text-orange-500" />
                  </button>
                ) : (
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                )}
                <h2 className="font-semibold text-amber-900 text-lg">
                  {step === "checkout" ? "Checkout" : step === "done" ? "Order Confirmed" : (
                    <>
                      Your Order <span className="text-orange-500">({count})</span>
                    </>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {step === "cart" && items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
                <button
                  onClick={close}
                  aria-label="Close cart"
                  className="p-1.5 rounded-full hover:bg-amber-200 transition-colors"
                >
                  <X className="w-5 h-5 text-amber-700" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {step === "done" && placed ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-4">
                  <div className="text-6xl mb-3">🎉</div>
                  <p className="text-amber-900 font-bold text-xl">Thank you, {placed.customerName}!</p>
                  <p className="text-amber-600 text-sm mb-5">Your order has been received.</p>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
                    <p className="text-xs text-amber-500">Order ID</p>
                    <p className="text-2xl font-bold text-orange-600 tracking-wide">{placed.orderId}</p>
                    <p className="text-sm text-amber-700 mt-1">
                      {ORDER_TYPE_LABEL[placed.orderType]} · ₹{placed.total}
                    </p>
                  </div>
                  <OrderProgress order={placed} />
                  <p className="text-xs text-amber-500 mt-4">Save your order ID — you can track it any time with your phone number.</p>
                </motion.div>
              ) : step === "checkout" ? (
                <form id="checkout-form" onSubmit={handleOrder} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-2">How would you like your order?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(ORDER_TYPE_LABEL) as OrderType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setOrderType(t)}
                          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                            orderType === t
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-amber-100 text-amber-700 hover:border-orange-200"
                          }`}
                        >
                          {ORDER_TYPE_LABEL[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input className={inputCls} placeholder="Your name" maxLength={60} value={form.name} onChange={set("name")} autoComplete="name" />
                  <input className={inputCls} placeholder="Mobile number (10 digits)" inputMode="numeric" maxLength={10} value={form.phone} onChange={set("phone")} autoComplete="tel" />
                  {orderType === "delivery" && (
                    <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Delivery address" maxLength={300} value={form.address} onChange={set("address")} autoComplete="street-address" />
                  )}
                  {orderType === "dine-in" && (
                    <input className={inputCls} placeholder="Table number (optional)" maxLength={10} value={form.table} onChange={set("table")} />
                  )}
                  <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Cooking notes — e.g. less spicy, no onion (optional)" maxLength={300} value={form.notes} onChange={set("notes")} />
                  <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800 space-y-1">
                    {items.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span className="truncate pr-2">{i.quantity} × {i.name}</span>
                        <span>₹{i.price * i.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-500">💵 Pay on {orderType === "delivery" ? "delivery" : "counter"} — cash or UPI.</p>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </form>
              ) : items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="text-7xl mb-4">🛒</div>
                  <p className="text-amber-700 font-medium text-lg">Your cart is empty</p>
                  <p className="text-amber-400 text-sm mt-1">
                    Add some delicious dishes!
                  </p>
                  <button
                    onClick={close}
                    className="mt-6 px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Browse Menu
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-amber-900 font-medium text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-orange-500 font-bold text-sm">
                            ₹{item.price * item.quantity}
                          </p>
                          <p className="text-amber-400 text-xs">₹{item.price} each</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-amber-800" />
                          </motion.button>
                          <span className="w-6 text-center text-amber-900 font-semibold text-sm">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </motion.button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {step === "done" ? (
              <div className="p-5 border-t border-amber-100 bg-amber-50">
                <button
                  onClick={trackOrder}
                  className="w-full py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-200"
                >
                  Track my order
                </button>
              </div>
            ) : items.length > 0 && (
              <div className="p-5 border-t border-amber-100 bg-amber-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-amber-600 text-sm">Subtotal</span>
                  <span className="text-amber-900 font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-amber-600 text-sm">Taxes (5%)</span>
                  <span className="text-amber-900 font-medium">₹{tax}</span>
                </div>
                {step === "checkout" && orderType === "delivery" && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-600 text-sm">
                      Delivery {deliveryFee === 0 && <span className="text-green-600">(free above ₹{FREE_DELIVERY_ABOVE})</span>}
                    </span>
                    <span className="text-amber-900 font-medium">{deliveryFee ? `₹${deliveryFee}` : "FREE"}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-4 pt-2 border-t border-amber-200">
                  <span className="text-amber-900 font-bold">Total</span>
                  <span className="text-orange-600 font-bold text-xl">₹{grandTotal}</span>
                </div>

                {step === "cart" ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("checkout")}
                    className="w-full py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-200 hover:shadow-orange-300"
                  >
                    Proceed to Checkout
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    form="checkout-form"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-200 hover:shadow-orange-300 disabled:opacity-60"
                  >
                    {submitting ? "Placing order…" : `Place Order · ₹${grandTotal}`}
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

