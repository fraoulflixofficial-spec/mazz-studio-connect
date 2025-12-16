import { useState, useMemo } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, Filter } from 'lucide-react';
import { FilterSidebar, FilterState } from './FilterSidebar';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  title?: string;
  showFilters?: boolean;
}

type SortOption = 'default' | 'price-low' | 'price-high';

export function ProductGrid({ products, title, showFilters = true }: ProductGridProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 0],
    selectedColors: [],
    selectedBrands: [],
  });

  // Calculate min/max for initial filter state
  const { minPrice, maxPrice } = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 10000 };
    const prices = products.map((p) => p.price);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Check if any filter is active
  const hasActiveFilters =
    filters.selectedColors.length > 0 ||
    filters.selectedBrands.length > 0 ||
    (filters.priceRange[0] > 0 && filters.priceRange[0] > minPrice) ||
    (filters.priceRange[1] > 0 && filters.priceRange[1] < maxPrice);

  const filteredProducts = products
    .filter((p) => {
      // Search filter
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.menuCategory.toLowerCase().includes(search.toLowerCase());

      // Price filter
      const effectiveMinPrice = filters.priceRange[0] || minPrice;
      const effectiveMaxPrice = filters.priceRange[1] || maxPrice;
      const matchesPrice = p.price >= effectiveMinPrice && p.price <= effectiveMaxPrice;

      // Color filter
      const matchesColor =
        filters.selectedColors.length === 0 ||
        (p.colors && p.colors.some((c) => filters.selectedColors.includes(c.trim())));

      // Brand filter
      const matchesBrand =
        filters.selectedBrands.length === 0 ||
        (p.brand && filters.selectedBrands.includes(p.brand.trim()));

      return matchesSearch && matchesPrice && matchesColor && matchesBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <>
      <FilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        products={products}
        filters={filters}
        onFilterChange={setFilters}
      />

      <div className="py-6 md:py-8">
        {(title || showFilters) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {title && (
              <h2 className="font-display text-2xl md:text-3xl text-foreground">{title}</h2>
            )}
            {showFilters && (
              <div className="flex gap-2 md:gap-3 items-center">
                {/* Filter Sidebar Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm hover:bg-muted transition-colors',
                    hasActiveFilters && 'border-accent bg-accent/10'
                  )}
                  aria-label="Open filters"
                >
                  <Filter className={cn('w-4 h-4', hasActiveFilters ? 'text-accent' : 'text-muted-foreground')} />
                  <span className="hidden sm:inline text-foreground">Filters</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                  )}
                </button>

                {/* Search Bar */}
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

                {/* Sort Dropdown */}
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
            {hasActiveFilters && (
              <button
                onClick={() =>
                  setFilters({
                    priceRange: [minPrice, maxPrice],
                    selectedColors: [],
                    selectedBrands: [],
                  })
                }
                className="mt-2 text-accent hover:underline text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
