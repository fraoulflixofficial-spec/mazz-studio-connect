import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/user/Header';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/helpers';
import { createOrder, decrementStock } from '@/lib/database';
import { Trash2, Minus, Plus, MapPin, Phone, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

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
      // Create order
      await createOrder({
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
        total,
        status: 'placed',
        createdAt: Date.now(),
      });

      // Decrement stock for each item
      for (const item of items) {
        await decrementStock(item.product.id, item.qty);
      }

      clearCart();
      toast({
        title: 'Order Placed!',
        description: 'Your order has been placed successfully. We will contact you soon.',
      });
      navigate('/');
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
                <div className="p-4 bg-muted/50">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-accent">{formatPrice(total)}</span>
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
              {loading ? 'Placing Order...' : `Place Order (COD) • ${formatPrice(total)}`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
