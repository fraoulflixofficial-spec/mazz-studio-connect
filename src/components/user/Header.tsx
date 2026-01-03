import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingCart, Menu, X, Home, Sun, Moon, Package, Phone, Gift, PackagePlus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { FEATURED_CATEGORIES } from '@/types';
import { subscribeToOffers } from '@/lib/database';
import { Offer } from '@/types';
import { NotificationBadge } from './NotificationBadge';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOffers(setOffers);
    return () => unsubscribe();
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);
  const offerCount = offers.filter(offer => offer.stock > 0).length;

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 lg:h-20 px-4 lg:px-8">
          {/* Left - Menu Button & Theme Toggle */}
          <div className="flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 lg:p-3 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6 lg:w-7 lg:h-7" /> : <Menu className="w-6 h-6 lg:w-7 lg:h-7" />}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 lg:p-3 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 lg:w-6 lg:h-6" /> : <Moon className="w-5 h-5 lg:w-6 lg:h-6" />}
            </button>
          </div>

          {/* Center - Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 lg:gap-3">
            <ShoppingCart className="w-6 h-6 lg:w-8 lg:h-8 text-accent" />
            <span className="font-display text-lg lg:text-2xl font-bold tracking-wide text-foreground uppercase">
              Mazzé Studio
            </span>
          </Link>

          {/* Right - Offers & Cart */}
          <div className="flex items-center gap-1 lg:gap-2">
            <Link
              to="/offers"
              className="relative p-2 lg:p-3 rounded-lg hover:bg-muted transition-colors group"
              aria-label="Special Offers"
            >
              <Gift className="w-5 h-5 lg:w-6 lg:h-6 text-accent group-hover:scale-110 transition-transform" />
              <NotificationBadge count={offerCount} />
            </Link>
            <Link
              to="/checkout"
              className="relative p-2 lg:p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <ShoppingCart className="w-6 h-6 lg:w-7 lg:h-7" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-accent text-accent-foreground text-xs lg:text-sm font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm animate-in fade-in-0">
          <div className="pt-16 px-4">
            <nav className="space-y-2">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg"
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg w-full text-left"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>

              <div className="pt-4 pb-2 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Categories
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {FEATURED_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${encodeURIComponent(cat)}`}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-border" />

              {/* Custom Order - Above Track Order */}
              <Link
                to="/custom-order"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg"
              >
                <PackagePlus className="w-5 h-5 text-accent" />
                Custom Product Order
              </Link>

              {/* Track Order & Contacts */}
              <Link
                to="/track-order"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg"
              >
                <Package className="w-5 h-5 text-accent" />
                Track Your Order
              </Link>
              
              <Link
                to="/contacts"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-lg"
              >
                <Phone className="w-5 h-5 text-accent" />
                Contacts
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
