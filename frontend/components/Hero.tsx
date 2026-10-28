"use client";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, Phone, ChevronDown } from "lucide-react";
import { RestaurantInfo } from "@/types";

export default function Hero({ info }: { info: RestaurantInfo }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient"
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { top: "10%", left: "5%" },
          { top: "60%", left: "80%" },
          { top: "30%", left: "70%" },
          { top: "80%", left: "20%" },
          { top: "20%", left: "50%" },
          { top: "70%", left: "40%" },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10 bg-orange-500"
            style={{
              width: `${(i + 1) * 120}px`,
              height: `${(i + 1) * 120}px`,
              top: pos.top,
              left: pos.left,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Floating food emojis */}
      {["🍛", "🌶️", "🍗", "🥘", "🍲", "🫕"].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl select-none pointer-events-none"
          style={{
            top: `${10 + i * 15}%`,
            left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
            right: i % 2 !== 0 ? `${5 + i * 2}%` : undefined,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-full px-4 py-1.5 mb-6"
        >
          <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span className="text-orange-300 text-sm font-medium">
            {info.rating} · {info.totalReviews.toLocaleString()} Reviews
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-playfair text-5xl md:text-7xl font-bold text-white mb-4 leading-tight"
        >
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
            {info.name}
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-amber-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
        >
          {info.tagline}
        </motion.p>

        {/* Info row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mb-10 text-amber-300 text-sm"
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{info.openTime} – {info.closeTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{info.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4" />
            <span>{info.phone}</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <motion.a
            href="#menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
          >
            Explore Menu 🍽️
          </motion.a>
          <motion.a
            href="#bestsellers"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 border-2 border-orange-400/60 text-orange-300 font-semibold rounded-full hover:bg-orange-400/10 transition-colors"
          >
            Bestsellers ⭐
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-amber-400 opacity-70" />
      </motion.div>
    </section>
  );
}
