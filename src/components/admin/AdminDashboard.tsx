import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Product, SliderItem, Order, Offer, FEATURED_CATEGORIES } from '@/types';
import {
  subscribeToProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  subscribeToSlider,
  addSliderItem,
  updateSliderItem,
  deleteSliderItem,
  subscribeToOrders,
  updateOrderStatus,
  deleteOrder,
  subscribeToOffers,
  addOffer,
  updateOffer,
  deleteOffer,
} from '@/lib/database';
import { formatPrice, isYouTubeUrl } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';
import {
  LogOut,
  Package,
  Image,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  Check,
  Clock,
  Truck,
  Gift,
} from 'lucide-react';

type Tab = 'products' | 'slider' | 'orders' | 'offers';

export function AdminDashboard() {
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    price: number;
    images: string[];
    stock: number;
    menuCategory: string;
    featuredCategory: string;
    buttonText: string;
    buttonUrl: string;
    description: string;
    colors: string;
  }>({
    name: '',
    price: 0,
    images: ['', '', ''],
    stock: 0,
    menuCategory: '',
    featuredCategory: FEATURED_CATEGORIES[0],
    buttonText: 'Buy Now',
    buttonUrl: '',
    description: '',
    colors: '',
  });

  // Slider Modal State
  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null);
  const [sliderForm, setSliderForm] = useState({
    mediaUrl: '',
    type: 'image' as 'image' | 'video',
    redirectUrl: '',
  });

  // Offer Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState<{
    title: string;
    description: string;
    images: string[];
    comboPrice: number;
    originalPrice: number;
    stock: number;
    colors: string;
  }>({
    title: '',
    description: '',
    images: ['', '', ''],
    comboPrice: 0,
    originalPrice: 0,
    stock: 0,
    colors: '',
  });

  useEffect(() => {
    const unsub1 = subscribeToProducts(setProducts);
    const unsub2 = subscribeToSlider(setSliderItems);
    const unsub3 = subscribeToOrders(setOrders);
    const unsub4 = subscribeToOffers(setOffers);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Logged out', description: 'You have been logged out.' });
  };

  // Product handlers
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: product.price,
        images: [...product.images, '', ''].slice(0, 3),
        stock: product.stock,
        menuCategory: product.menuCategory,
        featuredCategory: product.featuredCategory,
        buttonText: product.buttonText,
        buttonUrl: product.buttonUrl,
        description: product.description || '',
        colors: product.colors?.join(', ') || '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: 0,
        images: ['', '', ''],
        stock: 0,
        menuCategory: '',
        featuredCategory: FEATURED_CATEGORIES[0],
        buttonText: 'Buy Now',
        buttonUrl: '',
        description: '',
        colors: '',
      });
    }
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: productForm.name,
      price: productForm.price,
      images: productForm.images.filter((img) => img.trim()),
      stock: productForm.stock,
      menuCategory: productForm.menuCategory,
      featuredCategory: productForm.featuredCategory,
      buttonText: productForm.buttonText,
      buttonUrl: productForm.buttonUrl,
      description: productForm.description,
      colors: productForm.colors.split(',').map((c) => c.trim()).filter(Boolean),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast({ title: 'Product Updated' });
      } else {
        await addProduct(data);
        toast({ title: 'Product Added' });
      }
      setProductModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast({ title: 'Product Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  // Slider handlers
  const openSliderModal = (item?: SliderItem) => {
    if (item) {
      setEditingSlider(item);
      setSliderForm({
        mediaUrl: item.mediaUrl,
        type: item.type,
        redirectUrl: item.redirectUrl,
      });
    } else {
      setEditingSlider(null);
      setSliderForm({ mediaUrl: '', type: 'image', redirectUrl: '' });
    }
    setSliderModalOpen(true);
  };

  const handleSliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isVideo = sliderForm.type === 'video' || isYouTubeUrl(sliderForm.mediaUrl);
    const data = {
      mediaUrl: sliderForm.mediaUrl,
      type: isVideo ? 'video' as const : 'image' as const,
      redirectUrl: sliderForm.redirectUrl,
    };

    try {
      if (editingSlider) {
        await updateSliderItem(editingSlider.id, data);
        toast({ title: 'Slider Updated' });
      } else {
        await addSliderItem(data);
        toast({ title: 'Slide Added' });
      }
      setSliderModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await deleteSliderItem(id);
      toast({ title: 'Slide Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  // Order handlers
  const handleConfirmOrder = async (id: string) => {
    try {
      await updateOrderStatus(id, 'confirmed');
      toast({ title: 'Order Confirmed' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    try {
      await deleteOrder(id);
      toast({ title: 'Order Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  // Offer handlers
  const openOfferModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({
        title: offer.title,
        description: offer.description,
        images: [...offer.images, '', ''].slice(0, 3),
        comboPrice: offer.comboPrice,
        originalPrice: offer.originalPrice || 0,
        stock: offer.stock,
        colors: offer.colors?.join(', ') || '',
      });
    } else {
      setEditingOffer(null);
      setOfferForm({
        title: '',
        description: '',
        images: ['', '', ''],
        comboPrice: 0,
        originalPrice: 0,
        stock: 0,
        colors: '',
      });
    }
    setOfferModalOpen(true);
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: offerForm.title,
      description: offerForm.description,
      images: offerForm.images.filter((img) => img.trim()),
      comboPrice: offerForm.comboPrice,
      originalPrice: offerForm.originalPrice,
      stock: offerForm.stock,
      createdAt: editingOffer?.createdAt || Date.now(),
      colors: offerForm.colors.split(',').map((c) => c.trim()).filter(Boolean),
    };

    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, data);
        toast({ title: 'Offer Updated' });
      } else {
        await addOffer(data);
        toast({ title: 'Offer Added' });
      }
      setOfferModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await deleteOffer(id);
      toast({ title: 'Offer Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOffers = offers.filter((o) =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-display text-xl">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'products', label: 'Products', icon: Package },
            { id: 'slider', label: 'Slider', icon: Image },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'offers', label: 'Offer Box', icon: Gift },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'orders' && orders.filter(o => o.status === 'placed').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">
                  {orders.filter(o => o.status === 'placed').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <button
                onClick={() => openProductModal()}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            <div className="grid gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
                >
                  <img
                    src={product.images[0] || '/placeholder.svg'}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.price)} • Stock: {product.stock}
                    </p>
                    <p className="text-xs text-accent">{product.featuredCategory}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openProductModal(product)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slider Tab */}
        {activeTab === 'slider' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openSliderModal()}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Slide
              </button>
            </div>

            <div className="grid gap-3">
              {sliderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
                >
                  {item.type === 'video' || isYouTubeUrl(item.mediaUrl) ? (
                    <div className="w-24 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Video</span>
                    </div>
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt=""
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.mediaUrl}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Redirect: {item.redirectUrl || 'None'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openSliderModal(item)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlider(item.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="grid gap-4">
            {sortedOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No orders yet</div>
            ) : (
              sortedOrders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.customerName}</span>
                        {order.status === 'placed' && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Placed
                          </span>
                        )}
                        {order.status === 'confirmed' && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Confirmed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{order.phone}</p>
                      <p className="text-sm text-muted-foreground">{order.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">{formatPrice(order.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.productName} x{item.qty}</span>
                        <span className="text-muted-foreground">{formatPrice(item.price * item.qty)}</span>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Note: {order.notes}
                      </p>
                    )}
                  </div>
                  <div className="p-4 bg-muted/30 flex gap-2 justify-end">
                    {order.status === 'placed' && (
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Confirm
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <button
                onClick={() => openOfferModal()}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Offer
              </button>
            </div>

            <div className="grid gap-3">
              {filteredOffers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No offers yet. Add your first offer!</p>
                </div>
              ) : (
                filteredOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
                  >
                    <img
                      src={offer.images?.[0] || '/placeholder.svg'}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{offer.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{offer.description}</p>
                      <p className="text-sm text-accent font-semibold">
                        {formatPrice(offer.comboPrice)}
                        {offer.originalPrice && offer.originalPrice > offer.comboPrice && (
                          <span className="ml-2 text-muted-foreground line-through text-xs">
                            {formatPrice(offer.originalPrice)}
                          </span>
                        )}
                        <span className="ml-2 text-xs text-muted-foreground">• Stock: {offer.stock}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openOfferModal(offer)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {productModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setProductModalOpen(false)}
        >
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-xl">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setProductModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (৳) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URLs (up to 3)</label>
                {productForm.images.map((img, idx) => (
                  <input
                    key={idx}
                    type="url"
                    value={img}
                    onChange={(e) => {
                      const newImages = [...productForm.images];
                      newImages[idx] = e.target.value;
                      setProductForm({ ...productForm, images: newImages });
                    }}
                    placeholder={`Image ${idx + 1} URL`}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Featured Category *</label>
                <select
                  value={productForm.featuredCategory}
                  onChange={(e) => setProductForm({ ...productForm, featuredCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  {FEATURED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Menu Category</label>
                <input
                  type="text"
                  value={productForm.menuCategory}
                  onChange={(e) => setProductForm({ ...productForm, menuCategory: e.target.value })}
                  placeholder="e.g., Audio, Wearables"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Colors (comma separated)</label>
                <input
                  type="text"
                  value={productForm.colors}
                  onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                  placeholder="Black, White, Gold"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Button Text</label>
                  <input
                    type="text"
                    value={productForm.buttonText}
                    onChange={(e) => setProductForm({ ...productForm, buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button URL</label>
                  <input
                    type="url"
                    value={productForm.buttonUrl}
                    onChange={(e) => setProductForm({ ...productForm, buttonUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slider Modal */}
      {sliderModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setSliderModalOpen(false)}
        >
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-xl">
                {editingSlider ? 'Edit Slide' : 'Add Slide'}
              </h2>
              <button onClick={() => setSliderModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSliderSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Media URL *</label>
                <input
                  type="url"
                  value={sliderForm.mediaUrl}
                  onChange={(e) => setSliderForm({ ...sliderForm, mediaUrl: e.target.value })}
                  placeholder="Image URL or YouTube link"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports image URLs and YouTube links
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={sliderForm.type}
                  onChange={(e) => setSliderForm({ ...sliderForm, type: e.target.value as 'image' | 'video' })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Redirect URL (Optional)</label>
                <input
                  type="url"
                  value={sliderForm.redirectUrl}
                  onChange={(e) => setSliderForm({ ...sliderForm, redirectUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingSlider ? 'Update Slide' : 'Add Slide'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {offerModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setOfferModalOpen(false)}
        >
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-xl">
                {editingOffer ? 'Edit Offer' : 'Add Offer'}
              </h2>
              <button onClick={() => setOfferModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleOfferSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Offer Title *</label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URLs (up to 3)</label>
                {offerForm.images.map((img, idx) => (
                  <input
                    key={idx}
                    type="url"
                    value={img}
                    onChange={(e) => {
                      const newImages = [...offerForm.images];
                      newImages[idx] = e.target.value;
                      setOfferForm({ ...offerForm, images: newImages });
                    }}
                    placeholder={`Image ${idx + 1} URL${idx === 0 ? ' *' : ''}`}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required={idx === 0}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Combo Price (৳) *</label>
                  <input
                    type="number"
                    value={offerForm.comboPrice}
                    onChange={(e) => setOfferForm({ ...offerForm, comboPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Original Price (৳)</label>
                  <input
                    type="number"
                    value={offerForm.originalPrice}
                    onChange={(e) => setOfferForm({ ...offerForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input
                  type="number"
                  value={offerForm.stock}
                  onChange={(e) => setOfferForm({ ...offerForm, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Colors (comma separated)</label>
                <input
                  type="text"
                  value={offerForm.colors}
                  onChange={(e) => setOfferForm({ ...offerForm, colors: e.target.value })}
                  placeholder="Black, White, Gold"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingOffer ? 'Update Offer' : 'Add Offer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
