import { useState } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  title?: string;
  showFilters?: boolean;
}

type SortOption = 'default' | 'price-low' | 'price-high';

export function ProductGrid({ products, title, showFilters = true }: ProductGridProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.menuCategory.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="py-6 md:py-8">
      {(title || showFilters) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {title && (
            <h2 className="font-display text-2xl md:text-3xl text-foreground">{title}</h2>
          )}
          {showFilters && (
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="pl-9 pr-8 py-2 bg-card border border-border rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
