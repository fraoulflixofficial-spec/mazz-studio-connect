import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingCart, Menu, X, Home, Sun, Moon } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { FEATURED_CATEGORIES } from '@/types';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left - Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Center - Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-accent" />
            <span className="font-display text-lg font-bold tracking-wide text-foreground uppercase">
              Mazzé Studio
            </span>
          </Link>

          {/* Right - Cart */}
          <Link
            to="/checkout"
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
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
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
