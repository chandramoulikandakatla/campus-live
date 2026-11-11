import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface ShopOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_slot: string;
  created_at: string;
  items: OrderItem[];
}

export function useOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<ShopOrder[]> => {
      if (!user) return [];

      const { data: orderRows, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, status, total, delivery_slot, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (ordersError) throw ordersError;

      const rows = orderRows ?? [];
      if (rows.length === 0) return [];

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, product_id, product_name, sku, unit_price, quantity, line_total')
        .in('order_id', rows.map((order) => order.id));
      if (itemsError) throw itemsError;

      return rows.map((order) => ({
        ...order,
        items: (items ?? []).filter((item) => item.order_id === order.id),
      }));
    },
  });
}