import {
  fetchMenu,
  fetchRestaurant,
  fetchBestsellers,
  fetchSpecials,
  fetchMeals,
  fetchCombos,
} from "@/lib/api";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import Bestsellers from "@/components/Bestsellers";
import { TodaysSpecial, Meals, Combos } from "@/components/Offers";
import { FeedbackSection } from "@/components/Feedback";
import { OrderTracker } from "@/components/Order";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { Category } from "@/types";
import { SITE_URL } from "@/lib/site";

export default async function Home() {
  const [restaurant, menu, bestsellers, specials, meals, combos] = await Promise.all([
    fetchRestaurant(),
    fetchMenu(),
    fetchBestsellers(),
    fetchSpecials(),
    fetchMeals(),
    fetchCombos(),
  ]);

  // Structured data so search engines understand the restaurant (address, cuisine, hours, menu)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.tagline,
    url: SITE_URL,
    telephone: restaurant.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "123, MG Road",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      postalCode: "560001",
      addressCountry: "IN",
    },
    servesCuisine: ["Indian", "Kerala", "Malabar", "Arabian", "North Indian", "South Indian"],
    priceRange: "₹₹",
    acceptsReservations: true,
    openingHours: "Mo-Su 11:00-23:00",
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: menu.map((cat: Category) => ({
        "@type": "MenuSection",
        name: cat.name,
        hasMenuItem: cat.items.map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.description,
          suitableForDiet: item.isVeg ? "https://schema.org/VegetarianDiet" : undefined,
          offers: { "@type": "Offer", price: item.price, priceCurrency: "INR" },
        })),
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero info={restaurant} />
      <TodaysSpecial specials={specials} />
      <MenuSection categories={menu} />
      <Combos combos={combos} />
      <Meals meals={meals} />
      <Bestsellers items={bestsellers} />
      <OrderTracker />
      <FeedbackSection
        categories={menu}
        extras={[
          { label: "🍱 Meals", items: meals },
          { label: "🎉 Combos", items: combos },
        ]}
      />
      <About />
      <Footer />
    </>
  );
}
