import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { FeedbackProvider } from "@/context/FeedbackContext";
import { ReviewModal } from "@/components/Feedback";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";

const description =
  "Spice Garden, MG Road Bangalore — order Chicken Biryani, Arabian Mandhi, Kerala Parotta & roasts, fish fry, curries and veg thali online. Today's specials, combo offers, lunch meals, home delivery, takeaway & dine-in.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Spice Garden | Best Biryani, Mandhi & Kerala Food in Bangalore",
    template: "%s | Spice Garden",
  },
  description,
  keywords: [
    "Spice Garden",
    "restaurant in Bangalore",
    "restaurant near MG Road",
    "best biryani in Bangalore",
    "chicken biryani",
    "mutton biryani",
    "Malabar biryani",
    "Hyderabadi biryani",
    "chicken mandhi",
    "Arabian mandhi",
    "Al Faham mandhi",
    "Kerala food Bangalore",
    "Kerala parotta",
    "chicken roast",
    "fish fry",
    "Kerala fish curry",
    "prawn roast",
    "butter chicken",
    "paneer butter masala",
    "veg biryani",
    "veg meals",
    "Kerala meals",
    "North Indian thali",
    "lunch meals",
    "combo offers",
    "family combo",
    "today's special",
    "order food online",
    "home delivery",
    "takeaway",
    "dine-in",
    "Indian restaurant",
    "non-veg restaurant",
    "pure veg options",
  ],
  applicationName: "Spice Garden",
  category: "restaurant",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Spice Garden",
    title: "Spice Garden | Biryani, Mandhi & Kerala Food — Order Online",
    description,
    images: [{ url: "/images/mandhi.jpg", width: 960, height: 589, alt: "Chicken Mandhi platter at Spice Garden" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spice Garden | Biryani, Mandhi & Kerala Food",
    description,
    images: ["/images/mandhi.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#78350f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) inject attributes on <body> before hydration */}
      <body className="font-poppins bg-amber-50" suppressHydrationWarning>
        <CartProvider>
          <FeedbackProvider>
            <Navbar />
            <CartDrawer />
            <ReviewModal />
            <SmoothScroll />
            <main>{children}</main>
          </FeedbackProvider>
        </CartProvider>
      </body>
    </html>
  );
}
