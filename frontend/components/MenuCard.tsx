"use client";
import { motion } from "framer-motion";
import { Plus, Star, Flame, Leaf, Award } from "lucide-react";
import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import { ReviewLink } from "./Feedback";

interface Props {
  item: MenuItem;
  categoryId: string;
  index: number;
}

export default function MenuCard({ item, categoryId, index }: Props) {
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
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md card-hover border border-amber-100"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          unoptimized
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.isBestseller && (
            <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <Award className="w-3 h-3" /> Bestseller
            </span>
          )}
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

        {item.isSpicy && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-0.5 bg-red-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" /> Spicy
            </span>
          </div>
        )}

        {/* Rating on image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{item.rating}</span>
        </div>

        {/* Calories */}
        <div className="absolute bottom-3 right-3 text-xs bg-black/50 text-amber-200 px-2 py-0.5 rounded-full">
          🔥 {item.calories} kcal
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-amber-900 text-lg leading-tight mb-1.5 group-hover:text-orange-600 transition-colors">
          {item.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-2 leading-relaxed">
          {item.description}
        </p>
        <ReviewLink item={item} />

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-amber-900">₹{item.price}</span>
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

