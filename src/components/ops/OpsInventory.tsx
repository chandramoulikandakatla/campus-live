import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { CATEGORIES } from '../../lib/initialData';

export function OpsInventory() {
  const { ecosystem, addProduct, updateProduct } = useStore();

  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Food and Snacks',
    price: 50,
    stock: 25,
    offerTag: 'New Arrival',
    description: ''
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) return;

    addProduct({
      name: newProductForm.name,
      category: newProductForm.category,
      price: Number(newProductForm.price) || 0,
      stock: Number(newProductForm.stock) || 0,
      active: true,
      featured: false,
      frequent: false,
      offerTag: newProductForm.offerTag,
      description: newProductForm.description || 'Approved campus specification.'
    });

    setNewProductForm({
      name: '',
      category: 'Food and Snacks',
      price: 50,
      stock: 25,
      offerTag: 'New Arrival',
      description: ''
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Create New Product Form */}
      <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-5 h-fit space-y-4">
        <h3 className="text-base font-bold text-white">Add New Campus Product</h3>
        <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Product Name</label>
            <input
              type="text"
              value={newProductForm.name}
              onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
              placeholder="e.g. Millet Protein Sandwich"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Category</label>
            <select
              value={newProductForm.category}
              onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Price (₹)</label>
              <input
                type="number"
                value={newProductForm.price}
                onChange={(e) =>
                  setNewProductForm({ ...newProductForm, price: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Initial Stock</label>
              <input
                type="number"
                value={newProductForm.stock}
                onChange={(e) =>
                  setNewProductForm({ ...newProductForm, stock: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={newProductForm.description}
              onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
              placeholder="Approved campus specification..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            + Publish to Student Catalogue
          </button>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-white/15 rounded-3xl p-5 space-y-4">
        <h3 className="text-base font-bold text-white">Live Campus Inventory & Stock Controls</h3>
        <div className="space-y-2.5">
          {ecosystem.products.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-400 font-bold">{p.id}</span>
                  <span className="font-bold text-white">{p.name}</span>
                  {!p.active && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Deactivated
                    </span>
                  )}
                </div>
                <p className="text-slate-400 mt-0.5">
                  {p.category} · Price: ₹{p.price}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 5) })}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                >
                  -5
                </button>
                <span
                  className={`px-3 py-1 rounded-lg font-mono font-bold ${
                    p.stock === 0
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  Stock: {p.stock}
                </span>
                <button
                  onClick={() => updateProduct(p.id, { stock: p.stock + 10 })}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                >
                  +10
                </button>
                <button
                  onClick={() => updateProduct(p.id, { stock: 0 })}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition-colors"
                  title="Set Out of Stock to test student blocker"
                >
                  Set 0
                </button>
                <button
                  onClick={() => updateProduct(p.id, { active: !p.active })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    p.active ? 'bg-white/10 text-slate-200' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {p.active ? 'Hide' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
