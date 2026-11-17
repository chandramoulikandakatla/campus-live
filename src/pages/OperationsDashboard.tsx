import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  UserCheck,
  Warehouse,
  Plus,
  Minus,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Search,
  DollarSign,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStore, type Order, type OrderStatus, mockProducts, categories } from '@/lib/store';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const nextStep: Partial<Record<OrderStatus, { status: OrderStatus; label: string; icon: typeof Package }>> = {
  placed: { status: 'packed', label: 'Mark packed', icon: Package },
  packed: { status: 'on-the-way', label: 'Dispatch to kiosk', icon: Package },
};

export default function OperationsDashboard() {
  const { orders, updateOrderStatus, walletTransactions, student } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'adjustments'>('orders');
  const [pickupCodes, setPickupCodes] = useState<Record<string, string>>({});
  const [showCompleted, setShowCompleted] = useState(false);

  // Inventory state
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryList, setInventoryList] = useState(mockProducts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Snacks & Namkeen',
    price: 50,
    stockQuantity: 25,
    unit: '1 pc'
  });

  // Manual Adjustment state
  const [adjStudentId, setAdjStudentId] = useState(student.studentId);
  const [adjType, setAdjType] = useState<'credit' | 'debit'>('credit');
  const [adjAmount, setAdjAmount] = useState('50');
  const [adjReason, setAdjReason] = useState('Kiosk dispenser sensor refund');
  const [operatorId, setOperatorId] = useState('OPS-ADMIN-04 (K. Chandra)');

  const operationalOrders = orders.filter(
    (order) =>
      order.status !== 'pending-approval' &&
      order.status !== 'cancelled' &&
      (showCompleted || order.status !== 'collected')
  );

  const update = (order: Order, status: OrderStatus) => {
    updateOrderStatus(order.id, status);
    toast.success(`${order.id} status updated to: ${status.replace('-', ' ')}`);
  };

  const handleStockDelta = (productId: string, delta: number) => {
    setInventoryList((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const current = item.stockQuantity ?? 25;
          const updated = Math.max(0, current + delta);
          return {
            ...item,
            stockQuantity: updated,
            availability: updated === 0 ? 'out-of-stock' : updated <= 5 ? 'limited' : 'in-stock'
          };
        }
        return item;
      })
    );
    toast.success('Inventory stock level updated.');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return toast.error('Enter product name');
    const createdProduct = {
      id: `PRD-${Date.now().toString().slice(-4)}`,
      sku: `CK-${Math.floor(100 + Math.random() * 900)}`,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: Number(newProduct.price) || 20,
      stockQuantity: Number(newProduct.stockQuantity) || 10,
      availability: 'in-stock' as const,
      unit: newProduct.unit || '1 pc',
      tags: ['new-arrival']
    };
    setInventoryList([createdProduct, ...inventoryList]);
    setShowAddModal(false);
    setNewProduct({ name: '', category: 'Snacks & Namkeen', price: 50, stockQuantity: 25, unit: '1 pc' });
    toast.success(`${createdProduct.name} enrolled into live catalog!`);
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(adjAmount);
    if (!val || val <= 0) return toast.error('Enter a valid amount');
    const isCredit = adjType === 'credit';
    const finalAmount = isCredit ? val : -val;

    // Use store method to add funds or transaction
    useStore.setState((s) => ({
      walletBalance: s.walletBalance + finalAmount,
      walletTransactions: [
        {
          id: `WT-ADJ-${Date.now().toString().slice(-6)}`,
          type: isCredit ? 'top-up' : 'purchase',
          amount: finalAmount,
          description: `[${operatorId}] Manual adjustment: ${adjReason}`,
          createdAt: new Date().toISOString()
        },
        ...s.walletTransactions
      ]
    }));

    toast.success(`₹${val} ${isCredit ? 'credited to' : 'debited from'} student wallet. Logged under audit.`);
  };

  const filteredInventory = inventoryList.filter((item) =>
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(inventorySearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="verified">Fulfilment & Operations Console</Badge>
            <h1 className="mt-3 font-display text-3xl font-bold">Campus Operations</h1>
            <p className="mt-1 text-muted-foreground">
              Live order fulfillment, real-time catalog stock control, and audited manual adjustments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('orders')}
            >
              Order Queue ({orders.filter((o) => o.status !== 'collected').length})
            </Button>
            <Button
              variant={activeTab === 'inventory' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('inventory')}
            >
              Inventory ({inventoryList.length})
            </Button>
            <Button
              variant={activeTab === 'adjustments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('adjustments')}
            >
              Wallet Audit
            </Button>
            <Link to="/rider">
              <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5 hover:bg-blue-500/10">
                <Truck className="w-3.5 h-3.5 mr-1" />
                Fleet Logistics
              </Button>
            </Link>
          </div>
        </div>

        {/* TAB 1: ORDER QUEUE */}
        {activeTab === 'orders' && (
          <div>
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Awaiting packing</p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {orders.filter((order) => order.status === 'placed').length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">In fulfilment / At kiosk</p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {orders.filter((order) => ['packed', 'on-the-way'].includes(order.status)).length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {orders.filter((order) => order.status === 'collected').length}
                </p>
              </Card>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Active Orders Queue</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted((value) => !value)}
              >
                {showCompleted ? 'Hide completed' : 'Show completed orders'}
              </Button>
            </div>

            {operationalOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <Warehouse className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
                <h2 className="font-display text-xl font-semibold">No orders in the queue</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create an order in the student storefront, then return here to process it.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {operationalOrders.map((order) => {
                  const action = nextStep[order.status];
                  return (
                    <Card key={order.id} className="p-5">
                      <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-lg font-semibold">{order.id}</h2>
                            <Badge variant="outline">{order.status.replace('-', ' ')}</Badge>
                            <span className="text-sm font-semibold">{money(order.total)}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.studentName} · {order.studentId} · {order.institution}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.hostel} · {order.deliverySlot}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {order.items.map((item) => (
                              <span
                                key={item.product.id}
                                className="rounded-lg bg-muted px-2 py-1 text-xs"
                              >
                                {item.product.name} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex min-w-[240px] flex-col justify-center gap-2">
                          {action && (
                            <Button onClick={() => update(order, action.status)}>
                              <action.icon className="mr-2 h-4 w-4" />
                              {action.label}
                            </Button>
                          )}
                          {order.status === 'on-the-way' && (
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                <UserCheck className="h-4 w-4 text-primary" /> Verify campus pickup
                              </p>
                              <p className="mb-2 text-xs text-muted-foreground">
                                Student OTP code is: <strong>{order.pickupCode}</strong>
                              </p>
                              <input
                                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-mono tracking-widest text-center uppercase"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={pickupCodes[order.id] ?? ''}
                                onChange={(event) =>
                                  setPickupCodes((previous) => ({
                                    ...previous,
                                    [order.id]: event.target.value.replace(/\D/g, '').slice(0, 6)
                                  }))
                                }
                              />
                              <Button
                                className="mt-2 w-full"
                                size="sm"
                                disabled={(pickupCodes[order.id] ?? '').length !== 6}
                                onClick={() => {
                                  if (pickupCodes[order.id] === order.pickupCode) {
                                    update(order, 'collected');
                                  } else toast.error('Pickup code does not match.');
                                }}
                              >
                                Confirm & Hand Over
                              </Button>
                            </div>
                          )}
                          {order.status === 'collected' && (
                            <p className="flex items-center gap-2 text-sm font-medium text-primary">
                              <CheckCircle2 className="h-4 w-4" /> Collection confirmed
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVENTORY & CATALOG */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search catalog by name, category, SKU..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Product to Catalog
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredInventory.map((item) => {
                const stock = item.stockQuantity ?? 25;
                const isLow = stock > 0 && stock <= 5;
                const isOut = stock === 0;

                return (
                  <Card key={item.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                            {item.sku || item.id}
                          </span>
                          <h3 className="mt-1 font-display font-semibold text-base">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <span className="font-display font-bold text-base">{money(item.price)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold ${
                            isOut
                              ? 'text-destructive'
                              : isLow
                              ? 'text-amber-500'
                              : 'text-emerald-600'
                          }`}
                        >
                          {isOut ? 'Out of stock' : isLow ? `Low stock (${stock})` : `In stock (${stock})`}
                        </span>
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          disabled={stock <= 0}
                          onClick={() => handleStockDelta(item.id, -1)}
                          title="Decrease 1 unit"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-xs font-mono font-bold">{stock}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleStockDelta(item.id, 5)}
                          title="Restock 5 units"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-6 shadow-2xl">
                  <h3 className="font-display text-lg font-bold">Add Product to Campus Catalog</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Item will appear in the student kiosk storefront immediately.
                  </p>

                  <form onSubmit={handleAddProduct} className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium">Product Name</label>
                      <Input
                        required
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g. Masala Roasted Almonds"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Category</label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium">Unit</label>
                        <Input
                          value={newProduct.unit}
                          onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                          placeholder="e.g. 100g or 1 pc"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Price (INR)</label>
                        <Input
                          type="number"
                          min="1"
                          required
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Initial Stock</label>
                        <Input
                          type="number"
                          min="0"
                          required
                          value={newProduct.stockQuantity}
                          onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex gap-2 justify-end">
                      <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Product</Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDITED WALLET ADJUSTMENT */}
        {activeTab === 'adjustments' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <Card className="p-6">
              <h2 className="font-display text-xl font-bold">Manual Wallet Adjustment</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Audited operator overrides for kiosk sensor failures, hardware jams, or cash reconciliation.
              </p>

              <form onSubmit={handleApplyAdjustment} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium">Student ID</label>
                  <Input
                    required
                    value={adjStudentId}
                    onChange={(e) => setAdjStudentId(e.target.value)}
                    placeholder="CK-2026-101"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Adjustment Type</label>
                    <div className="flex gap-1 mt-1">
                      <Button
                        type="button"
                        size="sm"
                        className="flex-1"
                        variant={adjType === 'credit' ? 'default' : 'outline'}
                        onClick={() => setAdjType('credit')}
                      >
                        Credit (+)
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="flex-1"
                        variant={adjType === 'debit' ? 'default' : 'outline'}
                        onClick={() => setAdjType('debit')}
                      >
                        Debit (-)
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Amount (INR)</label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium">Audit Reason / Justification</label>
                  <Input
                    required
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    placeholder="e.g. Kiosk coil dispenser jammed on item #PRD-004"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">Operator ID / Station</label>
                  <Input
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    placeholder="OPS-ADMIN-04"
                  />
                </div>

                <Button className="w-full mt-2" type="submit">
                  Record & Apply Adjustment
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-xl font-bold">Recent Adjustment & Transaction Ledger</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Live audit trail of all manual and automated debits/credits.
              </p>

              <div className="mt-4 space-y-3">
                {walletTransactions.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-muted/50 border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{tx.description}</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {new Date(tx.createdAt).toLocaleString('en-IN')} · Ref: {tx.id}
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-foreground'
                      }`}
                    >
                      {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          CampusKart Operations Console · Live pilot synchronization active across all kiosk terminals.
        </p>
      </main>
    </div>
  );
}
