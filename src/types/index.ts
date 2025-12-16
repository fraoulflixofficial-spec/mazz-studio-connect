export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  menuCategory: string;
  featuredCategory: string;
  buttonText: string;
  buttonUrl: string;
  description?: string;
  colors?: string[];
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
}

export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  notes?: string;
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
  image: string;
  comboPrice: number;
  originalPrice?: number;
  stock: number;
  createdAt: number;
  colors?: string[];
}

export interface OfferCartItem {
  offer: Offer;
  qty: number;
}

