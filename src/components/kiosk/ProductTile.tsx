import { useState } from 'react';
import { Minus, Plus, ShieldAlert } from 'lucide-react';
import { inr, productImage, stockState, useStore, type Product } from '@/lib/store';

const STOCK_LABEL: Record<string, { label: string; className: string; dotClass: string }> = {
  'in-stock': { label: 'In stock', className: 'text-emerald-600 dark:text-emerald-400', dotClass: 'bg-emerald-500' },
  limited: { label: 'Low stock', className: 'text-amber-600 dark:text-amber-400', dotClass: 'bg-amber-500' },
  'out-of-stock': { label: 'Out of stock', className: 'text-rose-600 dark:text-rose-400', dotClass: 'bg-rose-500' },
};

export function ProductTile({ product }: { product: Product }) {
  const { src, fallback } = productImage(product);
  const [imgSrc, setImgSrc] = useState(src);
  const quantity = useStore((s) => s.getQuantityOf(product.id));
  const addToCart = useStore((s) => s.addToCart);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const parentLimits = useStore((s) => s.parentLimits);

  const state = stockState(product);
  const soldOut = state === 'out-of-stock';
  const stock = STOCK_LABEL[state];
  const isRestricted = !parentLimits.categories.includes(product.category);
  const stockCount = product.stockQuantity ?? (state === 'out-of-stock' ? 0 : state === 'limited' ? 3 : 25);

  return (
    <article
      className={`group relative flex flex-col rounded-2xl bg-card border border-border/80 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden ${
        soldOut || isRestricted ? 'opacity-70' : ''
      }`}
    >
      {/* Product Image Area - Compact, responsive height */}
      <div className="relative h-36 sm:h-40 md:h-44 w-full bg-gradient-to-b from-muted/50 to-muted/20 overflow-hidden flex items-center justify-center">
        <img
          src={imgSrc}
          onError={() => imgSrc !== fallback && setImgSrc(fallback)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/30 via-transparent to-transparent pointer-events-none" />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-md text-[10px] font-mono font-medium tracking-wide uppercase text-foreground border border-border/50 shadow-xs">
            {product.sku || product.id}
          </span>
          {isRestricted && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/90 backdrop-blur-md text-destructive-foreground text-[10px] font-semibold shadow-xs">
              <ShieldAlert className="w-3 h-3" />
              Restricted
            </span>
          )}
        </div>

        {/* Corner Stock Pill */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {soldOut ? (
            <span className="px-2 py-0.5 rounded-md bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-medium shadow-xs">
              Sold Out
            </span>
          ) : state === 'limited' ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-medium shadow-xs">
              Low Stock
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Details & Actions */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground/80 truncate">
              {product.category}
            </span>
            {product.unit && (
              <span className="shrink-0 text-muted-foreground/90 font-medium">
                {product.unit}
              </span>
            )}
          </div>
          <h3 className="font-display text-sm sm:text-[15px] font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${stock.dotClass}`} />
            <span className={`text-[11px] font-medium ${stock.className}`}>
              {stock.label}
              {state === 'limited' ? ` · ${stockCount} left` : ''}
            </span>
          </div>
        </div>

        {/* Price and Cart Interaction */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
          <div>
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground">
              {inr(product.price)}
            </span>
          </div>

          {soldOut ? (
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg">
              Unavailable
            </span>
          ) : isRestricted ? (
            <span className="text-[11px] font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
              Parent restricted
            </span>
          ) : quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold tracking-wide active:scale-95 transition-all shadow-xs flex items-center justify-center"
              style={{ minWidth: 64, minHeight: 36 }}
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-xl bg-muted/70 border border-border/70 p-0.5">
              <button
                aria-label="Decrease quantity"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card text-foreground hover:bg-background border border-border/50 shadow-2xs active:scale-90 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-display font-bold w-6 text-center text-xs sm:text-sm text-foreground">
                {quantity}
              </span>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= stockCount}
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card text-foreground hover:bg-background border border-border/50 shadow-2xs disabled:opacity-40 active:scale-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
