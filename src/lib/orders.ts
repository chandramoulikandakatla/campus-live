import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/lib/store';

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

/** Orders are stored only in this browser for the frontend demonstration. */
export function useOrders() {
  const orders = useStore((state) => state.orders);
  return useQuery({
    queryKey: ['orders', 'local-demo', orders.length],
    queryFn: async (): Promise<ShopOrder[]> => orders.map((order) => ({
      id: order.id,
      order_number: order.id,
      status: order.status,
      total: order.total,
      delivery_slot: order.deliverySlot ?? order.estimatedDelivery,
      created_at: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date(order.createdAt).toISOString(),
      items: order.items.map((item, index) => ({
        id: `${order.id}-${index}`,
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        sku: item.product.id,
        unit_price: item.product.price,
        quantity: item.quantity,
        line_total: item.product.price * item.quantity,
      })),
    })),
  });
}
