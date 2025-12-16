import { useState, useEffect, useMemo } from 'react';
import { X, Filter } from 'lucide-react';
import { Product } from '@/types';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
}

export interface FilterState {
  priceRange: [number, number];
  selectedColors: string[];
  selectedBrands: string[];
}

export function FilterSidebar({
  isOpen,
  onClose,
  products,
  onFilterChange,
  filters,
}: FilterSidebarProps) {
  // Calculate dynamic min/max prices from products
  const { minPrice, maxPrice } = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 10000 };
    const prices = products.map((p) => p.price);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Get unique colors from products
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => {
      if (p.colors && p.colors.length > 0) {
        p.colors.forEach((color) => colors.add(color.trim()));
      }
    });
    return Array.from(colors).sort();
  }, [products]);

  // Get unique brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        brands.add(p.brand.trim());
      }
    });
    return Array.from(brands).sort();
  }, [products]);

  // Initialize price range when products change
  useEffect(() => {
    if (filters.priceRange[0] === 0 && filters.priceRange[1] === 0) {
      onFilterChange({
        ...filters,
        priceRange: [minPrice, maxPrice],
      });
    }
  }, [minPrice, maxPrice]);

  const handlePriceChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.selectedColors.includes(color)
      ? filters.selectedColors.filter((c) => c !== color)
      : [...filters.selectedColors, color];
    onFilterChange({
      ...filters,
      selectedColors: newColors,
    });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.selectedBrands.includes(brand)
      ? filters.selectedBrands.filter((b) => b !== brand)
      : [...filters.selectedBrands, brand];
    onFilterChange({
      ...filters,
      selectedBrands: newBrands,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      priceRange: [minPrice, maxPrice],
      selectedColors: [],
      selectedBrands: [],
    });
  };

  const hasActiveFilters =
    filters.selectedColors.length > 0 ||
    filters.selectedBrands.length > 0 ||
    filters.priceRange[0] > minPrice ||
    filters.priceRange[1] < maxPrice;

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-card border-r border-border z-50 transform transition-transform duration-300 ease-out overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-semibold text-foreground">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full py-2 px-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
            >
              Clear All Filters
            </button>
          )}

          {/* Price Range Filter */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-accent rounded-full"></span>
              Filter by Price
            </h3>
            <div className="px-2">
              <Slider
                value={[filters.priceRange[0] || minPrice, filters.priceRange[1] || maxPrice]}
                min={minPrice}
                max={maxPrice}
                step={Math.max(1, Math.floor((maxPrice - minPrice) / 100))}
                onValueChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                <span className="bg-muted px-2 py-1 rounded text-foreground font-medium">
                  {formatPrice(filters.priceRange[0] || minPrice)}
                </span>
                <span className="text-muted-foreground">—</span>
                <span className="bg-muted px-2 py-1 rounded text-foreground font-medium">
                  {formatPrice(filters.priceRange[1] || maxPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Color Filter */}
          {availableColors.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <span className="w-1 h-4 bg-accent rounded-full"></span>
                Filter by Colour
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {availableColors.map((color) => (
                  <label
                    key={color}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={filters.selectedColors.includes(color)}
                      onCheckedChange={() => handleColorToggle(color)}
                      className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <span className="text-sm text-foreground">{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Brand Filter */}
          {availableBrands.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <span className="w-1 h-4 bg-accent rounded-full"></span>
                Filter by Brand
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={filters.selectedBrands.includes(brand)}
                      onCheckedChange={() => handleBrandToggle(brand)}
                      className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <span className="text-sm text-foreground">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* No filters available message */}
          {availableColors.length === 0 && availableBrands.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No additional filters available for this category.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
