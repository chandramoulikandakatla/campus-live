import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import snacks from '@/assets/cat-snacks.jpg';
import sweet from '@/assets/cat-sweet.jpg';
import pantry from '@/assets/cat-pantry.jpg';
import home from '@/assets/cat-home.jpg';
import care from '@/assets/cat-care.jpg';
import fresh from '@/assets/cat-fresh.jpg';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string | null;
  brand: string | null;
  price: number;
  unit: string | null;
  image_url: string | null;
  stock_quantity: number;
  reorder_threshold: number;
  is_active: boolean;
}

/** Category groups drive the kiosk rail and the fallback catalog imagery. */
const GROUPS: Record<string, { image: string; group: string }> = {
  Chips: { image: snacks, group: 'Snacks' },
  Nachos: { image: snacks, group: 'Snacks' },
  'Bhujia & Mixtures': { image: snacks, group: 'Snacks' },
  'Rusks & Wafers': { image: pantry, group: 'Bakery & Breakfast' },
  Bread: { image: pantry, group: 'Bakery & Breakfast' },
  'Breakfast Cereals': { image: pantry, group: 'Bakery & Breakfast' },
  'Energy Bars': { image: pantry, group: 'Bakery & Breakfast' },
  Chocolate: { image: sweet, group: 'Sweet' },
  Biscuits: { image: sweet, group: 'Sweet' },
  Fruits: { image: fresh, group: 'Fresh' },
  'Dry Fruits': { image: fresh, group: 'Fresh' },
  'Fabric Conditioner': { image: home, group: 'Home Care' },
  'Detergent Powder & Bars': { image: home, group: 'Home Care' },
  'Dishwashing Gels': { image: home, group: 'Home Care' },
  Disinfectants: { image: home, group: 'Home Care' },
  'Body Moisturizer': { image: care, group: 'Personal Care' },
  'Bathing Soaps': { image: care, group: 'Personal Care' },
  'Hair Oil & Serum': { image: care, group: 'Personal Care' },
  'Oral Care': { image: care, group: 'Personal Care' },
  'Hand Wash': { image: care, group: 'Personal Care' },
  'Shampoo & Conditioner': { image: care, group: 'Personal Care' },
  'Feminine Care': { image: care, group: 'Personal Care' },
};

export const CATEGORY_GROUPS = ['Snacks', 'Sweet', 'Bakery & Breakfast', 'Fresh', 'Personal Care', 'Home Care'];

export function categoryGroup(category: string) {
  return GROUPS[category]?.group ?? 'Snacks';
}

export function categoryImage(category: string) {
  return GROUPS[category]?.image ?? snacks;
}

/**
 * SKU-named catalog shot served from /products (e.g. /products/CK-001-bingo-original-style.webp),
 * with the category still life as the deterministic fallback.
 */
export function productImage(product: Pick<Product, 'image_url' | 'category'>) {
  return {
    src: product.image_url ? `/products/${product.image_url}` : categoryImage(product.category),
    fallback: categoryImage(product.category),
  };
}

export type StockState = 'in-stock' | 'limited' | 'out-of-stock';

export function stockState(p: Product): StockState {
  if (p.stock_quantity <= 0) return 'out-of-stock';
  if (p.stock_quantity <= p.reorder_threshold) return 'limited';
  return 'in-stock';
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sku');
      if (error) throw error;
      return (data ?? []) as Product[];
    },
    staleTime: 30_000,
  });
}

export const inr = (n: number) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
