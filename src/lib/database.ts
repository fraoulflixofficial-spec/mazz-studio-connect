import { supabase } from '@/integrations/supabase/client';
import { Product, SliderItem, Order, Offer, CustomOrder } from '@/types';

// Type helper for Supabase queries (tables may not be in generated types yet)
const db = supabase as any;

// ============================================
// IMAGE UPLOAD HELPER
// ============================================
export const uploadImage = async (file: File, bucket: string = 'product-images'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteImage = async (url: string, bucket: string = 'product-images'): Promise<void> => {
  // Extract file path from URL
  const urlParts = url.split(`/${bucket}/`);
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];
  await supabase.storage.from(bucket).remove([filePath]);
};

// ============================================
// PRODUCTS
// ============================================
const mapDbProductToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  images: row.images || [],
  stock: row.stock,
  sold: row.sold || 0,
  menuCategory: row.menu_category,
  featuredCategory: row.featured_category,
  buttonText: row.button_text || 'Buy Now',
  buttonUrl: row.button_url || '',
  description: row.description || '',
  colors: row.colors || [],
  productGroup: row.product_group,
  brand: row.brand,
  warranty: row.warranty,
  couponCodes: row.coupon_codes,
});

const mapProductToDb = (product: Omit<Product, 'id'>) => ({
  name: product.name,
  price: product.price,
  images: product.images,
  stock: product.stock,
  sold: product.sold || 0,
  menu_category: product.menuCategory,
  featured_category: product.featuredCategory,
  button_text: product.buttonText,
  button_url: product.buttonUrl,
  description: product.description || '',
  colors: product.colors || [],
  product_group: product.productGroup || null,
  brand: product.brand || null,
  warranty: product.warranty || null,
  coupon_codes: product.couponCodes || null,
});

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(mapDbProductToProduct);
};

export const subscribeToProducts = (callback: (products: Product[]) => void): (() => void) => {
  // Initial fetch
  getProducts().then(callback);

  // Subscribe to realtime updates
  const channel = supabase
    .channel('products-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      () => {
        getProducts().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('products')
    .insert(mapProductToDb(product))
    .select('id')
    .single();

  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }

  return data.id;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  const updates: Record<string, any> = {};
  
  if (product.name !== undefined) updates.name = product.name;
  if (product.price !== undefined) updates.price = product.price;
  if (product.images !== undefined) updates.images = product.images;
  if (product.stock !== undefined) updates.stock = product.stock;
  if (product.sold !== undefined) updates.sold = product.sold;
  if (product.menuCategory !== undefined) updates.menu_category = product.menuCategory;
  if (product.featuredCategory !== undefined) updates.featured_category = product.featuredCategory;
  if (product.buttonText !== undefined) updates.button_text = product.buttonText;
  if (product.buttonUrl !== undefined) updates.button_url = product.buttonUrl;
  if (product.description !== undefined) updates.description = product.description;
  if (product.colors !== undefined) updates.colors = product.colors;
  if (product.productGroup !== undefined) updates.product_group = product.productGroup || null;
  if (product.brand !== undefined) updates.brand = product.brand || null;
  if (product.warranty !== undefined) updates.warranty = product.warranty || null;
  if (product.couponCodes !== undefined) updates.coupon_codes = product.couponCodes || null;

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const decrementStock = async (productId: string, qty: number): Promise<void> => {
  // Get current values
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock, sold')
    .eq('id', productId)
    .maybeSingle();

  if (fetchError || !product) {
    console.error('Error fetching product for stock update:', fetchError);
    return;
  }

  const newStock = Math.max(0, product.stock - qty);
  const newSold = (product.sold || 0) + qty;

  const { error } = await supabase
    .from('products')
    .update({ stock: newStock, sold: newSold })
    .eq('id', productId);

  if (error) {
    console.error('Error updating stock:', error);
  }
};

// ============================================
// SLIDER ITEMS
// ============================================
const mapDbSliderToSlider = (row: any): SliderItem => ({
  id: row.id,
  mediaUrl: row.media_url,
  type: row.type as 'image' | 'video',
  redirectUrl: row.redirect_url || '',
});

export const getSliderItems = async (): Promise<SliderItem[]> => {
  const { data, error } = await supabase
    .from('slider_items')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching slider items:', error);
    return [];
  }

  return (data || []).map(mapDbSliderToSlider);
};

