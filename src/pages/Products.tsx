import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { CategoryBar } from '@/components/CategoryGrid';
import { ProductCard } from '@/components/ProductCard';
import { mockProducts, categories } from '@/lib/store';

const filters = [
  { id: 'in-stock', label: 'In Stock', icon: Check },
  { id: 'healthy', label: 'Healthy Picks', icon: null },
  { id: 'parent-approved', label: 'Parent Approved', icon: null },
  { id: 'emergency', label: 'Emergency', icon: null },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      // Search filter
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (categoryParam && product.category !== categoryParam) {
        return false;
      }

      // Active filters
      if (activeFilters.includes('in-stock') && product.availability === 'out-of-stock') {
        return false;
      }
      if (activeFilters.includes('healthy') && !product.tags.includes('healthy')) {
        return false;
      }
      if (activeFilters.includes('parent-approved') && !product.tags.includes('parent-approved')) {
        return false;
      }
      if (activeFilters.includes('emergency') && !product.tags.includes('emergency')) {
        return false;
      }

      return true;
    });
  }, [search, categoryParam, activeFilters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Search & Filter Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                variant="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Categories */}
          <CategoryBar />

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilters.includes(filter.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter(filter.id)}
                  className="gap-1.5"
                >
                  {activeFilters.includes(filter.id) && <Check className="w-3 h-3" />}
                  {filter.label}
                </Button>
              ))}
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFilters([])}
                  className="text-destructive"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {categoryParam || 'All Products'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredProducts.length} items available
            </p>
          </div>
          {categoryParam && (
            <Badge variant="category" className="gap-1.5">
              {categories.find((c) => c.name === categoryParam)?.icon}
              {categoryParam}
            </Badge>
          )}
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
