// Coupon codes structure for products/offers
export interface CouponCodes {
  insideDhakaCode?: string;
  outsideDhakaCode?: string;
  priceReductionCode?: string;
  priceReductionAmount?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  sold?: number;
  menuCategory: string;
  featuredCategory: string;
  buttonText: string;
  buttonUrl: string;
  description?: string;
  colors?: string[];
  productGroup?: string;
  brand?: string;
  warranty?: string;
  couponCodes?: CouponCodes;
}

export const FEATURED_CATEGORIES = [
  'Earbuds',
  'Headphones',
  'Smart Watch',
  'Speakers',
  'Watches',
  'Mobile Phones',
  'Mobile Accessories',
  'Gaming Consoles',
  'Controllers',
  'Camera'
] as const;

export type FeaturedCategory = typeof FEATURED_CATEGORIES[number];

export interface SliderItem {
  id: string;
  mediaUrl: string;
  type: 'image' | 'video';
  redirectUrl: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
  warranty?: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

// Applied coupon information stored with order
export interface AppliedCoupon {
  code: string;
  type: 'free_delivery_inside' | 'free_delivery_outside' | 'price_reduction';
  discountAmount: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  deliveryCharge: number;
  deliveryZone: DeliveryZone;
  status: OrderStatus;
  createdAt: number;
  notes?: string;
  appliedCoupon?: AppliedCoupon;
}

export interface CartItem {
  product: Product;
  qty: number;
  selectedColor?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  images: string[];
  comboPrice: number;
  originalPrice?: number;
  stock: number;
  sold?: number;
  createdAt: number;
  colors?: string[];
  warranty?: string;
  couponCodes?: CouponCodes;
}

export interface OfferCartItem {
  offer: Offer;
  qty: number;
}

// Analytics types
export interface VisitorRecord {
  visitorId: string;
  timestamp: number;
  date: string; // YYYY-MM-DD format
}

export interface ProductViewRecord {
  productId: string;
  visitorId: string;
  timestamp: number;
  date: string; // YYYY-MM-DD format
}

export interface AnalyticsData {
  visitors: {
    today: number;
    lastWeek: number;
    currentMonth: number;
    lastMonth: number;
  };
  productViews: {
    today: number;
    lastWeek: number;
    currentMonth: number;
    lastMonth: number;
  };
  mostViewedProduct: string | null; // productId
  sales: {
    today: number;
    lastWeek: number;
    currentMonth: number;
    lastMonth: number;
  };
  revenue: {
    today: number;
    lastWeek: number;
    currentMonth: number;
    lastMonth: number;
  };
  topSoldProducts: string[]; // productIds (top 5)
}

