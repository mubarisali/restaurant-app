export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  calories: number;
  isVeg: boolean;
  isBestseller: boolean;
  isSpicy: boolean;
  subcategory?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: "veg" | "nonveg";
  subcategories: string[];
  items: MenuItem[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  categoryId: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  rating: number;
  totalReviews: number;
  openTime: string;
  closeTime: string;
}


export interface SpecialItem extends MenuItem {
  category: string;
  originalPrice: number;
  discount: number;
}

export interface TodaysSpecials {
  day: string;
  items: SpecialItem[];
}

export interface Meal extends MenuItem {
  includes: string[];
  timing: string;
}

export interface Combo extends MenuItem {
  includes: string[];
  originalPrice: number;
  tag: string;
}

export interface Review {
  id: number;
  itemId: number | null;
  itemName: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
}

export interface ReviewList extends ReviewSummary {
  reviews: Review[];
}

/** Minimal info needed to open the reviews panel for a dish */
export interface ReviewTarget {
  id: number;
  name: string;
  image: string;
}

export type OrderType = "dine-in" | "takeaway" | "delivery";

export interface OrderLine {
  id: number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  orderId: string;
  customerName: string;
  phone: string;
  orderType: OrderType;
  address: string | null;
  tableNumber: string | null;
  notes: string | null;
  items: OrderLine[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  estimatedMinutes: number;
  createdAt: string;
  estimatedReadyAt: string;
  status: string;
  steps: string[];
}

export interface OrderRequest {
  customerName: string;
  phone: string;
  orderType: OrderType;
  address?: string;
  tableNumber?: string;
  notes?: string;
  items: { id: number; quantity: number }[];
}
