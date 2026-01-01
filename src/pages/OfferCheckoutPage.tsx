import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/user/Header';
import { Offer } from '@/types';
import { subscribeToOffers, createOrder, decrementOfferStock } from '@/lib/database';
import { formatPrice } from '@/lib/helpers';
import { MapPin, Phone, User, FileText, CheckCircle2, Copy, Package, Gift, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DeliveryZone } from '@/types';

const DELIVERY_CHARGES = {
  inside_dhaka: 80,
  outside_dhaka: 100,
};

export default function OfferCheckoutPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const qty = parseInt(searchParams.get('qty') || '1', 10);
  const selectedColor = searchParams.get('color') || undefined;
  const { toast } = useToast();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const unsub = subscribeToOffers((offers) => {
      const found = offers.find((o) => o.id === id);
      setOffer(found || null);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast({
      title: 'Copied!',
      description: 'Order ID copied to clipboard.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offer) return;

    if (!formData.customerName || !formData.phone || !formData.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const colorInfo = selectedColor ? ` (${selectedColor})` : '';
      const subtotal = offer.comboPrice * qty;
      const deliveryCharge = DELIVERY_CHARGES[deliveryZone];
      const newOrderId = await createOrder({
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        items: [
          {
            productId: offer.id,
            productName: `[OFFER] ${offer.title}${colorInfo}`,
            price: offer.comboPrice,
            qty,
            warranty: offer.warranty,
          },
        ],
        subtotal,
        deliveryCharge,
        deliveryZone,
        total: subtotal + deliveryCharge,
        status: 'placed',
        createdAt: Date.now(),
      });

      await decrementOfferStock(offer.id, qty);

      setOrderId(newOrderId);
      setOrderPlaced(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4 max-w-lg mx-auto">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Gift className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Offer Not Found</h1>
          <Link to="/offers" className="text-accent hover:underline">
            ← Back to Offers
          </Link>
        </div>
      </div>
    );
  }

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
                to="/track-order"
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

  const subtotal = offer.comboPrice * qty;
  const deliveryCharge = DELIVERY_CHARGES[deliveryZone];
  const grandTotal = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h1 className="font-display text-2xl md:text-3xl text-foreground mb-6">
          Checkout - Special Offer
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Order Summary</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex gap-4 p-4">
                <img
                  src={offer.images?.[0] || '/placeholder.svg'}
                  alt={offer.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-accent">SPECIAL OFFER</span>
                  </div>
                  <h3 className="font-medium line-clamp-2">{offer.title}</h3>
                  {selectedColor && (
                    <p className="text-sm text-muted-foreground">Color: {selectedColor}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">Qty: {qty}</p>
                  <p className="text-accent font-semibold mt-1">
                    {formatPrice(offer.comboPrice)} × {qty}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
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
              disabled={submitting}
              className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-semibold text-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing Order...' : `Place Order (COD) • ${formatPrice(grandTotal)}`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
