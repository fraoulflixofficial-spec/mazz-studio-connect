import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingCart, Sun, Moon, Menu, X, Home, Grid3X3 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { FEATURED_CATEGORIES } from '@/types';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl md:text-2xl font-bold text-foreground">
              Mazzé<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm transition-colors ${
                location.pathname === '/' ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Home
            </Link>
            <div className="relative group">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="bg-card border border-border rounded-lg shadow-xl p-2 min-w-48">
                  {FEATURED_CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-accent" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <Link
              to="/checkout"
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-in slide-in-from-top-2">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <div className="px-3 py-2 text-sm font-medium text-muted-foreground">Categories</div>
            <div className="grid grid-cols-2 gap-2">
              {FEATURED_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
