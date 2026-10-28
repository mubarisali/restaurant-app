"use client";
import { motion } from "framer-motion";
import { Plus, Star, Clock, Leaf, Tag, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Combo, Meal, MenuItem, TodaysSpecials } from "@/types";
import { ReviewLink } from "./Feedback";

interface OfferCardProps {
  item: MenuItem;
  categoryId: string;
  index: number;
  originalPrice?: number;
  badge?: string;
  subtitle?: string;
  includes?: string[];
  dark?: boolean;
}

function OfferCard({ item, categoryId, index, originalPrice, badge, subtitle, includes, dark }: OfferCardProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.id === item.id);

  const handleAdd = () => {
    addItem(item, categoryId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative rounded-2xl overflow-hidden shadow-lg flex flex-col w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] ${
        dark ? "bg-white/10 backdrop-blur-sm border border-white/15" : "bg-white border border-amber-100"
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.isVeg ? (
            <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <Leaf className="w-3 h-3" /> Veg
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              🥩 Non-Veg
            </span>
          )}
        </div>
        {badge && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            <Tag className="w-3 h-3" /> {badge}
          </span>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{item.rating}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {subtitle && (
          <span className={`text-xs font-medium mb-0.5 ${dark ? "text-orange-300" : "text-orange-600"}`}>{subtitle}</span>
        )}
        <h3 className={`font-semibold text-lg leading-tight mb-1.5 ${dark ? "text-white" : "text-amber-900"}`}>
          {item.name}
        </h3>
        <p className={`text-sm line-clamp-2 mb-2 ${dark ? "text-amber-200/70" : "text-gray-500"}`}>{item.description}</p>
        <ReviewLink item={item} dark={dark} />

        {includes && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {includes.map((inc) => (
              <span
                key={inc}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  dark ? "bg-white/10 text-amber-100" : "bg-amber-50 text-amber-800 border border-amber-100"
                }`}
              >
                {inc}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${dark ? "text-amber-300" : "text-amber-900"}`}>₹{item.price}</span>
            {originalPrice && originalPrice > item.price && (
              <span className={`text-sm line-through ${dark ? "text-amber-200/50" : "text-gray-400"}`}>
                ₹{originalPrice}
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              added
                ? "bg-green-500 text-white"
                : inCart
                ? "bg-orange-100 text-orange-700 border-2 border-orange-400"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {added ? (
              <>✓ Added</>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {inCart ? `(${inCart.quantity}) Add` : "Add"}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeading({ label, title, text, dark }: { label: string; title: string; text: string; dark?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-8"
    >
      <span
        className={`inline-block text-sm font-semibold px-4 py-1 rounded-full mb-3 ${
          dark ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-600"
        }`}
      >
        {label}
      </span>
      <h2 className={`font-playfair text-4xl md:text-5xl font-bold mb-3 ${dark ? "text-white" : "text-amber-900"}`}>
        {title}
      </h2>
      <p className={`max-w-xl mx-auto ${dark ? "text-amber-200/80" : "text-gray-500"}`}>{text}</p>
    </motion.div>
  );
}

export function TodaysSpecial({ specials }: { specials: TodaysSpecials }) {
  return (
    <section id="specials" className="py-12 md:py-16 px-4 bg-gradient-to-b from-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label={`✨ ${specials.day}'s Special`}
          title="Today's Special"
          text="Chef's picks for today at a special price — available until closing."
        />
        <div className="flex flex-wrap justify-center gap-6">
          {specials.items.map((item, idx) => (
            <OfferCard
              key={item.id}
              item={item}
              categoryId="specials"
              index={idx}
              originalPrice={item.originalPrice}
              badge={`${item.discount}% OFF`}
              subtitle={`${item.category} · ${item.subcategory}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Meals({ meals }: { meals: Meal[] }) {
  return (
    <section id="meals" className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
      <SectionHeading
        label="🍱 Lunch Meals"
        title="Meals & Thali"
        text="Complete lunch meals served fresh every afternoon."
      />
      <div className="flex justify-center -mt-2 mb-8">
        <span className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 px-4 py-1.5 rounded-full">
          <Clock className="w-4 h-4" /> Served daily {meals[0]?.timing}
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {meals.map((meal, idx) => (
          <OfferCard key={meal.id} item={meal} categoryId="meals" index={idx} includes={meal.includes} />
        ))}
      </div>
    </section>
  );
}

export function Combos({ combos }: { combos: Combo[] }) {
  return (
    <section id="combos" className="py-12 md:py-16 bg-gradient-to-br from-amber-900 to-orange-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <SectionHeading
          dark
          label="🎉 Save More"
          title="Combo Offers"
          text="Bundled favourites for one, two or the whole family — at a better price."
        />
        <div className="flex flex-wrap justify-center gap-6">
          {combos.map((combo, idx) => (
            <OfferCard
              key={combo.id}
              dark
              item={combo}
              categoryId="combos"
              index={idx}
              originalPrice={combo.originalPrice}
              badge={`Save ₹${combo.originalPrice - combo.price}`}
              subtitle={combo.tag}
              includes={combo.includes}
            />
          ))}
        </div>
        <p className="flex items-center justify-center gap-2 text-amber-200/70 text-sm mt-10">
          <Sparkles className="w-4 h-4" /> Combos cannot be clubbed with other offers.
        </p>
      </div>
    </section>
  );
}
