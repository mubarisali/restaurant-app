"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ReviewSummary, ReviewTarget } from "@/types";
import { fetchFeedbackSummary } from "@/lib/api";

interface FeedbackContextType {
  summary: Record<string, ReviewSummary>;
  refreshSummary: () => void;
  /** Bumped after every new review so feedback lists can refetch */
  version: number;
  notifyNewReview: () => void;
  target: ReviewTarget | null;
  openReviews: (target: ReviewTarget) => void;
  closeReviews: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

// Today's specials use id 10000 + dish id; reviews are stored against the dish
export const reviewId = (id: number) => (id >= 10000 ? id - 10000 : id);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<Record<string, ReviewSummary>>({});
  const [target, setTarget] = useState<ReviewTarget | null>(null);
  const [version, setVersion] = useState(0);

  const refreshSummary = useCallback(() => {
    fetchFeedbackSummary().then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  const notifyNewReview = useCallback(() => {
    setVersion((v) => v + 1);
    refreshSummary();
  }, [refreshSummary]);

  const openReviews = useCallback((t: ReviewTarget) => setTarget(t), []);
  const closeReviews = useCallback(() => setTarget(null), []);

  return (
    <FeedbackContext.Provider
      value={{ summary, refreshSummary, version, notifyNewReview, target, openReviews, closeReviews }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
}
