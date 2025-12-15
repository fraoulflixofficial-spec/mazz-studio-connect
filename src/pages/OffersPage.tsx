import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/user/Header';
import { Offer } from '@/types';
import { subscribeToOffers } from '@/lib/database';
import { formatPrice } from '@/lib/helpers';
import { Gift, ShoppingBag } from 'lucide-react';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToOffers((data) => {
      setOffers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/60 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Special Offers</h1>
            <p className="text-sm text-muted-foreground">Exclusive deals & combo packages</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-xl mb-4" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-medium mb-2">No Offers Yet</h2>
            <p className="text-muted-foreground">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <Link
                key={offer.id}
                to={`/offer/${offer.id}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-all hover:shadow-lg"
              >
                {/* Offer Badge */}
                <div className="relative">
                  <img
                    src={offer.image || '/placeholder.svg'}
                    alt={offer.title}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    OFFER
                  </div>
                  {offer.stock <= 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-destructive font-bold">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-lg line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {offer.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-accent">
                        {formatPrice(offer.comboPrice)}
                      </span>
                      {offer.originalPrice && offer.originalPrice > offer.comboPrice && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          {formatPrice(offer.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-medium">
                      <ShoppingBag className="w-4 h-4" />
                      View
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
