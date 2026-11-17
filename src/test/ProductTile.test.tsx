import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductTile } from '@/components/kiosk/ProductTile';
import { useStore, type Product } from '@/lib/store';

describe('ProductTile Component', () => {
  const inStockProduct: Product = {
    id: 'tile-p1',
    sku: 'CK-001',
    name: 'Masala Chips 50g',
    price: 30,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    category: 'Snacks & Namkeen',
    availability: 'in-stock',
    stockQuantity: 15,
    reorderThreshold: 5,
    tags: ['healthy'],
    unit: '50g',
  };

  const outOfStockProduct: Product = {
    id: 'tile-p2',
    sku: 'CK-002',
    name: 'Sold Out Drink',
    price: 60,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
    category: 'Beverages',
    availability: 'out-of-stock',
    stockQuantity: 0,
    reorderThreshold: 5,
    tags: [],
    unit: '250ml',
  };

  beforeEach(() => {
    useStore.getState().resetDemo();
  });

  it('renders product details correctly', () => {
    render(<ProductTile product={inStockProduct} />);

    expect(screen.getByText('Masala Chips 50g')).toBeInTheDocument();
    expect(screen.getByText('50g')).toBeInTheDocument();
    expect(screen.getByText('₹30')).toBeInTheDocument();
    expect(screen.getByText('CK-001')).toBeInTheDocument();
    expect(screen.getByText('In stock')).toBeInTheDocument();
  });

  it('adds product to cart when Add button is clicked', () => {
    render(<ProductTile product={inStockProduct} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    expect(useStore.getState().getQuantityOf('tile-p1')).toBe(1);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('increments and decrements quantity', () => {
    render(<ProductTile product={inStockProduct} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    const plusButton = screen.getByLabelText(/increase quantity/i);
    fireEvent.click(plusButton);
    expect(useStore.getState().getQuantityOf('tile-p1')).toBe(2);

    const minusButton = screen.getByLabelText(/decrease quantity/i);
    fireEvent.click(minusButton);
    expect(useStore.getState().getQuantityOf('tile-p1')).toBe(1);
  });

  it('displays unavailable when product is out of stock', () => {
    render(<ProductTile product={outOfStockProduct} />);

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
  });

  it('enforces parent restriction badge and disables add if category is prohibited', () => {
    // Restrict 'Beverages' category in parent limits
    useStore.getState().updateParentLimits({
      categories: ['Snacks & Namkeen'], // only snacks allowed
    });

    const beverageProduct: Product = {
      id: 'bev-1',
      sku: 'CK-BEV-1',
      name: 'Cold Coffee Can',
      price: 45,
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
      category: 'Beverages',
      availability: 'in-stock',
      stockQuantity: 10,
      reorderThreshold: 5,
      tags: [],
      unit: '200ml',
    };

    render(<ProductTile product={beverageProduct} />);

    expect(screen.getByText('Parent restricted')).toBeInTheDocument();
    expect(screen.getAllByText(/restricted/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('button', { name: /^add$/i })).not.toBeInTheDocument();
  });
});
