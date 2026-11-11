import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductTile } from '@/components/kiosk/ProductTile';
import { useProducts } from '@/lib/catalog';

export default function Shop() {
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const [params, setParams] = useSearchParams();
  const [inStockOnly, setInStockOnly] = useState(false);
  const category = params.get('category') ?? '';
  const search = params.get('q') ?? '';
  const categories = useMemo(() => [...new Set(products.map((product) => product.category))], [products]);
  const filtered = useMemo(() => products.filter((product) => {
    const term = search.trim().toLowerCase();
    const matchesText = !term || [product.name, product.sku, product.category, product.subcategory, product.brand]
      .some((value) => value?.toLowerCase().includes(term));
    return matchesText && (!category || product.category === category) && (!inStockOnly || product.stock_quantity > 0);
  }), [products, search, category, inStockOnly]);

  const updateParams = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <section className="mx-auto w-full max-w-[1600px] px-5 py-8 pb-28 sm:px-8 lg:px-10 lg:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-medium uppercase text-muted-foreground">CampusKart · Live inventory</p><h1 className="font-display text-3xl font-semibold sm:text-4xl">The campus shop</h1><p className="mt-2 text-muted-foreground">Essentials in stock, ready when you are.</p></div>
        <div className="text-sm text-muted-foreground">{filtered.length} items</div>
      </header>

      <div className="mb-6 flex flex-col gap-4">
        <label className="relative block max-w-2xl"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search products" className="h-14 pl-12" placeholder="Search products, brands or SKU" value={search} onChange={(event) => updateParams('q', event.target.value)} /><span className="sr-only">Search the live catalog</span></label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" aria-label="Product categories">
          <Button type="button" variant={!category ? 'default' : 'outline'} className="min-h-12 shrink-0" onClick={() => updateParams('category', '')}>All items</Button>
          {categories.map((name) => <Button key={name} type="button" variant={category === name ? 'default' : 'outline'} className="min-h-12 shrink-0" onClick={() => updateParams('category', name)}>{name}</Button>)}
        </div>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Button type="button" variant={inStockOnly ? 'secondary' : 'outline'} className="min-h-12" aria-pressed={inStockOnly} onClick={() => setInStockOnly((value) => !value)}><SlidersHorizontal className="h-4 w-4" /> {inStockOnly ? 'Showing in-stock' : 'In stock only'}</Button>
          {(search || category || inStockOnly) && <Button type="button" variant="ghost" className="min-h-12" onClick={() => { setParams({}, { replace: true }); setInStockOnly(false); }}> <X className="h-4 w-4" /> Clear filters</Button>}
        </div>
      </div>

      {isLoading ? <div className="py-20 text-center text-muted-foreground" role="status">Loading campus stock…</div> : isError ? <div className="py-20 text-center"><p className="mb-4 text-muted-foreground">The shop could not load right now.</p><Button variant="outline" onClick={() => void refetch()}>Try again</Button></div> : filtered.length === 0 ? <div className="py-20 text-center"><h2 className="font-display text-xl font-semibold">No matching items</h2><p className="mt-2 text-muted-foreground">Try another search or category.</p></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{filtered.map((product) => <ProductTile key={product.id} product={product} />)}</div>}
    </section>
  );
}