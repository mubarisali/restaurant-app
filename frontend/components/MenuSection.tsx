"use client";
import { useState } from "react";
import { Category, MenuItem } from "@/types";
import MenuCard from "./MenuCard";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  categories: Category[];
}

type Diet = "all" | "veg" | "nonveg";

const SUB_ICONS: Record<string, string> = {
  Biryani: "🍛",
  Mandhi: "🫕",
  Rice: "🍚",
  Fry: "🍤",
  Curry: "🥘",
  Roast: "🔥",
  Breads: "🫓",
  Desserts: "🍮",
  Drinks: "🥤",
};

const SUB_ORDER = Object.keys(SUB_ICONS);

const DIETS: { id: Diet; label: string; dot?: string }[] = [
  { id: "all", label: "All" },
  { id: "veg", label: "Veg", dot: "bg-green-500" },
  { id: "nonveg", label: "Non-Veg", dot: "bg-red-600" },
];

const pill = (active: boolean) =>
  `px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 ${
    active
      ? "bg-orange-500 text-white shadow-md shadow-orange-200"
      : "bg-white text-amber-700 border border-amber-200 hover:border-orange-300"
  }`;

export default function MenuSection({ categories }: Props) {
  const [diet, setDiet] = useState<Diet>("all");
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? "all");
  const [activeSub, setActiveSub] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const matchesDiet = (item: MenuItem) =>
    diet === "all" || (diet === "veg" ? item.isVeg : !item.isVeg);

  // Categories that still have dishes under the chosen diet
  const dietCategories = categories
    .map((cat) => ({ ...cat, items: cat.items.filter(matchesDiet) }))
    .filter((cat) => cat.items.length > 0);

  const visibleCategories = dietCategories.filter(
    (c) => activeCategory === "all" || c.id === activeCategory
  );

  const subOptions = SUB_ORDER.filter((sub) =>
    visibleCategories.some((c) => c.items.some((i) => i.subcategory === sub))
  );

  // If the user has scrolled down the list, bring them back to the top of the results
  const jumpToResults = () => {
    // A fixed marker just above the results, so the measurement isn't affected by the list re-rendering
    const marker = document.getElementById("menu-results");
    const pinnedBar = document.querySelector<HTMLElement>("#menu .sticky");
    if (!marker || !pinnedBar) return;
    const covered = 64 + pinnedBar.offsetHeight; // navbar + pinned filters
    const listTop = marker.getBoundingClientRect().top;
    if (listTop < covered) {
      window.scrollTo({ top: listTop + window.scrollY - covered - 16, behavior: "instant" });
    }
  };

  const changeDiet = (d: Diet) => {
    setDiet(d);
    // Keep the current category if it still has dishes for this diet
    const stillHasItems = categories.some(
      (c) => c.id === activeCategory && c.items.some((i) => d === "all" || (d === "veg" ? i.isVeg : !i.isVeg))
    );
    if (!stillHasItems) setActiveCategory("all");
    setActiveSub("all");
    jumpToResults();
  };

  const changeCategory = (id: string) => {
    setActiveCategory(id);
    setActiveSub("all");
    jumpToResults();
  };

  const changeSub = (sub: string) => {
    setActiveSub(sub);
    jumpToResults();
  };

  const q = search.toLowerCase();
  const filtered = visibleCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          (activeSub === "all" || item.subcategory === activeSub) &&
          (item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q))
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  const groupBySub = (items: MenuItem[]) =>
    SUB_ORDER.map((sub) => ({
      sub,
      items: items.filter((i) => i.subcategory === sub),
    })).filter((g) => g.items.length > 0);

  return (
    <section id="menu" className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1 rounded-full mb-3">
          Our Menu
        </span>
        <h2 className="font-playfair text-4xl md:text-5xl font-bold text-amber-900 mb-3">
          Explore Our Dishes
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Pick Veg or Non-Veg, choose a category, then browse by Biryani, Mandhi, Rice, Fry, Curry or Roast.
        </p>
      </motion.div>

      {/* Filters — pinned under the navbar while browsing the menu */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-2 md:py-3 mb-8 bg-amber-50/95 backdrop-blur-md border-b border-amber-200/60 space-y-2 md:space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3">
          <input
            type="text"
            placeholder="🔍 Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs px-4 md:px-5 py-1.5 md:py-2 text-sm md:text-base rounded-full border-2 border-amber-200 bg-white focus:outline-none focus:border-orange-400 text-amber-900 placeholder-amber-300 shadow-sm transition-colors"
          />
          {/* Veg / Non-Veg toggle */}
          <div className="inline-flex shrink-0 bg-white border border-amber-200 rounded-full p-1 shadow-sm">
            {DIETS.map((d) => (
              <button
                key={d.id}
                onClick={() => changeDiet(d.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  diet === d.id
                    ? d.id === "veg"
                      ? "bg-green-600 text-white"
                      : d.id === "nonveg"
                      ? "bg-red-600 text-white"
                      : "bg-amber-900 text-white"
                    : "text-amber-800 hover:bg-amber-50"
                }`}
              >
                {d.dot && (
                  <span className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center bg-white">
                    <span className={`w-2 h-2 rounded-full ${d.dot}`} />
                  </span>
                )}
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap md:justify-center">
          <button onClick={() => changeCategory("all")} className={`shrink-0 ${pill(activeCategory === "all")}`}>
            🍽️ All
          </button>
          {dietCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => changeCategory(cat.id)}
              className={`shrink-0 ${pill(activeCategory === cat.id)}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Sub-category chips (Biryani, Mandhi, Rice, Fry, Curry, Roast…) */}
        {subOptions.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap md:justify-center">
            <button
              onClick={() => changeSub("all")}
              className={`shrink-0 px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium transition-all ${
                activeSub === "all" ? "bg-amber-900 text-white" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
              }`}
            >
              All {activeCategory !== "all" && dietCategories.find((c) => c.id === activeCategory)?.name}
            </button>
            {subOptions.map((sub) => (
              <button
                key={sub}
                onClick={() => changeSub(sub)}
                className={`shrink-0 px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium transition-all ${
                  activeSub === sub ? "bg-amber-900 text-white" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                }`}
              >
                {SUB_ICONS[sub]} {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      <div id="menu-results" />
      {/* Menu Categories */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 text-amber-400"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-lg font-medium">
              {search ? <>No dishes found for &quot;{search}&quot;</> : "No dishes match these filters"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`${diet}-${activeCategory}-${activeSub}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="menu-list"
            className="space-y-10"
          >
            {filtered.map((cat) => {
              const groups = groupBySub(cat.items);
              // Breads / Desserts / Drinks have a single group named like the category
              const showSubHeaders = !(groups.length === 1 && groups[0].sub === cat.name);
              return (
                <div key={cat.id}>
                  {/* Category Header */}
                  <motion.button
                    onClick={() => toggleCat(cat.id)}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 mb-6 w-full text-left group"
                  >
                    <span className="text-4xl">{cat.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-playfair text-2xl font-bold text-amber-900 group-hover:text-orange-600 transition-colors">
                        {cat.name}
                        <span
                          className={`ml-3 align-middle text-xs font-poppins font-semibold px-2 py-0.5 rounded-full ${
                            cat.type === "veg" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {cat.type === "veg" ? "Veg" : "Non-Veg"}
                        </span>
                      </h3>
                      <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full mt-1" />
                    </div>
                    <span className="text-amber-400">
                      {expandedCats.has(cat.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {expandedCats.has(cat.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden space-y-6"
                      >
                        {groups.map((g) => (
                          <div key={g.sub}>
                            {showSubHeaders && (
                              <h4 className="flex items-center gap-2 text-lg font-semibold text-orange-700 mb-4 pl-1">
                                <span>{SUB_ICONS[g.sub]}</span>
                                {cat.name} {g.sub}
                                <span className="text-sm font-normal text-amber-500">({g.items.length})</span>
                              </h4>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {g.items.map((item, idx) => (
                                <MenuCard
                                  key={item.id}
                                  item={item}
                                  categoryId={cat.id}
                                  index={idx}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