export const subscribeToSlider = (callback: (items: SliderItem[]) => void): (() => void) => {
  getSliderItems().then(callback);

  const channel = supabase
    .channel('slider-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'slider_items' },
      () => {
        getSliderItems().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addSliderItem = async (item: Omit<SliderItem, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('slider_items')
    .insert({
      media_url: item.mediaUrl,
      type: item.type,
      redirect_url: item.redirectUrl,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding slider item:', error);
    throw error;
  }

  return data.id;
};

export const updateSliderItem = async (id: string, item: Partial<SliderItem>): Promise<void> => {
  const updates: Record<string, any> = {};
  if (item.mediaUrl !== undefined) updates.media_url = item.mediaUrl;
  if (item.type !== undefined) updates.type = item.type;
  if (item.redirectUrl !== undefined) updates.redirect_url = item.redirectUrl;

  const { error } = await supabase
    .from('slider_items')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating slider item:', error);
    throw error;
  }
};

export const deleteSliderItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('slider_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting slider item:', error);
    throw error;
  }
};

// ============================================
// ORDERS
// ============================================
const mapDbOrderToOrder = (row: any): Order => ({
  id: row.id,
  customerName: row.customer_name,
  phone: row.phone,
  address: row.address,
  items: row.items || [],
  total: Number(row.total),
  subtotal: Number(row.subtotal),
  deliveryCharge: Number(row.delivery_charge),
  deliveryZone: row.delivery_zone,
  status: row.status,
  createdAt: new Date(row.created_at).getTime(),
  notes: row.notes,
  appliedCoupon: row.applied_coupon,
});

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return (data || []).map(mapDbOrderToOrder);
};

export const subscribeToOrders = (callback: (orders: Order[]) => void): (() => void) => {
  getOrders().then(callback);

  const channel = supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => {
        getOrders().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const createOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items,
      total: order.total,
      subtotal: order.subtotal,
      delivery_charge: order.deliveryCharge,
      delivery_zone: order.deliveryZone,
      status: order.status,
      notes: order.notes || null,
      applied_coupon: order.appliedCoupon || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data.id;
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// ============================================
// OFFERS
// ============================================
const mapDbOfferToOffer = (row: any): Offer => ({
  id: row.id,
  title: row.title,
  description: row.description,
  images: row.images || [],
  comboPrice: Number(row.combo_price),
  originalPrice: row.original_price ? Number(row.original_price) : undefined,
  stock: row.stock,
  sold: row.sold || 0,
  createdAt: new Date(row.created_at).getTime(),
  colors: row.colors || [],
  warranty: row.warranty,
  couponCodes: row.coupon_codes,
});

export const getOffers = async (): Promise<Offer[]> => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offers:', error);
    return [];
  }

  return (data || []).map(mapDbOfferToOffer);
};

