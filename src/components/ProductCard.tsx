import { motion } from 'framer-motion';
import { Plus, Minus, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product, useStore } from '@/lib/store';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { cart, addToCart, updateQuantity, parentLimits } = useStore();
  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const availabilityBadge = {
    'in-stock': { variant: 'in-stock' as const, label: 'In Stock' },
    limited: { variant: 'limited' as const, label: 'Limited' },
    'out-of-stock': { variant: 'out-of-stock' as const, label: 'Out of Stock' },
  };

  const isOutOfStock = product.availability === 'out-of-stock';
  const isParentRestricted = !parentLimits.categories.includes(product.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        variant="product"
        className={`overflow-hidden group ${isOutOfStock ? 'opacity-60' : ''}`}
      >
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 p-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <Badge variant={availabilityBadge[product.availability].variant}>
              {availabilityBadge[product.availability].label}
            </Badge>
            {product.tags.includes('healthy') && (
              <Badge variant="healthy">
                <Check className="w-3 h-3 mr-1" />
                Healthy
              </Badge>
            )}
            {product.tags.includes('parent-approved') && (
              <Badge variant="verified">
                <Check className="w-3 h-3 mr-1" />
                Parent Approved
              </Badge>
            )}
            {product.tags.includes('emergency') && (
              <Badge variant="emergency">Emergency</Badge>
            )}
            {isParentRestricted && <Badge variant="destructive">Parent restricted</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-foreground line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.unit}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-lg text-foreground">
              ₹{product.price}
            </div>

            {!isOutOfStock && (
              <div>
                {quantity === 0 ? (
                  <Button
                    variant="add"
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={isParentRestricted}
                    className="gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {isParentRestricted ? 'Restricted' : 'Add'}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="h-7 w-7"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-display font-semibold text-sm min-w-[20px] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={isParentRestricted}
                      className="h-7 w-7"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
