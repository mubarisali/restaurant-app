"use client";
import { motion } from "framer-motion";
import { ChefHat, Heart, Clock, Users, Award } from "lucide-react";

const stats = [
  { icon: <Clock className="w-6 h-6" />, value: "15+", label: "Years of Excellence" },
  { icon: <Users className="w-6 h-6" />, value: "50K+", label: "Happy Customers" },
  { icon: <Award className="w-6 h-6" />, value: "30+", label: "Signature Dishes" },
  { icon: <Heart className="w-6 h-6" />, value: "100%", label: "Made with Love" },
];

export default function About() {
  return (
    <section id="about" className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1 rounded-full mb-4">
              Our Story
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-amber-900 mb-6 leading-tight">
              A Legacy of{" "}
              <span className="text-orange-500">Authentic Flavours</span>
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Founded in 2008, Spice Garden was born from a passionate family recipe book and a dream
              to bring authentic Indian flavours to every plate. From the bustling streets of Old Delhi
              to the coastal kitchens of Kerala, our chefs travel across India to source the finest
              spices and techniques.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Every dish on our menu tells a story — of tradition, patience, and the belief that great
              food has the power to bring people together. We cook with the same love your grandmother
              would.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Chef Rajan Sharma</p>
                <p className="text-sm text-gray-500">Head Chef · 20 years experience</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 text-center shadow-sm"
              >
                <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  {s.icon}
                </div>
                <div className="font-playfair text-3xl font-bold text-amber-900 mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

