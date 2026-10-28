"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, MessageSquare, Send } from "lucide-react";
import { fetchFeedback, postFeedback } from "@/lib/api";
import { reviewId, useFeedback } from "@/context/FeedbackContext";
import { Category, Review, ReviewList, ReviewTarget } from "@/types";

const RATING_LABELS = ["", "Poor", "Okay", "Good", "Very good", "Excellent"];

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

export function Stars({ value, size = "w-4 h-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-amber-200"}`}
        />
      ))}
    </span>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star className={`w-7 h-7 ${n <= shown ? "fill-amber-400 text-amber-400" : "text-amber-200"}`} />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-amber-700 min-w-[5rem]">{RATING_LABELS[shown]}</span>
    </div>
  );
}

function ReviewForm({
  itemId,
  onSubmitted,
  children,
}: {
  itemId: number | null;
  onSubmitted: (review: Review) => void;
  children?: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    if (!name.trim() || !comment.trim()) return setError("Please add your name and a comment.");
    setError("");
    setStatus("sending");
    try {
      const review = await postFeedback({ itemId, name: name.trim(), rating, comment: comment.trim() });
      onSubmitted(review);
      setRating(0);
      setComment("");
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setError("Couldn't send your feedback. Please try again.");
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border-2 border-amber-100 bg-white focus:outline-none focus:border-orange-400 text-amber-900 placeholder-amber-300 text-sm";

  return (
    <form onSubmit={submit} className="space-y-3">
      {children}
      <StarInput value={rating} onChange={setRating} />
      <input
        className={inputCls}
        placeholder="Your name"
        maxLength={40}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder="How was the food? Taste, portion, spice level…"
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="text-right text-xs text-amber-400">{comment.length}/500</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-white transition-colors ${
          status === "done" ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600 disabled:opacity-60"
        }`}
      >
        {status === "done" ? (
          "✓ Thanks for your feedback!"
        ) : (
          <>
            <Send className="w-4 h-4" /> {status === "sending" ? "Sending…" : "Submit Feedback"}
          </>
        )}
      </button>
    </form>
  );
}

function ReviewCard({ review, showDish }: { review: Review; showDish?: boolean }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 border border-amber-100"
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 shrink-0 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
            {review.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-amber-900 text-sm truncate">{review.name}</p>
            <p className="text-xs text-amber-500">{timeAgo(review.createdAt)}</p>
          </div>
        </div>
        <Stars value={review.rating} size="w-3.5 h-3.5" />
      </div>
      {showDish && (
        <span className="inline-block text-xs bg-amber-50 text-orange-700 border border-amber-100 px-2 py-0.5 rounded-full mb-1.5">
          {review.itemId === null ? "🏠 " : "🍽️ "}
          {review.itemName}
        </span>
      )}
      <p className="text-sm text-gray-600 leading-relaxed break-words">{review.comment}</p>
    </motion.li>
  );
}

/** "★ 4.6 · 12 reviews" link shown on dish cards; opens the reviews panel */
export function ReviewLink({ item, dark }: { item: ReviewTarget; dark?: boolean }) {
  const { summary, openReviews } = useFeedback();
  const s = summary[String(reviewId(item.id))];
  return (
    <button
      type="button"
      onClick={() => openReviews(item)}
      className={`flex items-center gap-1.5 text-xs font-medium mb-3 hover:underline ${
        dark ? "text-amber-200" : "text-orange-600"
      }`}
    >
      <MessageSquare className="w-3.5 h-3.5" />
      {s ? (
        <>
          ★ {s.average} · {s.count} review{s.count > 1 ? "s" : ""}
        </>
      ) : (
        "Be the first to review"
      )}
    </button>
  );
}

