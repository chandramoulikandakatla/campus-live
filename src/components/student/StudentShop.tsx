import React from 'react';
import { Search, ShoppingBag, Plus, Minus, Lock } from 'lucide-react';
import { useStore } from '../../lib/store';
import { CATEGORIES } from '../../lib/initialData';
import { ProductArtwork } from '../common/ProductArtwork';

export function StudentShop() {
  const {
    ecosystem,
    loggedStudentId,
    setStudentScreen,
    setSelectedProductId,
    setDetailQty,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    cart,
    addToCart,
    updateCartQty,
    getCartCount,
    getCartTotal,
    recentlyViewed
  } = useStore();

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
  const studentControls =
    ecosystem.spendingControls[currentStudent.id] ||
    ecosystem.spendingControls['CK-2026-101'] || { restrictedCategories: [] };

  const handleOpenProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setDetailQty(1);
    setStudentScreen('product_detail');
  };

  let filtered = ecosystem.products.filter((p) => p.active);
  if (selectedCategory !== 'All') {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  if (selectedSort === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (selectedSort === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (selectedSort === 'stock') filtered = [...filtered].sort((a, b) => b.stock - a.stock);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  return (
    <div className="space-y-6">
      {/* Search, Filter & Sort Toolbar */}
      <div className="bg-slate-900/85 border border-white/15 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snacks, notebooks, beverages, hygiene kits..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="featured">Sort: Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock">Availability: High Stock</option>
            </select>
            <button
              onClick={() => setStudentScreen('cart')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                Cart ({cartCount}) · ₹{cartTotal}
              </span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalogue Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((prod) => {
          const inCartItem = cart.find((c) => c.productId === prod.id);
          const isRestricted = studentControls.restrictedCategories?.includes(prod.category);
          return (
            <div
              key={prod.id}
              className="bg-slate-900/85 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all"
            >
              <div>
                <div
                  className="cursor-pointer"
                  onClick={() => handleOpenProductDetail(prod.id)}
                >
                  <ProductArtwork category={prod.category} id={prod.id} className="w-full h-36" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    {prod.category}
                  </span>
                  {prod.stock === 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Out of Stock
                    </span>
                  ) : prod.stock <= 5 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Only {prod.stock} left
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-400">
                      In Stock ({prod.stock})
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => handleOpenProductDetail(prod.id)}
                  className="text-sm font-bold text-white mt-2 cursor-pointer hover:text-indigo-300"
                >
                  {prod.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
                {isRestricted && (
                  <p className="text-[10px] text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Restricted by Parent Control
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div>
                  <span className="text-lg font-extrabold text-white">₹{prod.price}</span>
                  <button
                    onClick={() => handleOpenProductDetail(prod.id)}
                    className="block text-[11px] text-indigo-400 hover:underline"
                  >
                    View Details →
                  </button>
                </div>

                {inCartItem ? (
                  <div className="flex items-center gap-2 bg-slate-950 border border-indigo-500/40 rounded-xl px-2 py-1">
                    <button
                      onClick={() => updateCartQty(prod.id, -1)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">
                      {inCartItem.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(prod.id, 1)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={prod.stock <= 0}
                    onClick={() => addToCart(prod, 1)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      prod.stock <= 0
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
            Recently Viewed Products
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentlyViewed.map((id) => {
              const p = ecosystem.products.find((x) => x.id === id);
              if (!p) return null;
              return (
                <button
                  key={id}
                  onClick={() => handleOpenProductDetail(id)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 flex items-center gap-2 transition-colors"
                >
                  <span>{p.name}</span>
                  <span className="text-indigo-400 font-bold">₹{p.price}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
