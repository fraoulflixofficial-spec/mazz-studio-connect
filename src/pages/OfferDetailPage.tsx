import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Header } from '@/components/user/Header';
import { Offer } from '@/types';
import { subscribeToOffers } from '@/lib/database';
import { formatPrice } from '@/lib/helpers';
import { Gift, Minus, Plus, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVisitorTracking, useProductViewTracking } from '@/hooks/useAnalyticsTracking';

export default function OfferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Track visitor and offer view (use offer id as product id for unified tracking)
  useVisitorTracking();
  useProductViewTracking(id);

  useEffect(() => {
    const unsub = subscribeToOffers((offers) => {
      const found = offers.find((o) => o.id === id);
      setOffer(found || null);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    if (offer?.colors?.length) {
      setSelectedColor(offer.colors[0]);
    }
  }, [offer]);

  const handleOrderNow = () => {
    if (!offer) return;
    // Navigate to offer checkout with offer data and selected color
    const colorParam = selectedColor ? `&color=${encodeURIComponent(selectedColor)}` : '';
    navigate(`/offer-checkout/${offer.id}?qty=${qty}${colorParam}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="aspect-square max-w-md bg-muted rounded-2xl" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
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
          <p className="text-muted-foreground mb-6">This offer may have expired or been removed.</p>
          <Link to="/offers" className="text-accent hover:underline">
            ← Back to Offers
          </Link>
        </div>
      </div>
    );
  }

  const savings = offer.originalPrice ? offer.originalPrice - offer.comboPrice : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 lg:py-12">
        {/* Back Button */}
        <Link
          to="/offers"
          className="inline-flex items-center gap-2 text-sm lg:text-base text-muted-foreground hover:text-foreground mb-6 lg:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Offers
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-card rounded-xl lg:rounded-2xl overflow-hidden border border-border">
              <img
                src={offer.images?.[currentImageIndex] || '/placeholder.svg'}
                alt={offer.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 px-4 py-2 bg-accent text-accent-foreground font-bold rounded-full flex items-center gap-2">
                <Gift className="w-4 h-4" />
                SPECIAL OFFER
              </div>
            </div>
            {offer.images && offer.images.length > 1 && (
              <div className="flex gap-2 lg:gap-3 justify-center">
                {offer.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg lg:rounded-xl overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-accent'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6 lg:space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 lg:mb-4">
                {offer.title}
              </h1>
              <div className="text-muted-foreground lg:text-lg prose prose-invert prose-sm lg:prose-base max-w-none prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-p:my-2 prose-strong:text-foreground prose-em:text-accent">
                <ReactMarkdown>{offer.description}</ReactMarkdown>
              </div>
            </div>

            {/* Price */}
            <div className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-accent">
                  {formatPrice(offer.comboPrice)}
                </span>
                {offer.originalPrice && offer.originalPrice > offer.comboPrice && (
                  <span className="text-lg lg:text-xl text-muted-foreground line-through">
                    {formatPrice(offer.originalPrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm lg:text-base text-green-500 font-medium">
                  You save {formatPrice(savings)}!
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {offer.stock > 0 ? (
                <>
                  <span className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm lg:text-base text-green-500">
                    In Stock ({offer.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 lg:w-3 lg:h-3 bg-destructive rounded-full" />
                  <span className="text-sm lg:text-base text-destructive">Out of Stock</span>
                </>
              )}
            </div>

            {/* Color Selection */}
            {offer.colors && offer.colors.length > 0 && (
              <div>
                <p className="text-sm lg:text-base font-medium mb-3">
                  Color: <span className="text-accent">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {offer.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 lg:px-5 lg:py-3 rounded-lg lg:rounded-xl border text-sm lg:text-base font-medium transition-all flex items-center gap-2 ${
                        selectedColor === color
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {selectedColor === color && <Check className="w-4 h-4" />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm lg:text-base font-medium">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg lg:rounded-xl">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 lg:p-4 hover:bg-muted transition-colors"
                  disabled={qty <= 1}
                >
                  <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
                <span className="w-12 lg:w-16 text-center font-medium lg:text-lg">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(offer.stock, qty + 1))}
                  className="p-3 lg:p-4 hover:bg-muted transition-colors"
                  disabled={qty >= offer.stock}
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-muted/50 rounded-xl lg:rounded-2xl p-4 lg:p-6">
              <div className="flex justify-between items-center">
                <span className="font-medium lg:text-lg">Total:</span>
                <span className="text-2xl lg:text-3xl font-bold text-accent">
                  {formatPrice(offer.comboPrice * qty)}
                </span>
              </div>
            </div>

            {/* Order Button */}
            <button
              onClick={handleOrderNow}
              disabled={offer.stock <= 0}
              className="w-full py-4 lg:py-5 bg-accent text-accent-foreground rounded-xl lg:rounded-2xl font-semibold text-lg lg:text-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
              Order Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