/** Slide-in panel with rating, review form and latest comments for one dish */
export function ReviewModal() {
  const { target, closeReviews, notifyNewReview } = useFeedback();
  const [data, setData] = useState<ReviewList | null>(null);

  const id = target ? reviewId(target.id) : null;

  useEffect(() => {
    if (id === null) return;
    setData(null);
    fetchFeedback({ itemId: id, limit: 20 })
      .then(setData)
      .catch(() => setData({ average: 0, count: 0, reviews: [] }));
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeReviews();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeReviews]);

  const handleSubmitted = (review: Review) => {
    setData((prev) => {
      const reviews = [review, ...(prev?.reviews ?? [])];
      const count = (prev?.count ?? 0) + 1;
      const average = Math.round((((prev?.average ?? 0) * (count - 1) + review.rating) / count) * 10) / 10;
      return { average, count, reviews };
    });
    notifyNewReview();
  };

  return (
    <AnimatePresence>
      {target && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeReviews}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            role="dialog"
            aria-label={`Reviews for ${target.name}`}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-amber-50 z-[70] shadow-2xl flex flex-col"
          >
            <div className="relative h-40 shrink-0">
              <Image src={target.image} alt={target.name} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
              <button
                onClick={closeReviews}
                aria-label="Close reviews"
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="font-playfair text-2xl font-bold">{target.name}</h3>
                {data && data.count > 0 ? (
                  <p className="flex items-center gap-2 text-sm">
                    <Stars value={data.average} /> {data.average} · {data.count} review{data.count > 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="text-sm text-amber-200">No reviews yet</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
                <h4 className="font-semibold text-amber-900 mb-3">Rate this dish</h4>
                <ReviewForm key={id} itemId={id} onSubmitted={handleSubmitted} />
              </div>

              <div>
                <h4 className="font-semibold text-amber-900 mb-3">Latest comments</h4>
                {!data ? (
                  <p className="text-sm text-amber-500">Loading…</p>
                ) : data.reviews.length === 0 ? (
                  <p className="text-sm text-amber-500">No comments yet — tell us what you thought!</p>
                ) : (
                  <ul className="space-y-3">
                    {data.reviews.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

interface DishOption {
  id: number;
  name: string;
}

/** Page section: leave feedback on any dish or the overall experience, and see the latest feedback */
export function FeedbackSection({
  categories,
  extras,
}: {
  categories: Category[];
  extras: { label: string; items: DishOption[] }[];
}) {
  const { version, notifyNewReview } = useFeedback();
  const [dish, setDish] = useState<string>("general");
  const [filter, setFilter] = useState<"all" | "general">("all");
  const [data, setData] = useState<ReviewList | null>(null);

  useEffect(() => {
    fetchFeedback({ general: filter === "general", limit: 10 })
      .then(setData)
      .catch(() => setData({ average: 0, count: 0, reviews: [] }));
  }, [filter, version]);

  const selectCls =
    "w-full px-4 py-2.5 rounded-xl border-2 border-amber-100 bg-white focus:outline-none focus:border-orange-400 text-amber-900 text-sm";

  return (
    <section id="feedback" className="py-12 md:py-16 px-4 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1 rounded-full mb-3">
            💬 Your Feedback
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-amber-900 mb-3">
            Tell Us How It Was
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Rate a dish you tried or share your overall experience. You can also tap “reviews” on any dish card.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-amber-100 h-fit">
            <h3 className="font-semibold text-amber-900 text-lg mb-4">Leave feedback</h3>
            <ReviewForm
              key={dish}
              itemId={dish === "general" ? null : Number(dish)}
              onSubmitted={notifyNewReview}
            >
              <label className="block">
                <span className="text-sm font-medium text-amber-800 mb-1 block">What are you reviewing?</span>
                <select className={selectCls} value={dish} onChange={(e) => setDish(e.target.value)}>
                  <option value="general">🏠 Overall experience</option>
                  {categories.map((cat) => (
                    <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                      {cat.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {extras.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            </ReviewForm>
          </div>

          <div className="lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-amber-900 text-lg">Latest feedback</h3>
                {data && data.count > 0 && (
                  <p className="flex items-center gap-2 text-sm text-amber-700">
                    <Stars value={data.average} /> {data.average} average · {data.count} review
                    {data.count > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="inline-flex bg-white border border-amber-200 rounded-full p-1">
                {(["all", "general"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filter === f ? "bg-orange-500 text-white" : "text-amber-800 hover:bg-amber-50"
                    }`}
                  >
                    {f === "all" ? "All feedback" : "Overall experience"}
                  </button>
                ))}
              </div>
            </div>

            {!data ? (
              <p className="text-amber-500">Loading…</p>
            ) : data.reviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-amber-200 text-amber-500">
                <div className="text-5xl mb-3">📝</div>
                <p>No feedback yet. Be the first to share yours!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} showDish />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
