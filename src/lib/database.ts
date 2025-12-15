import { ref, get, set, push, remove, update, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Product, SliderItem, Order, Offer } from '@/types';

// Products
export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await get(ref(database, 'products'));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, product]) => ({
    id,
    ...(product as Omit<Product, 'id'>),
  }));
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const productsRef = ref(database, 'products');
  return onValue(productsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const products = Object.entries(data).map(([id, product]) => ({
      id,
      ...(product as Omit<Product, 'id'>),
    }));
    callback(products);
  });
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  const newRef = push(ref(database, 'products'));
  await set(newRef, product);
  return newRef.key!;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  await update(ref(database, `products/${id}`), product);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await remove(ref(database, `products/${id}`));
};

// Slider
export const getSliderItems = async (): Promise<SliderItem[]> => {
  const snapshot = await get(ref(database, 'slider'));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, item]) => ({
    id,
    ...(item as Omit<SliderItem, 'id'>),
  }));
};

export const subscribeToSlider = (callback: (items: SliderItem[]) => void) => {
  const sliderRef = ref(database, 'slider');
  return onValue(sliderRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const items = Object.entries(data).map(([id, item]) => ({
      id,
      ...(item as Omit<SliderItem, 'id'>),
    }));
    callback(items);
  });
};

export const addSliderItem = async (item: Omit<SliderItem, 'id'>): Promise<string> => {
  const newRef = push(ref(database, 'slider'));
  await set(newRef, item);
  return newRef.key!;
};

export const updateSliderItem = async (id: string, item: Partial<SliderItem>): Promise<void> => {
  await update(ref(database, `slider/${id}`), item);
};

export const deleteSliderItem = async (id: string): Promise<void> => {
  await remove(ref(database, `slider/${id}`));
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const snapshot = await get(ref(database, 'orders'));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, order]) => ({
    id,
    ...(order as Omit<Order, 'id'>),
  }));
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const ordersRef = ref(database, 'orders');
  return onValue(ordersRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const orders = Object.entries(data).map(([id, order]) => ({
      id,
      ...(order as Omit<Order, 'id'>),
    }));
    callback(orders);
  });
};

export const createOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
  const newRef = push(ref(database, 'orders'));
  await set(newRef, order);
  return newRef.key!;
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
  await update(ref(database, `orders/${id}`), { status });
};

export const deleteOrder = async (id: string): Promise<void> => {
  await remove(ref(database, `orders/${id}`));
};

// Update stock after order
export const decrementStock = async (productId: string, qty: number): Promise<void> => {
  const snapshot = await get(ref(database, `products/${productId}/stock`));
  if (snapshot.exists()) {
    const currentStock = snapshot.val();
    await update(ref(database, `products/${productId}`), {
      stock: Math.max(0, currentStock - qty),
    });
  }
};

// Offers
export const getOffers = async (): Promise<Offer[]> => {
  const snapshot = await get(ref(database, 'offers'));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, offer]) => ({
    id,
    ...(offer as Omit<Offer, 'id'>),
  }));
};

export const subscribeToOffers = (callback: (offers: Offer[]) => void) => {
  const offersRef = ref(database, 'offers');
  return onValue(offersRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const offers = Object.entries(data).map(([id, offer]) => ({
      id,
      ...(offer as Omit<Offer, 'id'>),
    }));
    callback(offers);
  });
};

export const addOffer = async (offer: Omit<Offer, 'id'>): Promise<string> => {
  const newRef = push(ref(database, 'offers'));
  await set(newRef, offer);
  return newRef.key!;
};

export const updateOffer = async (id: string, offer: Partial<Offer>): Promise<void> => {
  await update(ref(database, `offers/${id}`), offer);
};

export const deleteOffer = async (id: string): Promise<void> => {
  await remove(ref(database, `offers/${id}`));
};

export const decrementOfferStock = async (offerId: string, qty: number): Promise<void> => {
  const snapshot = await get(ref(database, `offers/${offerId}/stock`));
  if (snapshot.exists()) {
    const currentStock = snapshot.val();
    await update(ref(database, `offers/${offerId}`), {
      stock: Math.max(0, currentStock - qty),
    });
  }
};
