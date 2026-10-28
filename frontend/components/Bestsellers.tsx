"use client";
import { motion } from "framer-motion";
import { Star, Award } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { ReviewLink } from "./Feedback";

interface BestsellerItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  isVeg: boolean;
  isSpicy: boolean;
  calories: number;
  isBestseller: boolean;
  category: string;
}

export default function Bestsellers({ items }: { items: BestsellerItem[] }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState<number | null>(null);

  const handleAdd = (item: BestsellerItem) => {
    addItem(item, "bestseller");
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1000);
  };

  return (
    <section id="bestsellers" className="py-12 md:py-16 bg-gradient-to-br from-amber-900 to-amber-800 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-300/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-semibold px-4 py-1 rounded-full mb-3">
            <Award className="w-4 h-4" /> Our Bestsellers
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-3">
            Crowd Favourites
          </h2>
          <p className="text-amber-200 max-w-xl mx-auto">
            The dishes our guests can never stop ordering. Try them and understand why.
          </p>
        </motion.div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  <Award className="w-3 h-3" /> Best
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {item.rating}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="text-xs text-orange-300 font-medium">{item.category}</span>
                <h3 className="font-semibold text-white text-base mt-0.5 mb-1">{item.name}</h3>
                <p className="text-amber-200/70 text-xs line-clamp-2 mb-2">{item.description}</p>
                <ReviewLink item={item} dark />

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-amber-300">₹{item.price}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAdd(item)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                      added === item.id
                        ? "bg-green-500 text-white"
                        : "bg-orange-500 hover:bg-orange-400 text-white"
                    }`}
                  >
                    {added === item.id ? "✓ Added" : "+ Add"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

