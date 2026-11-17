import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '@/pages/Cart';
import { useStore, type Product } from '@/lib/store';

describe('Cart Page & Checkout Invariants', () => {
  const sampleItem: Product = {
    id: 'cart-p1',
    sku: 'CK-001',
    name: 'Fresh Apples 4pcs',
    price: 120,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    category: 'Fruits & Fresh',
    availability: 'in-stock',
    stockQuantity: 10,
    reorderThreshold: 5,
    tags: ['healthy'],
    unit: '4 pcs',
  };

  beforeEach(() => {
    useStore.getState().resetDemo();
  });

  it('renders empty cart view when no items are added', () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse products/i })).toBeInTheDocument();
  });

  it('renders cart line items and order summary', () => {
    useStore.getState().addToCart(sampleItem);
    useStore.getState().addToCart(sampleItem);

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    expect(screen.getByText('Your cart')).toBeInTheDocument();
    expect(screen.getByText('Fresh Apples 4pcs')).toBeInTheDocument();
    expect(screen.getAllByText('₹240').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2 units · review before checkout/i)).toBeInTheDocument();
  });

  it('places order directly when within all limits and below threshold', () => {
    useStore.getState().addToCart(sampleItem); // 120 INR <= 400 INR approval threshold

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    const placeOrderBtn = screen.getByRole('button', { name: /place demo order/i });
    fireEvent.click(placeOrderBtn);

    // Should confirm order immediately
    expect(screen.getByText('Your order is in!')).toBeInTheDocument();
    expect(useStore.getState().orders.length).toBe(1);
    expect(useStore.getState().orders[0].status).toBe('placed');
    expect(useStore.getState().cart.length).toBe(0);
  });

  it('requires parent approval when total exceeds approval threshold', () => {
    // Add 4 units = 480 INR > 400 INR approval threshold
    useStore.getState().addToCart(sampleItem);
    useStore.getState().updateQuantity('cart-p1', 4);

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    expect(screen.getByText(/parent approval required/i)).toBeInTheDocument();

    const requestApprovalBtn = screen.getByRole('button', { name: /request parent approval/i });
    fireEvent.click(requestApprovalBtn);

    expect(screen.getByText('A quick parent check')).toBeInTheDocument();
    expect(useStore.getState().orders[0].status).toBe('pending-approval');
  });

  it('blocks order placement when restricted categories exist in cart', () => {
    useStore.getState().addToCart({
      ...sampleItem,
      category: 'Prohibited Category',
    });

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    expect(screen.getByText(/restricted categories/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /place demo order|request parent approval/i });
    expect(button).toBeDisabled();
  });
});
