"use client";
import { ChefHat, Share2, ThumbsUp, Send, MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-amber-950 text-amber-200 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-7 h-7 text-orange-400" />
              <span className="font-playfair text-xl font-bold text-white">
                Spice <span className="text-orange-400">Garden</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-amber-300/80 mb-5">
              Where every bite tells a story. Authentic Indian cuisine crafted with passion, spices, and generations of love.
            </p>
            <div className="flex gap-3">
            {[Share2, ThumbsUp, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-amber-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["Home", "#hero"],
                ["Today's Special", "#specials"],
                ["Menu", "#menu"],
                ["Combo Offers", "#combos"],
                ["Track Order", "#track"],
                ["Feedback", "#feedback"],
                ["About Us", "#about"],
                ["Contact", "#contact"],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="hover:text-orange-400 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Visit Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span>123, MG Road, Bangalore, Karnataka - 560001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>11:00 AM – 11:00 PM (All days)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-800 pt-6 text-center text-xs text-amber-500">
          © {new Date().getFullYear()} Spice Garden. All rights reserved. Made with ❤️ in India.
        </div>
      </div>
    </footer>
  );
}
