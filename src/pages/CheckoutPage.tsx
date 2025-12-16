import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/user/Header';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/helpers';
import { createOrder, decrementStock } from '@/lib/database';
import { Trash2, Minus, Plus, MapPin, Phone, User, FileText, CheckCircle2, Copy, Package, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DeliveryZone } from '@/types';

const DELIVERY_CHARGES = {
  inside_dhaka: 80,
  outside_dhaka: 100,
};

export default function CheckoutPage() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const deliveryCharge = DELIVERY_CHARGES[deliveryZone];
  const grandTotal = total + deliveryCharge;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast({
      title: 'Copied!',
      description: 'Order ID copied to clipboard.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add items to your cart first.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.customerName || !formData.phone || !formData.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create order and get the order ID
      const newOrderId = await createOrder({
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          qty: item.qty,
        })),
        subtotal: total,
        deliveryCharge,
        deliveryZone,
        total: grandTotal,
        status: 'placed',
        createdAt: Date.now(),
      });

      // Decrement stock for each item
      for (const item of items) {
        await decrementStock(item.product.id, item.qty);
      }

      clearCart();
      setOrderId(newOrderId);
      setOrderPlaced(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-lg mx-auto px-4 py-12">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-display font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. We will contact you soon.
            </p>

            {/* Order Tracking Code */}
            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Your Order Tracking Code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-mono font-bold text-accent break-all">
                  {orderId}
                </code>
                <button
                  onClick={handleCopyOrderId}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Copy Order ID"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Save this code to track your order status
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to={`/track-order`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-accent-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors"
              >
                <Package className="w-5 h-5" />
                Track Your Order
              </Link>
              <Link
                to="/"
                className="w-full py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h1 className="font-display text-2xl md:text-3xl text-foreground mb-6">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Order Summary</h2>

            {items.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4">
                    <img
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                      {item.selectedColor && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Color: {item.selectedColor}
                        </p>
                      )}
                      <p className="text-accent font-semibold mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.qty - 1)}
                          className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.qty + 1)}
                          className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-auto text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{formatPrice(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-accent">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Details Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-medium">Delivery Details</h2>

            <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House #, Road #, Area, City"
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FileText className="w-4 h-4" />
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  rows={2}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                />
              </div>
            </div>

            {/* Delivery Zone Selection */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Truck className="w-4 h-4" />
                Delivery Zone *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside_dhaka')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    deliveryZone === 'inside_dhaka'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <p className="font-medium text-sm">Inside Dhaka</p>
                  <p className="text-accent font-semibold">{formatPrice(80)}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside_dhaka')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    deliveryZone === 'outside_dhaka'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <p className="font-medium text-sm">Outside Dhaka</p>
                  <p className="text-accent font-semibold">{formatPrice(100)}</p>
                </button>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <p className="text-sm font-medium text-accent">💵 Cash on Delivery (COD)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pay when you receive your order
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-semibold text-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : `Place Order (COD) • ${formatPrice(grandTotal)}`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
