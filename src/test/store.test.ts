import { describe, it, expect, beforeEach } from 'vitest';
import { useStore, mockProducts, inr, type Product, type Order } from '@/lib/store';

describe('useStore - Unified State Management', () => {
  beforeEach(() => {
    useStore.getState().resetDemo();
  });

  const sampleProduct: Product = {
    id: 'test-1',
    sku: 'CK-TEST-001',
    name: 'Test Snacks',
    price: 50,
    image: 'https://example.com/test.jpg',
    category: 'Snacks & Namkeen',
    availability: 'in-stock',
    stockQuantity: 20,
    reorderThreshold: 5,
    tags: ['healthy'],
    unit: '100g',
  };

  describe('Cart Operations', () => {
    it('starts with an empty cart', () => {
      expect(useStore.getState().cart).toEqual([]);
      expect(useStore.getState().getCartCount()).toBe(0);
      expect(useStore.getState().getCartTotal()).toBe(0);
    });

    it('adds a product to cart', () => {
      useStore.getState().addToCart(sampleProduct);
      const state = useStore.getState();

      expect(state.cart.length).toBe(1);
      expect(state.cart[0].product.id).toBe('test-1');
      expect(state.cart[0].quantity).toBe(1);
      expect(state.getCartCount()).toBe(1);
      expect(state.getCartTotal()).toBe(50);
      expect(state.getQuantityOf('test-1')).toBe(1);
    });

    it('increments quantity when adding the same product again', () => {
      useStore.getState().addToCart(sampleProduct);
      useStore.getState().addToCart(sampleProduct);
      const state = useStore.getState();

      expect(state.cart.length).toBe(1);
      expect(state.cart[0].quantity).toBe(2);
      expect(state.getCartCount()).toBe(2);
      expect(state.getCartTotal()).toBe(100);
      expect(state.getQuantityOf('test-1')).toBe(2);
    });

    it('updates quantity directly', () => {
      useStore.getState().addToCart(sampleProduct);
      useStore.getState().updateQuantity('test-1', 5);
      const state = useStore.getState();

      expect(state.cart[0].quantity).toBe(5);
      expect(state.getCartCount()).toBe(5);
      expect(state.getCartTotal()).toBe(250);
    });

    it('removes item when quantity is updated to 0 or less', () => {
      useStore.getState().addToCart(sampleProduct);
      useStore.getState().updateQuantity('test-1', 0);
      const state = useStore.getState();

      expect(state.cart.length).toBe(0);
      expect(state.getCartCount()).toBe(0);
    });

    it('removes item via removeFromCart', () => {
      useStore.getState().addToCart(sampleProduct);
      useStore.getState().removeFromCart('test-1');
      const state = useStore.getState();

      expect(state.cart.length).toBe(0);
      expect(state.getQuantityOf('test-1')).toBe(0);
    });

    it('clears all cart items', () => {
      useStore.getState().addToCart(sampleProduct);
      useStore.getState().addToCart({ ...sampleProduct, id: 'test-2', price: 30 });
      expect(useStore.getState().cart.length).toBe(2);

      useStore.getState().clearCart();
      expect(useStore.getState().cart.length).toBe(0);
      expect(useStore.getState().getCartCount()).toBe(0);
      expect(useStore.getState().getCartTotal()).toBe(0);
    });
  });

  describe('Wallet & Financial Ledger Invariants', () => {
    it('starts with default balance and initial top-up transaction', () => {
      const state = useStore.getState();
      expect(state.walletBalance).toBe(2500);
      expect(state.walletTransactions.length).toBeGreaterThanOrEqual(1);
      expect(state.walletTransactions[0].type).toBe('top-up');
    });

    it('adds funds and records top-up transaction', () => {
      useStore.getState().addFunds(1000);
      const state = useStore.getState();

      expect(state.walletBalance).toBe(3500);
      expect(state.walletTransactions[0].type).toBe('top-up');
      expect(state.walletTransactions[0].amount).toBe(1000);
    });

    it('debits wallet immediately on placed order', () => {
      const order: Order = {
        id: 'CK-ORDER-1',
        items: [{ product: sampleProduct, quantity: 2 }],
        total: 100,
        status: 'placed',
        createdAt: new Date().toISOString(),
        estimatedDelivery: '10:00 - 11:00 AM',
        studentName: 'Aarav Mehta',
        studentId: 'CK2026001',
        city: 'Hyderabad',
        institution: 'Hyderabad Campus',
        hostel: 'B-Block',
        paymentMethod: 'wallet',
        paymentStatus: 'paid',
        pickupCode: '123456',
      };

      useStore.getState().addOrder(order);
      const state = useStore.getState();

      expect(state.walletBalance).toBe(2400);
      expect(state.orders.length).toBe(1);
      expect(state.walletTransactions[0].type).toBe('purchase');
      expect(state.walletTransactions[0].amount).toBe(-100);
      expect(state.walletTransactions[0].orderId).toBe('CK-ORDER-1');
    });

    it('does NOT debit wallet when order is pending parent approval', () => {
      const pendingOrder: Order = {
        id: 'CK-ORDER-PENDING',
        items: [{ product: sampleProduct, quantity: 10 }],
        total: 500,
        status: 'pending-approval',
        createdAt: new Date().toISOString(),
        estimatedDelivery: '10:00 - 11:00 AM',
        studentName: 'Aarav Mehta',
        studentId: 'CK2026001',
        city: 'Hyderabad',
        institution: 'Hyderabad Campus',
        hostel: 'B-Block',
        paymentMethod: 'wallet',
        paymentStatus: 'pending',
        pickupCode: '654321',
      };

      useStore.getState().addOrder(pendingOrder);
      const state = useStore.getState();

      expect(state.walletBalance).toBe(2500);
      expect(state.orders[0].status).toBe('pending-approval');
    });

    it('debits wallet when parent approves pending order', () => {
      const pendingOrder: Order = {
        id: 'CK-APPROVE-ME',
        items: [{ product: sampleProduct, quantity: 5 }],
        total: 250,
        status: 'pending-approval',
        createdAt: new Date().toISOString(),
        estimatedDelivery: '10:00 - 11:00 AM',
        studentName: 'Aarav Mehta',
        studentId: 'CK2026001',
        city: 'Hyderabad',
        institution: 'Hyderabad Campus',
        hostel: 'B-Block',
        paymentMethod: 'wallet',
        paymentStatus: 'pending',
        pickupCode: '999888',
      };

      useStore.getState().addOrder(pendingOrder);
      expect(useStore.getState().walletBalance).toBe(2500);

      const approved = useStore.getState().approveOrder('CK-APPROVE-ME');
      expect(approved).toBe(true);

      const state = useStore.getState();
      expect(state.walletBalance).toBe(2250);
      expect(state.orders[0].status).toBe('placed');
      expect(state.orders[0].paymentStatus).toBe('paid');
      expect(state.walletTransactions[0].amount).toBe(-250);
    });

    it('rejects order by updating status to cancelled without debit', () => {
      const pendingOrder: Order = {
        id: 'CK-REJECT-ME',
        items: [{ product: sampleProduct, quantity: 5 }],
        total: 250,
        status: 'pending-approval',
        createdAt: new Date().toISOString(),
        estimatedDelivery: '10:00 - 11:00 AM',
        studentName: 'Aarav Mehta',
        studentId: 'CK2026001',
        city: 'Hyderabad',
        institution: 'Hyderabad Campus',
        hostel: 'B-Block',
        paymentMethod: 'wallet',
        paymentStatus: 'pending',
        pickupCode: '999888',
      };

      useStore.getState().addOrder(pendingOrder);
      useStore.getState().rejectOrder('CK-REJECT-ME');

      const state = useStore.getState();
      expect(state.orders[0].status).toBe('cancelled');
      expect(state.walletBalance).toBe(2500);
    });
  });

  describe('Parent Spending Limits', () => {
    it('updates parent spending limits', () => {
      useStore.getState().updateParentLimits({
        daily: 800,
        monthly: 8000,
        approvalAbove: 300,
      });

      const limits = useStore.getState().parentLimits;
      expect(limits.daily).toBe(800);
      expect(limits.monthly).toBe(8000);
      expect(limits.approvalAbove).toBe(300);
    });
  });

  describe('Catalog & Formatting Helpers', () => {
    it('formats Indian Rupee currency correctly', () => {
      expect(inr(0)).toBe('₹0');
      expect(inr(250)).toBe('₹250');
      expect(inr(1500)).toBe('₹1,500');
      expect(inr(100000)).toBe('₹1,00,000');
    });

    it('provides valid catalog products', () => {
      expect(mockProducts.length).toBeGreaterThan(50);
      const first = mockProducts[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('price');
      expect(first).toHaveProperty('sku');
      expect(first).toHaveProperty('stockQuantity');
    });
  });
});
