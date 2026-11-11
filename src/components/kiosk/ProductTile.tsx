import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { inr, productImage, stockState, type Product } from '@/lib/catalog';
import { useCart } from '@/lib/cart';

const STOCK_LABEL: Record<string, { label: string; className: string }> = {
  'in-stock': { label: 'In stock', className: 'text-[hsl(var(--in-stock))]' },
  limited: { label: 'Low stock', className: 'text-[hsl(var(--limited))]' },
  'out-of-stock': { label: 'Out of stock', className: 'text-[hsl(var(--out-of-stock))]' },
};

export function ProductTile({ product }: { product: Product }) {
  const { src, fallback } = productImage(product);
  const [imgSrc, setImgSrc] = useState(src);
  const quantity = useCart((s) => s.quantityOf(product.id));
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);

  const state = stockState(product);
  const soldOut = state === 'out-of-stock';
  const stock = STOCK_LABEL[state];

  return (
    <article
      className={`flex flex-col rounded-[var(--radius-lg)] bg-card border border-border overflow-hidden shadow-sm ${
        soldOut ? 'opacity-55' : ''
      }`}
    >
      <div className="relative aspect-square bg-muted">
        <img
          src={imgSrc}
          onError={() => imgSrc !== fallback && setImgSrc(fallback)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/90 text-[11px] font-medium tracking-wide uppercase">
          {product.sku}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-1 flex-1">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{product.category}</p>
        <h3 className="font-display text-base font-medium leading-snug line-clamp-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.unit}</p>
        <p className={`text-xs font-medium mt-1 ${stock.className}`}>
          {stock.label}
          {state === 'limited' ? ` · ${product.stock_quantity} left` : ''}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-display text-xl font-semibold">{inr(product.price)}</span>

          {soldOut ? (
            <span className="text-sm text-muted-foreground">Unavailable</span>
          ) : quantity === 0 ? (
            <button
              onClick={() => add(product)}
              className="px-6 rounded-2xl bg-primary text-primary-foreground text-sm font-medium active:opacity-85"
              style={{ minHeight: 'var(--touch-sm)' }}
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-2xl bg-muted p-1">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQuantity(product.id, quantity - 1)}
                className="flex items-center justify-center rounded-xl bg-card border border-border"
                style={{ width: 44, height: 44 }}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display font-semibold w-8 text-center">{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= product.stock_quantity}
                onClick={() => setQuantity(product.id, quantity + 1)}
                className="flex items-center justify-center rounded-xl bg-card border border-border disabled:opacity-40"
                style={{ width: 44, height: 44 }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