export const subscribeToOffers = (callback: (offers: Offer[]) => void): (() => void) => {
  getOffers().then(callback);

  const channel = supabase
    .channel('offers-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'offers' },
      () => {
        getOffers().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addOffer = async (offer: Omit<Offer, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      title: offer.title,
      description: offer.description,
      images: offer.images,
      combo_price: offer.comboPrice,
      original_price: offer.originalPrice || null,
      stock: offer.stock,
      sold: offer.sold || 0,
      colors: offer.colors || [],
      warranty: offer.warranty || null,
      coupon_codes: offer.couponCodes || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding offer:', error);
    throw error;
  }

  return data.id;
};

export const updateOffer = async (id: string, offer: Partial<Offer>): Promise<void> => {
  const updates: Record<string, any> = {};
  
  if (offer.title !== undefined) updates.title = offer.title;
  if (offer.description !== undefined) updates.description = offer.description;
  if (offer.images !== undefined) updates.images = offer.images;
  if (offer.comboPrice !== undefined) updates.combo_price = offer.comboPrice;
  if (offer.originalPrice !== undefined) updates.original_price = offer.originalPrice;
  if (offer.stock !== undefined) updates.stock = offer.stock;
  if (offer.sold !== undefined) updates.sold = offer.sold;
  if (offer.colors !== undefined) updates.colors = offer.colors;
  if (offer.warranty !== undefined) updates.warranty = offer.warranty || null;
  if (offer.couponCodes !== undefined) updates.coupon_codes = offer.couponCodes || null;

  const { error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

export const deleteOffer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

export const decrementOfferStock = async (offerId: string, qty: number): Promise<void> => {
  const { data: offer, error: fetchError } = await supabase
    .from('offers')
    .select('stock, sold')
    .eq('id', offerId)
    .maybeSingle();

  if (fetchError || !offer) {
    console.error('Error fetching offer for stock update:', fetchError);
    return;
  }

  const newStock = Math.max(0, offer.stock - qty);
  const newSold = (offer.sold || 0) + qty;

  const { error } = await supabase
    .from('offers')
    .update({ stock: newStock, sold: newSold })
    .eq('id', offerId);

  if (error) {
    console.error('Error updating offer stock:', error);
  }
};

// ============================================
// CUSTOM ORDERS
// ============================================
const mapDbCustomOrderToCustomOrder = (row: any): CustomOrder => ({
  id: row.id,
  customerName: row.customer_name,
  phone: row.phone,
  email: row.email,
  productName: row.product_name,
  productCategory: row.product_category,
  productDescription: row.product_description,
  referenceLink: row.reference_link,
  expectedBudget: Number(row.expected_budget),
  quantity: row.quantity,
  urgencyLevel: row.urgency_level,
  deliveryZone: row.delivery_zone,
  deliveryCharge: Number(row.delivery_charge),
  productImageUrl: row.product_image_url,
  additionalNotes: row.additional_notes,
  status: row.status,
  adminNotes: row.admin_notes,
  createdAt: new Date(row.created_at).getTime(),
});

export const getCustomOrders = async (): Promise<CustomOrder[]> => {
  const { data, error } = await supabase
    .from('custom_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching custom orders:', error);
    return [];
  }

  return (data || []).map(mapDbCustomOrderToCustomOrder);
};

export const subscribeToCustomOrders = (callback: (orders: CustomOrder[]) => void): (() => void) => {
  getCustomOrders().then(callback);

  const channel = supabase
    .channel('custom-orders-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'custom_orders' },
      () => {
        getCustomOrders().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const createCustomOrder = async (order: Omit<CustomOrder, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('custom_orders')
    .insert({
      customer_name: order.customerName,
      phone: order.phone,
      email: order.email || null,
      product_name: order.productName,
      product_category: order.productCategory,
      product_description: order.productDescription || null,
      reference_link: order.referenceLink || null,
      expected_budget: order.expectedBudget,
      quantity: order.quantity,
      urgency_level: order.urgencyLevel,
      delivery_zone: order.deliveryZone,
      delivery_charge: order.deliveryCharge,
      product_image_url: order.productImageUrl || null,
      additional_notes: order.additionalNotes || null,
      status: order.status,
      admin_notes: order.adminNotes || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating custom order:', error);
    throw error;
  }

  return data.id;
};

export const updateCustomOrder = async (id: string, updates: Partial<CustomOrder>): Promise<void> => {
  const dbUpdates: Record<string, any> = {};
  
  if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email || null;
  if (updates.productName !== undefined) dbUpdates.product_name = updates.productName;
  if (updates.productCategory !== undefined) dbUpdates.product_category = updates.productCategory;
  if (updates.productDescription !== undefined) dbUpdates.product_description = updates.productDescription || null;
  if (updates.referenceLink !== undefined) dbUpdates.reference_link = updates.referenceLink || null;
  if (updates.expectedBudget !== undefined) dbUpdates.expected_budget = updates.expectedBudget;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.urgencyLevel !== undefined) dbUpdates.urgency_level = updates.urgencyLevel;
  if (updates.deliveryZone !== undefined) dbUpdates.delivery_zone = updates.deliveryZone;
  if (updates.deliveryCharge !== undefined) dbUpdates.delivery_charge = updates.deliveryCharge;
  if (updates.productImageUrl !== undefined) dbUpdates.product_image_url = updates.productImageUrl || null;
  if (updates.additionalNotes !== undefined) dbUpdates.additional_notes = updates.additionalNotes || null;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.adminNotes !== undefined) dbUpdates.admin_notes = updates.adminNotes || null;

  const { error } = await supabase
    .from('custom_orders')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating custom order:', error);
    throw error;
  }
};

export const deleteCustomOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('custom_orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting custom order:', error);
    throw error;
  }
};

// ============================================
// SETTINGS
// ============================================
export const getSetting = async (key: string): Promise<any> => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('id', key)
    .maybeSingle();

  if (error) {
    console.error('Error fetching setting:', error);
    return null;
  }

  return data?.value || null;
};

export const setSetting = async (key: string, value: any): Promise<void> => {
  const { error } = await supabase
    .from('settings')
    .upsert({ id: key, value }, { onConflict: 'id' });

  if (error) {
    console.error('Error setting value:', error);
    throw error;
  }
};

export const subscribeToSetting = (key: string, callback: (value: any) => void): (() => void) => {
  getSetting(key).then(callback);

  const channel = supabase
    .channel(`settings-${key}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'settings', filter: `id=eq.${key}` },
      (payload) => {
        callback((payload.new as any)?.value || null);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
