import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductTile } from '@/components/kiosk/ProductTile';
import { useProducts } from '@/lib/catalog';
import { useProfile } from '@/lib/auth';

export default function Home() {
  const { data: products = [], isLoading, isError } = useProducts();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const categories = [...new Set(products.map((product) => product.category))];
  const featured = products.filter((product) => product.stock_quantity > 0).slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 py-8 pb-28 sm:px-8 lg:px-10 lg:py-12">
      <section className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:pb-14">
        <div><p className="mb-3 text-xs font-medium uppercase text-muted-foreground">Campus essentials · ready when you are</p><h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">Good to see you{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.</h1><p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">Shop everyday essentials from your campus inventory, with your wallet balance right here.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/shop"><Button size="lg">Browse the shop <ArrowRight /></Button></Link><Link to="/orders"><Button variant="outline" size="lg">Track an order</Button></Link></div></div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-5 lg:justify-end lg:border-t-0 lg:pt-0"><div><p className="text-xs uppercase text-muted-foreground">Wallet balance</p><p className="mt-2 font-display text-2xl font-semibold">{profile ? `₹${Number(profile.wallet_balance).toLocaleString('en-IN')}` : '—'}</p></div><div className="hidden h-12 w-px bg-border sm:block" /><div><p className="text-xs uppercase text-muted-foreground">Campus</p><p className="mt-2 font-display text-2xl font-semibold">{profile?.campus || 'Your campus'}</p></div></div>
      </section>

      <section className="py-9">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-2xl font-semibold">Shop by category</h2><p className="mt-1 text-sm text-muted-foreground">Find what you need, fast.</p></div><Link to="/shop" className="flex min-h-12 items-center gap-1 text-sm font-medium">All items <ArrowRight className="h-4 w-4" /></Link></div>
        {isLoading ? <p className="py-8 text-muted-foreground">Loading the live catalog…</p> : isError ? <p className="py-8 text-muted-foreground">Categories are temporarily unavailable.</p> : categories.length === 0 ? <p className="py-8 text-muted-foreground">No categories are available right now.</p> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.map((category, index) => <button key={category} type="button" onClick={() => navigate(`/shop?category=${encodeURIComponent(category)}`)} className="flex min-h-20 items-center justify-between border border-border bg-card px-4 py-3 text-left text-sm font-medium active:bg-muted"><span>{category}</span><span className="text-muted-foreground">0{index + 1}</span></button>)}</div>}
      </section>

      <section className="border-t border-border py-9">
        <div className="mb-5 flex items-end justify-between"><div><h2 className="font-display text-2xl font-semibold">Available now</h2><p className="mt-1 text-sm text-muted-foreground">Popular picks from today’s stock.</p></div><span className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Live stock</span></div>
        {isLoading ? <p className="py-8 text-muted-foreground">Loading campus stock…</p> : featured.length === 0 ? <p className="py-8 text-muted-foreground">No items are available at the moment.</p> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <ProductTile key={product.id} product={product} />)}</div>}
      </section>
    </div>
  );
}