import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/lib/helpers';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-card rounded-lg overflow-hidden card-hover border border-border/50"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-medium text-sm md:text-base line-clamp-2 text-foreground group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-accent font-semibold text-sm md:text-base">
          {formatPrice(product.price)}
        </p>
        {product.stock <= 0 && (
          <span className="inline-block mt-2 text-xs px-2 py-1 bg-destructive/10 text-destructive rounded">
            Out of Stock
          </span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="inline-block mt-2 text-xs px-2 py-1 bg-accent/10 text-accent rounded">
            Only {product.stock} left
          </span>
        )}
      </div>
    </Link>
  );
}
