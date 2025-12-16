import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/lib/helpers';

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
}

export function RelatedProducts({ currentProduct, allProducts }: RelatedProductsProps) {
  // Filter related products: same productGroup, different product, limit to 6
  const relatedProducts = allProducts.filter(
    (p) =>
      p.id !== currentProduct.id &&
      p.productGroup &&
      currentProduct.productGroup &&
      p.productGroup.toLowerCase().trim() === currentProduct.productGroup.toLowerCase().trim()
  ).slice(0, 6);

  // Hide section if no related products
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 lg:mt-16" aria-labelledby="related-products-heading">
      <h2 
        id="related-products-heading" 
        className="font-display text-xl md:text-2xl lg:text-3xl text-foreground mb-6 lg:mb-8"
      >
        Related Products
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group bg-card border border-border rounded-xl lg:rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
          >
            {/* Product Image */}
            <div className="aspect-square bg-muted/30 overflow-hidden">
              <img
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            
            {/* Product Info */}
            <div className="p-3 lg:p-4 space-y-2">
              {/* Badge */}
              {product.menuCategory && (
                <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full">
                  {product.menuCategory}
                </span>
              )}
              
              {/* Product Name */}
              <h3 className="font-medium text-sm lg:text-base text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              
              {/* Price */}
              <p className="text-accent font-bold text-base lg:text-lg">
                {formatPrice(product.price)}
              </p>
              
              {/* View Details Button */}
              <span className="inline-block text-xs lg:text-sm text-muted-foreground group-hover:text-accent transition-colors">
                View Details →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
