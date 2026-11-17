import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuery } from '@tanstack/react-query';

import snacks from '@/assets/cat-snacks.jpg';
import sweet from '@/assets/cat-sweet.jpg';
import pantry from '@/assets/cat-pantry.jpg';
import home from '@/assets/cat-home.jpg';
import care from '@/assets/cat-care.jpg';
import fresh from '@/assets/cat-fresh.jpg';

import {
  EcosystemState,
  PortalType,
  StudentScreenType,
  ParentScreenType,
  OpsScreenType,
  CollegeScreenType,
  Student,
  Product as EcoProduct,
  Order as EcoOrder,
  OrderLineItem,
  Transaction as EcoTransaction,
  Notification,
  SpendingControl,
  ToastInfo,
  FundingReceipt
} from '../types/ecosystem';
import { INITIAL_STATE, ORDER_STATUS_STEPS } from './initialData';

// Unified Product type covering both legacy attributes and new ecosystem attributes
export interface Product {
  id: string;
  sku?: string;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string | null;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  availability?: 'in-stock' | 'limited' | 'out-of-stock';
  stockQuantity?: number;
  stock?: number;
  reorderThreshold?: number;
  tags?: string[];
  unit?: string;
  description?: string;
  isActive?: boolean;
  active?: boolean;
  featured?: boolean;
  frequent?: boolean;
  offerTag?: string;
}

// Unified Cart Item covering both .product & .productId, and .quantity & .qty
export interface CartItem {
  product: Product;
  quantity: number;
  productId: string;
  qty: number;
}
export type CartLine = CartItem;
export type CartLineItem = CartItem;

export type OrderStatus =
  | 'pending-approval'
  | 'placed'
  | 'packed'
  | 'on-the-way'
  | 'collected'
  | 'cancelled'
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Accepted'
  | 'Preparing'
  | 'Ready for Collection'
  | 'Completed';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  totalAmount?: number;
  status: OrderStatus;
  createdAt: string;
  date?: string;
  month?: string;
  estimatedDelivery?: string;
  deliverySlot?: string;
  studentName: string;
  studentId: string;
  city?: string;
  institution?: string;
  hostel?: string;
  paymentMethod: string;
  paymentStatus: string;
  txnRef?: string;
  fulfilmentMethod?: string;
  collectionPoint?: string;
  estimatedTime?: string;
  previousBalance?: number;
  remainingBalance?: number;
  pickupCode: string;
  note?: string;
}

export interface StudentProfile {
  fullName: string;
  studentId: string;
  city: string;
  institution: string;
  hostel: string;
  parentName: string;
  parentContact: string;
}

export interface WalletTransaction {
  id: string;
  type: 'top-up' | 'purchase' | 'refund' | 'adjustment' | string;
  amount: number;
  description: string;
  createdAt: string;
  orderId?: string;
  studentId?: string;
  category?: string;
  previousBalance?: number;
  newBalance?: number;
  timestamp?: string;
  month?: string;
  status?: string;
  method?: string;
  relatedOrderId?: string | null;
  note?: string;
  reconciled?: boolean;
}

export interface ParentLimits {
  daily: number;
  monthly: number;
  categories: string[];
  approvalAbove: number;
  timeRestrictionEnabled: boolean;
  allowedFrom: string;
  allowedUntil: string;
}

export interface AppStore {
  // Shared Ecosystem State (single source of truth)
  ecosystem: EcosystemState;
  activePortal: PortalType;
  setActivePortal: (portal: PortalType) => void;

  // Global UI & Notifications
  toast: ToastInfo | null;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
  clearToast: () => void;
  showDemoModal: boolean;
  setShowDemoModal: (show: boolean) => void;
  receiptModalOrder: EcoOrder | null;
  setReceiptModalOrder: (order: EcoOrder | null) => void;
  resetDemoData: () => void;

  // Student Portal State
  studentScreen: StudentScreenType;
  setStudentScreen: (screen: StudentScreenType) => void;
  loggedStudentId: string;
  setLoggedStudentId: (id: string) => void;
  getCurrentStudent: () => Student;
  studentAuthed: boolean;
  setStudentAuthed: (authed: boolean) => void;
  credIdInput: string;
  setCredIdInput: (val: string) => void;
  credPassInput: string;
  setCredPassInput: (val: string) => void;
  credError: string;
  setCredError: (val: string) => void;
  pinInput: string;
  setPinInput: (val: string) => void;
  pinError: string;
  setPinError: (val: string) => void;
  pendingStudent: Student | null;
  setPendingStudent: (student: Student | null) => void;
  validateStudentCredentials: () => boolean;
  verifyStudentPin: () => boolean;
  logoutStudent: () => void;

  // Student Catalog & Cart
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  detailQty: number;
  setDetailQty: (qty: number) => void;
  recentlyViewed: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, delta: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  getQuantityOf: (productId: string) => number;
  quantityOf: (productId: string) => number;

  // Student Checkout & Payment
  checkoutPoint: string;
  setCheckoutPoint: (point: string) => void;
  checkoutMethod: string;
  setCheckoutMethod: (method: string) => void;
  studentPinVerify: string;
  setStudentPinVerify: (pin: string) => void;
  studentPinVerifyError: string;
  setStudentPinVerifyError: (err: string) => void;
  isProcessingPayment: boolean;
  paymentProcessingStep: number;
  simulateFailureMode: boolean;
  setSimulateFailureMode: (simulate: boolean) => void;
  confirmedOrder: EcoOrder | null;
  setConfirmedOrder: (order: EcoOrder | null) => void;
  trackingOrderId: string;
  setTrackingOrderId: (id: string) => void;
  executeStudentPayment: () => Promise<boolean>;
  reorder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;

  // Parent Portal State
  parentScreen: ParentScreenType;
  setParentScreen: (screen: ParentScreenType) => void;
  parentAuthed: boolean;
  setParentAuthed: (authed: boolean) => void;
  parentLookupStudentId: string;
  setParentLookupStudentId: (id: string) => void;
  parentPinInput: string;
  setParentPinInput: (pin: string) => void;
  parentAuthError: string;
  setParentAuthError: (err: string) => void;
  linkedStudentId: string;
  setLinkedStudentId: (id: string) => void;
  loginParent: () => boolean;
  logoutParent: () => void;

  // Parent Funding
  fundAmount: number;
  setFundAmount: (amount: number) => void;
  customFundInput: string;
  setCustomFundInput: (val: string) => void;
  fundingMethod: string;
  setFundingMethod: (method: string) => void;
  parentPayStep: number;
  setParentPayStep: (step: number) => void;
  isProcessingFunding: boolean;
  lastFundingReceipt: FundingReceipt | null;
  setLastFundingReceipt: (receipt: FundingReceipt | null) => void;
  executeParentFunding: () => Promise<FundingReceipt | null>;

  // Parent Controls & Filtering
  parentTxnFilter: string;
  setParentTxnFilter: (filter: string) => void;
  parentDateRange: string;
  setParentDateRange: (range: string) => void;
  updateSpendingControls: (studentId: string, controls: Partial<SpendingControl>) => void;
  markNotificationRead: (id: string) => void;

  // Operations Dashboard
  opsScreen: OpsScreenType;
  setOpsScreen: (screen: OpsScreenType) => void;
  opsOrderFilter: string;
  setOpsOrderFilter: (filter: string) => void;
  advanceOrderStatus: (orderId: string, pickupCode?: string) => { success: boolean; message: string };
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  addProduct: (product: Omit<EcoProduct, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<EcoProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  executeManualAdjustment: (studentId: string, type: string, amount: number, reason: string, operator: string) => void;
  enrollStudent: (studentData: { name: string; academicYear: string; parentName: string; initialWallet: number }) => void;
  toggleStudentStatus: (studentId: string) => void;

  // College Admin Dashboard
  collegeScreen: CollegeScreenType;
  setCollegeScreen: (screen: CollegeScreenType) => void;

  // Legacy state and methods
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  parentLimits: ParentLimits;
  student: StudentProfile;
  orders: Order[];
  selectedCampus: string;
  selectedInstitution: string;
  selectedHostel: string;
  updateStudent: (profile: Partial<StudentProfile>) => void;
  setSelectedCampus: (city: string) => void;
  setSelectedInstitution: (institution: string) => void;
  setSelectedHostel: (hostel: string) => void;
  addFunds: (amount: number) => void;
  updateParentLimits: (limits: Partial<ParentLimits>) => void;
  resetDemo: () => void;
  addOrder: (order: Order) => void;
  approveOrder: (orderId: string) => boolean;
  rejectOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus | string) => void;
}

const defaultStudentProfile: StudentProfile = {
  fullName: 'Aarav Mehta',
  studentId: 'CK2026001',
  city: 'Hyderabad',
  institution: 'Sri Chaitanya & Narayana Junior Academy',
  hostel: 'B-Block Hostel',
  parentName: 'Rajesh Mehta',
  parentContact: '+91 98XXXXXX24'
};

const defaultLimits: ParentLimits = {
  daily: 500,
  monthly: 5000,
  approvalAbove: 400,
  timeRestrictionEnabled: true,
  allowedFrom: '06:00',
  allowedUntil: '23:00',
  categories: [
    'Food and Snacks',
    'Beverages',
    'Personal Care',
    'Daily Essentials',
    'Academic Supplies',
    'Other Services',
    'Snacks & Namkeen',
    'Biscuits & Cookies',
    'Fruits & Fresh',
    'Chocolates',
    'Emergency',
    'Stationery'
  ]
};

const makeWalletTransaction = (
  type: string,
  amount: number,
  description: string,
  orderId?: string
): WalletTransaction => ({
  id: `WT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  amount,
  description,
  createdAt: new Date().toISOString(),
  orderId
});

const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
const simDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, isTestEnv ? 0 : ms));

export const inr = (n: number) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ecosystem: INITIAL_STATE,
      activePortal: 'student',
      setActivePortal: (portal) => set({ activePortal: portal }),

      // Modals & Toast
      toast: null,
      showToast: (title, message, type = 'info') => {
        set({ toast: { id: Date.now(), title, message, type } });
      },
      clearToast: () => set({ toast: null }),
      showDemoModal: false,
      setShowDemoModal: (show) => set({ showDemoModal: show }),
      receiptModalOrder: null,
      setReceiptModalOrder: (order) => set({ receiptModalOrder: order }),

      resetDemoData: () => {
        set({
          ecosystem: INITIAL_STATE,
          cart: [],
          selectedProductId: null,
          detailQty: 1,
          recentlyViewed: ['PRD-001', 'PRD-003', 'PRD-005'],
          searchQuery: '',
          selectedCategory: 'All',
          selectedSort: 'featured',
          loggedStudentId: 'CK-2026-101',
          studentAuthed: true,
          studentScreen: 'home',
          parentAuthed: true,
          parentScreen: 'dashboard',
          linkedStudentId: 'CK-2026-101',
          walletBalance: 2500,
          orders: [],
          walletTransactions: [makeWalletTransaction('top-up', 2500, 'Opening demo wallet allocation')]
        });
        get().showToast('Ecosystem Reset', 'Seeded demo state restored across all 4 applications.', 'success');
      },

      // Student Auth State
      studentScreen: 'welcome',
      setStudentScreen: (screen) => set({ studentScreen: screen }),
      loggedStudentId: 'CK-2026-101',
      setLoggedStudentId: (id) => set({ loggedStudentId: id }),
      getCurrentStudent: () => {
        const { ecosystem, loggedStudentId } = get();
        return ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
      },
      studentAuthed: false,
      setStudentAuthed: (authed) => set({ studentAuthed: authed }),
      credIdInput: 'CK-2026-101',
      setCredIdInput: (val) => set({ credIdInput: val }),
      credPassInput: 'PASS101',
      setCredPassInput: (val) => set({ credPassInput: val }),
      credError: '',
      setCredError: (val) => set({ credError: val }),
      pinInput: '',
      setPinInput: (val) => set({ pinInput: val }),
      pinError: '',
      setPinError: (val) => set({ pinError: val }),
      pendingStudent: null,
      setPendingStudent: (student) => set({ pendingStudent: student }),

      validateStudentCredentials: () => {
        const { credIdInput, credPassInput, ecosystem } = get();
        const trimmedId = credIdInput.trim().toUpperCase();
        const student = ecosystem.students.find((s) => s.id.toUpperCase() === trimmedId);

        if (!student) {
          set({ credError: 'Student ID not found in CampusKart registry. Try CK-2026-101.' });
          return false;
        }
        if (student.institution !== ecosystem.college.name) {
          set({ credError: 'Account does not belong to this participating institution.' });
          return false;
        }
        if (student.status !== 'Active') {
          set({ credError: `Account ${student.id} (${student.name}) is currently Inactive. Contact Operations.` });
          return false;
        }
        if (student.password !== credPassInput.trim()) {
          set({ credError: 'Invalid student access password. Demo password for CK-2026-101 is PASS101.' });
          return false;
        }

        set({
          pendingStudent: student,
          pinInput: '',
          pinError: '',
          credError: '',
          studentScreen: 'pin'
        });
        return true;
      },

      verifyStudentPin: () => {
        const { pendingStudent, pinInput } = get();
        if (!pendingStudent) return false;
        if (pinInput.trim() !== pendingStudent.pin) {
          set({ pinError: `Incorrect 4-digit PIN. Demo PIN for ${pendingStudent.firstName} is ${pendingStudent.pin}.` });
          return false;
        }

        set({
          loggedStudentId: pendingStudent.id,
          studentAuthed: true,
          pinError: '',
          studentScreen: 'home',
          walletBalance: pendingStudent.walletBalance
        });
        get().showToast('Session Established', `Welcome back, ${pendingStudent.name}!`, 'success');
        return true;
      },

      logoutStudent: () => {
        set({
          studentAuthed: false,
          studentScreen: 'welcome',
          pinInput: '',
          credError: '',
          pinError: '',
          pendingStudent: null
        });
        get().showToast('Logged Out', 'Student session terminated securely.', 'info');
      },

      // Catalog & Cart
      selectedProductId: null,
      setSelectedProductId: (id) => set({ selectedProductId: id }),
      detailQty: 1,
      setDetailQty: (qty) => set({ detailQty: qty }),
      recentlyViewed: ['PRD-001', 'PRD-003', 'PRD-005'],
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      selectedCategory: 'All',
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      selectedSort: 'featured',
      setSelectedSort: (sort) => set({ selectedSort: sort }),
      cart: [],

      addToCart: (product, qtyToAdd = 1) => {
        const state = get();
        const existing = state.cart.find((c) => c.product.id === product.id || c.productId === product.id);
        const currentQty = existing ? existing.quantity : 0;
        const newQty = currentQty + qtyToAdd;

        if (existing) {
          set({
            cart: state.cart.map((c) =>
              c.product.id === product.id || c.productId === product.id
                ? { ...c, quantity: newQty, qty: newQty }
                : c
            )
          });
        } else {
          const item: CartItem = {
            product,
            quantity: qtyToAdd,
            productId: product.id,
            qty: qtyToAdd
          };
          set({ cart: [...state.cart, item] });
        }
        get().showToast('Added to Cart', `${qtyToAdd}x ${product.name} added to your CampusKart bag.`, 'success');
      },

      updateCartQty: (productId, delta) => {
        const state = get();
        set({
          cart: state.cart
            .map((item) => {
              if (item.product.id !== productId && item.productId !== productId) return item;
              const next = item.quantity + delta;
              return { ...item, quantity: next, qty: next };
            })
            .filter((item) => item.quantity > 0)
        });
      },

      updateQuantity: (productId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          set({ cart: state.cart.filter((item) => item.product.id !== productId && item.productId !== productId) });
        } else {
          set({
            cart: state.cart.map((item) =>
              item.product.id === productId || item.productId === productId
                ? { ...item, quantity, qty: quantity }
                : item
            )
          });
        }
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((c) => c.product.id !== productId && c.productId !== productId)
        }));
      },

      clearCart: () => set({ cart: [] }),

      getCartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getQuantityOf: (productId: string) => {
        return get().cart.find((c) => c.product.id === productId || c.productId === productId)?.quantity ?? 0;
      },

      quantityOf: (productId: string) => {
        return get().cart.find((c) => c.product.id === productId || c.productId === productId)?.quantity ?? 0;
      },

      // Checkout
      checkoutPoint: 'Block A — Ground Floor Smart Kiosk #1',
      setCheckoutPoint: (point) => set({ checkoutPoint: point }),
      checkoutMethod: 'CampusKart Wallet',
      setCheckoutMethod: (method) => set({ checkoutMethod: method }),
      studentPinVerify: '',
      setStudentPinVerify: (pin) => set({ studentPinVerify: pin }),
      studentPinVerifyError: '',
      setStudentPinVerifyError: (err) => set({ studentPinVerifyError: err }),
      isProcessingPayment: false,
      paymentProcessingStep: 1,
      simulateFailureMode: false,
      setSimulateFailureMode: (simulate) => set({ simulateFailureMode: simulate }),
      confirmedOrder: null,
      setConfirmedOrder: (order) => set({ confirmedOrder: order }),
      trackingOrderId: 'ORD-2026-8803',
      setTrackingOrderId: (id) => set({ trackingOrderId: id }),

      executeStudentPayment: async () => {
        const state = get();
        const { ecosystem, loggedStudentId, cart, checkoutPoint, simulateFailureMode } = state;
        const currentStudent = ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
        const controls = ecosystem.spendingControls[currentStudent.id] || INITIAL_STATE.spendingControls['CK-2026-101'];

        const populated: OrderLineItem[] = cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          category: item.product.category,
          price: item.product.price,
          qty: item.quantity,
          subtotal: item.product.price * item.quantity
        }));

        const totalAmount = populated.reduce((acc, i) => acc + i.subtotal, 0);

        if (currentStudent.status !== 'Active') {
          get().showToast('Account Inactive', 'Your student account is restricted. Contact operations.', 'error');
          return false;
        }

        if (controls.restrictedCategories && controls.restrictedCategories.length > 0) {
          const restricted = populated.find((it) => controls.restrictedCategories.includes(it.category));
          if (restricted) {
            get().showToast('Category Restricted', `Parent spending controls forbid purchasing "${restricted.category}".`, 'error');
            return false;
          }
        }

        const todaySpend = ecosystem.transactions
          .filter((t) => t.studentId === currentStudent.id && t.type === 'Student Purchase' && t.timestamp.startsWith('2026-11-16'))
          .reduce((acc, t) => acc + Math.abs(t.amount), 0);

        if (controls.dailyLimitEnabled && todaySpend + totalAmount > controls.dailyLimit) {
          get().showToast('Daily Limit Exceeded', `Purchase exceeds remaining daily limit.`, 'error');
          return false;
        }

        if (currentStudent.walletBalance < totalAmount) {
          get().showToast('Insufficient Balance', `Wallet balance is insufficient.`, 'error');
          return false;
        }

        set({ isProcessingPayment: true, paymentProcessingStep: 1, studentScreen: 'payment_processing' });

        await simDelay(1500);
        set({ paymentProcessingStep: 2 });

        await simDelay(1800);
        set({ paymentProcessingStep: 3 });

        await simDelay(1500);

        if (simulateFailureMode) {
          set({ isProcessingPayment: false, studentScreen: 'payment_method' });
          get().showToast('Payment Failed (Simulated)', 'Kiosk gateway transaction rejected.', 'error');
          return false;
        }

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newOrderId = `ORD-2026-${Math.floor(8800 + Math.random() * 900)}`;
        const newTxnId = `TXN-CK-${Math.floor(90000 + Math.random() * 9000)}`;
        const pickupCode = String(Math.floor(100000 + Math.random() * 900000));
        const previousBalance = currentStudent.walletBalance;
        const remainingBalance = previousBalance - totalAmount;

        const newOrder: EcoOrder = {
          id: newOrderId,
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          date: dateStr,
          month: 'Nov 2026',
          items: populated,
          totalAmount,
          paymentStatus: 'Paid via CampusKart Wallet',
          txnRef: newTxnId,
          fulfilmentMethod: 'Campus Kiosk Pickup',
          collectionPoint: checkoutPoint,
          estimatedTime: 'Ready in 5-10 mins',
          status: 'Order Placed',
          previousBalance,
          remainingBalance,
          pickupCode
        };

        const newTxn: EcoTransaction = {
          id: newTxnId,
          studentId: currentStudent.id,
          type: 'Student Purchase',
          category: populated[0]?.category || 'Daily Essentials',
          amount: -totalAmount,
          previousBalance,
          newBalance: remainingBalance,
          timestamp: dateStr,
          month: 'Nov 2026',
          status: 'Completed',
          method: 'CampusKart Wallet',
          relatedOrderId: newOrderId,
          note: `${populated.map((i) => `${i.qty}x ${i.name}`).join(', ')}`,
          reconciled: true
        };

        const newNotif: Notification = {
          id: `NOTIF-${Date.now()}`,
          target: 'both',
          studentId: currentStudent.id,
          title: 'Order Placed Successfully',
          message: `Order ${newOrderId} (₹${totalAmount}) placed at ${checkoutPoint}. Pickup OTP: ${pickupCode}`,
          time: 'Just now',
          type: 'order',
          read: false
        };

        const updatedProducts = ecosystem.products.map((p) => {
          const match = populated.find((it) => it.productId === p.id);
          if (match) {
            return { ...p, stock: Math.max(0, p.stock - match.qty) };
          }
          return p;
        });

        const updatedStudents = ecosystem.students.map((s) => {
          if (s.id === currentStudent.id) {
            return { ...s, walletBalance: remainingBalance };
          }
          return s;
        });

        set({
          ecosystem: {
            ...ecosystem,
            products: updatedProducts,
            students: updatedStudents,
            orders: [newOrder, ...ecosystem.orders],
            transactions: [newTxn, ...ecosystem.transactions],
            notifications: [newNotif, ...ecosystem.notifications]
          },
          cart: [],
          isProcessingPayment: false,
          confirmedOrder: newOrder,
          trackingOrderId: newOrderId,
          studentScreen: 'order_confirmation',
          walletBalance: remainingBalance
        });

        get().showToast('Payment Completed', `₹${totalAmount} debited. Order ${newOrderId} registered!`, 'success');
        return true;
      },

      reorder: (orderId) => {
        const { ecosystem } = get();
        const order = ecosystem.orders.find((o) => o.id === orderId);
        if (!order) return;
        const newCart: CartItem[] = [];
        order.items.forEach((it) => {
          const p = ecosystem.products.find((prod) => prod.id === it.productId);
          if (p && p.active && p.stock > 0) {
            newCart.push({
              product: p,
              quantity: Math.min(it.qty, p.stock),
              productId: p.id,
              qty: Math.min(it.qty, p.stock)
            });
          }
        });
        if (newCart.length > 0) {
          set({ cart: newCart, studentScreen: 'cart' });
          get().showToast('Reorder Created', 'Items from previous order loaded into your bag.', 'success');
        }
      },

      cancelOrder: (orderId) => {
        const { ecosystem } = get();
        const order = ecosystem.orders.find((o) => o.id === orderId);
        if (!order || order.status === 'Completed' || order.status === 'Cancelled') return;

        const updatedOrders = ecosystem.orders.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o));
        set({ ecosystem: { ...ecosystem, orders: updatedOrders } });
        get().showToast('Order Cancelled', `Order ${orderId} cancelled.`, 'info');
      },

      // Parent Portal
      parentScreen: 'welcome',
      setParentScreen: (screen) => set({ parentScreen: screen }),
      parentAuthed: false,
      setParentAuthed: (authed) => set({ parentAuthed: authed }),
      parentLookupStudentId: 'CK-2026-101',
      setParentLookupStudentId: (id) => set({ parentLookupStudentId: id }),
      parentPinInput: '9999',
      setParentPinInput: (pin) => set({ parentPinInput: pin }),
      parentAuthError: '',
      setParentAuthError: (err) => set({ parentAuthError: err }),
      linkedStudentId: 'CK-2026-101',
      setLinkedStudentId: (id) => set({ linkedStudentId: id }),

      loginParent: () => {
        const { ecosystem, parentLookupStudentId, parentPinInput } = get();
        const trimmed = parentLookupStudentId.trim().toUpperCase();
        const student = ecosystem.students.find((s) => s.id.toUpperCase() === trimmed);

        if (!student) {
          set({ parentAuthError: 'Student ID not recognized. Try CK-2026-101 or CK-2026-102.' });
          return false;
        }
        if (student.parentPin !== parentPinInput.trim()) {
          set({ parentAuthError: `Invalid Parent PIN for ${student.parentName}. Demo PIN is ${student.parentPin}.` });
          return false;
        }

        set({
          parentAuthed: true,
          linkedStudentId: student.id,
          parentAuthError: '',
          parentScreen: 'dashboard'
        });
        get().showToast('Parent Session Authenticated', `Linked to ${student.name} (${student.id})`, 'success');
        return true;
      },

      logoutParent: () => {
        set({ parentAuthed: false, parentScreen: 'welcome', parentAuthError: '' });
        get().showToast('Parent Session Closed', 'You have been logged out safely.', 'info');
      },

      // Parent Funding
      fundAmount: 1000,
      setFundAmount: (amount) => set({ fundAmount: amount }),
      customFundInput: '1000',
      setCustomFundInput: (val) => set({ customFundInput: val }),
      fundingMethod: 'UPI',
      setFundingMethod: (method) => set({ fundingMethod: method }),
      parentPayStep: 1,
      setParentPayStep: (step) => set({ parentPayStep: step }),
      isProcessingFunding: false,
      lastFundingReceipt: null,
      setLastFundingReceipt: (receipt) => set({ lastFundingReceipt: receipt }),

      executeParentFunding: async () => {
        const { ecosystem, linkedStudentId, fundAmount, fundingMethod, walletBalance } = get();
        const student = ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];

        if (fundAmount <= 0) return null;

        set({ isProcessingFunding: true, parentPayStep: 1, parentScreen: 'funding_processing' });
        await simDelay(1500);
        set({ parentPayStep: 2 });
        await simDelay(1800);
        set({ parentPayStep: 3 });
        await simDelay(1500);

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newTxnId = `TXN-CK-${Math.floor(92000 + Math.random() * 7000)}`;
        const prevBal = student.walletBalance;
        const newBal = prevBal + fundAmount;

        const newTxn: EcoTransaction = {
          id: newTxnId,
          studentId: student.id,
          type: 'Wallet Funding',
          category: 'Parent Top-Up',
          amount: fundAmount,
          previousBalance: prevBal,
          newBalance: newBal,
          timestamp: dateStr,
          month: 'Nov 2026',
          status: 'Completed',
          method: `${fundingMethod} (Parent Authorized)`,
          relatedOrderId: null,
          note: `Parent top-up by ${student.parentName}`,
          reconciled: true
        };

        const updatedStudents = ecosystem.students.map((s) => (s.id === student.id ? { ...s, walletBalance: newBal } : s));

        const receipt: FundingReceipt = {
          txnId: newTxnId,
          studentName: student.name,
          studentId: student.id,
          amount: fundAmount,
          method: fundingMethod,
          timestamp: dateStr,
          previousBalance: prevBal,
          newBalance: newBal
        };

        set({
          ecosystem: {
            ...ecosystem,
            students: updatedStudents,
            transactions: [newTxn, ...ecosystem.transactions]
          },
          isProcessingFunding: false,
          lastFundingReceipt: receipt,
          parentScreen: 'funding_success',
          walletBalance: walletBalance + fundAmount,
          walletTransactions: [makeWalletTransaction('top-up', fundAmount, 'Parent wallet top-up'), ...get().walletTransactions]
        });

        get().showToast('Wallet Funded', `₹${fundAmount} added to ${student.firstName}'s wallet!`, 'success');
        return receipt;
      },

      parentTxnFilter: 'All',
      setParentTxnFilter: (filter) => set({ parentTxnFilter: filter }),
      parentDateRange: 'All Time',
      setParentDateRange: (range) => set({ parentDateRange: range }),

      updateSpendingControls: (studentId, controlsUpdate) => {
        const { ecosystem } = get();
        const current = ecosystem.spendingControls[studentId] || INITIAL_STATE.spendingControls['CK-2026-101'];
        set({
          ecosystem: {
            ...ecosystem,
            spendingControls: { ...ecosystem.spendingControls, [studentId]: { ...current, ...controlsUpdate } }
          }
        });
        get().showToast('Spending Controls Saved', `Rules updated for ${studentId}.`, 'success');
      },

      markNotificationRead: (id) => {
        const { ecosystem } = get();
        set({
          ecosystem: {
            ...ecosystem,
            notifications: ecosystem.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
          }
        });
      },

      // Operations
      opsScreen: 'overview',
      setOpsScreen: (screen) => set({ opsScreen: screen }),
      opsOrderFilter: 'All',
      setOpsOrderFilter: (filter) => set({ opsOrderFilter: filter }),

      advanceOrderStatus: (orderId, pickupCodeInput) => {
        const { ecosystem } = get();
        const order = ecosystem.orders.find((o) => o.id === orderId);
        if (!order) return { success: false, message: 'Order not found' };

        const currentIndex = ORDER_STATUS_STEPS.indexOf(order.status);
        if (currentIndex < 0 || currentIndex >= ORDER_STATUS_STEPS.length - 1) {
          return { success: false, message: 'Order cannot be advanced further' };
        }

        const nextStatus = ORDER_STATUS_STEPS[currentIndex + 1];

        if (nextStatus === 'Completed' && order.pickupCode) {
          if (!pickupCodeInput || pickupCodeInput.trim() !== order.pickupCode.trim()) {
            return {
              success: false,
              message: `Invalid 6-digit Student Pickup OTP. Student OTP is ${order.pickupCode}.`
            };
          }
        }

        const updatedOrders = ecosystem.orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
        set({ ecosystem: { ...ecosystem, orders: updatedOrders } });
        get().showToast('Status Advanced', `Order ${order.id} is now "${nextStatus}".`, 'success');
        return { success: true, message: `Status advanced to ${nextStatus}` };
      },

      editingProductId: null,
      setEditingProductId: (id) => set({ editingProductId: id }),

      addProduct: (newProduct) => {
        const { ecosystem } = get();
        const newId = `PRD-${String(ecosystem.products.length + 1).padStart(3, '0')}`;
        const product: EcoProduct = {
          ...newProduct,
          id: newId,
          active: true,
          featured: false,
          frequent: false
        };
        set({ ecosystem: { ...ecosystem, products: [...ecosystem.products, product] } });
        get().showToast('Product Added', `${product.name} enrolled into catalog.`, 'success');
      },

      updateProduct: (id, updates) => {
        const { ecosystem } = get();
        set({
          ecosystem: {
            ...ecosystem,
            products: ecosystem.products.map((p) => (p.id === id ? { ...p, ...updates } : p))
          }
        });
        get().showToast('Inventory Updated', `Product ${id} modified successfully.`, 'success');
      },

      deleteProduct: (id) => {
        const { ecosystem } = get();
        set({ ecosystem: { ...ecosystem, products: ecosystem.products.filter((p) => p.id !== id) } });
      },

      toggleProductActive: (id) => {
        const { ecosystem } = get();
        set({
          ecosystem: {
            ...ecosystem,
            products: ecosystem.products.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
          }
        });
      },

      executeManualAdjustment: (studentId, type, amount, reason, operator) => {
        const { ecosystem } = get();
        const student = ecosystem.students.find((s) => s.id === studentId);
        if (!student) return;

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newTxnId = `TXN-ADJ-${Math.floor(10000 + Math.random() * 90000)}`;
        const adjustedAmount = type === 'Debit' ? -Math.abs(amount) : Math.abs(amount);
        const newBal = Math.max(0, student.walletBalance + adjustedAmount);

        const newTxn: EcoTransaction = {
          id: newTxnId,
          studentId: student.id,
          type: 'Adjustment',
          category: 'Manual Correction',
          amount: adjustedAmount,
          previousBalance: student.walletBalance,
          newBalance: newBal,
          timestamp: dateStr,
          month: 'Nov 2026',
          status: 'Completed',
          method: `Manual Ops (${operator})`,
          relatedOrderId: null,
          note: `${reason} [Approved by ${operator}]`,
          reconciled: true
        };

        const updatedStudents = ecosystem.students.map((s) => (s.id === student.id ? { ...s, walletBalance: newBal } : s));
        set({
          ecosystem: { ...ecosystem, students: updatedStudents, transactions: [newTxn, ...ecosystem.transactions] },
          walletBalance: newBal
        });
        get().showToast('Adjustment Applied', `₹${Math.abs(amount)} recorded for ${student.firstName}.`, 'success');
      },

      enrollStudent: (studentData) => {
        const { ecosystem } = get();
        const newId = `CK-2026-${String(ecosystem.students.length + 101)}`;
        const student: Student = {
          id: newId,
          name: studentData.name,
          firstName: studentData.name.split(' ')[0] || studentData.name,
          password: 'PASS' + (ecosystem.students.length + 101),
          pin: '1234',
          institution: ecosystem.college.name,
          academicYear: studentData.academicYear,
          status: 'Active',
          walletBalance: studentData.initialWallet || 0,
          parentId: `PAR-${ecosystem.students.length + 101}`,
          parentName: studentData.parentName,
          parentPin: '9999',
          parentPhone: '+91 98000 00000',
          notificationsPref: { sms: true, app: true, lowBalance: true }
        };
        set({ ecosystem: { ...ecosystem, students: [...ecosystem.students, student] } });
        get().showToast('Student Enrolled', `${student.name} registered.`, 'success');
      },

      toggleStudentStatus: (studentId) => {
        const { ecosystem } = get();
        set({
          ecosystem: {
            ...ecosystem,
            students: ecosystem.students.map((s) => (s.id === studentId ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s))
          }
        });
      },

      // College Portal
      collegeScreen: 'overview',
      setCollegeScreen: (screen) => set({ collegeScreen: screen }),

      // Legacy State & Methods (Fully backward compatible with tests)
      walletBalance: 2500,
      walletTransactions: [makeWalletTransaction('top-up', 2500, 'Opening demo wallet allocation')],
      parentLimits: defaultLimits,
      student: defaultStudentProfile,
      orders: [],
      selectedCampus: 'Hyderabad',
      selectedInstitution: 'Sri Chaitanya & Narayana Junior Academy',
      selectedHostel: 'B-Block Hostel',

      updateStudent: (profile) =>
        set((state) => {
          const next = { ...state.student, ...profile };
          return {
            student: next,
            selectedCampus: next.city,
            selectedInstitution: next.institution,
            selectedHostel: next.hostel
          };
        }),

      setSelectedCampus: (city) =>
        set((state) => ({ selectedCampus: city, student: { ...state.student, city } })),
      setSelectedInstitution: (institution) =>
        set((state) => ({ selectedInstitution: institution, student: { ...state.student, institution } })),
      setSelectedHostel: (hostel) =>
        set((state) => ({ selectedHostel: hostel, student: { ...state.student, hostel } })),

      addFunds: (amount) =>
        set((state) => ({
          walletBalance: state.walletBalance + amount,
          walletTransactions: [
            makeWalletTransaction('top-up', amount, 'Parent wallet top-up'),
            ...state.walletTransactions
          ]
        })),

      updateParentLimits: (limits) =>
        set((state) => ({ parentLimits: { ...state.parentLimits, ...limits } })),

      resetDemo: () =>
        set({
          ecosystem: INITIAL_STATE,
          student: defaultStudentProfile,
          selectedCampus: defaultStudentProfile.city,
          selectedInstitution: defaultStudentProfile.institution,
          selectedHostel: defaultStudentProfile.hostel,
          cart: [],
          orders: [],
          walletBalance: 2500,
          walletTransactions: [makeWalletTransaction('top-up', 2500, 'Opening demo wallet allocation')],
          parentLimits: defaultLimits,
          activePortal: 'student',
          loggedStudentId: 'CK-2026-101',
          studentAuthed: true,
          studentScreen: 'home',
          parentAuthed: true,
          parentScreen: 'dashboard',
          linkedStudentId: 'CK-2026-101',
          credIdInput: 'CK-2026-101',
          credPassInput: 'PASS101',
          credError: '',
          pinInput: '',
          pinError: '',
          pendingStudent: null,
          parentLookupStudentId: 'CK-2026-101',
          parentPinInput: '9999',
          parentAuthError: '',
          toast: null,
          showDemoModal: false,
          receiptModalOrder: null,
        }),

      addOrder: (order) =>
        set((state) => {
          const needsPayment = order.status !== 'pending-approval' && order.paymentMethod === 'wallet';
          return {
            orders: [order, ...state.orders],
            walletBalance: needsPayment ? state.walletBalance - order.total : state.walletBalance,
            walletTransactions: needsPayment
              ? [
                  makeWalletTransaction(
                    'purchase',
                    -order.total,
                    `CampusKart order ${order.id}`,
                    order.id
                  ),
                  ...state.walletTransactions
                ]
              : state.walletTransactions
          };
        }),

      approveOrder: (orderId) => {
        const state = get();
        const order = state.orders.find((entry) => entry.id === orderId);
        if (!order || order.status !== 'pending-approval' || state.walletBalance < order.total)
          return false;
        set({
          walletBalance: state.walletBalance - order.total,
          walletTransactions: [
            makeWalletTransaction(
              'purchase',
              -order.total,
              `Parent-approved order ${order.id}`,
              order.id
            ),
            ...state.walletTransactions
          ],
          orders: state.orders.map((entry) =>
            entry.id === orderId ? { ...entry, status: 'placed', paymentStatus: 'paid' } : entry
          )
        });
        return true;
      },

      rejectOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
        })),

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status: status as OrderStatus } : order
          )
        }))
    }),
    {
      name: 'campuskart_ecosystem_v2',
      partialize: (state) => ({
        ecosystem: state.ecosystem,
        activePortal: state.activePortal,
        loggedStudentId: state.loggedStudentId,
        studentAuthed: state.studentAuthed,
        parentAuthed: state.parentAuthed,
        linkedStudentId: state.linkedStudentId,
        walletBalance: state.walletBalance,
        walletTransactions: state.walletTransactions
      })
    }
  )
);

// Helpers for calculations
export const getSpentToday = (orders: Order[]) => {
  const now = new Date();
  return orders
    .filter((order) => {
      if (order.status === 'pending-approval' || order.status === 'cancelled') return false;
      const created = new Date(order.createdAt);
      if (Number.isNaN(created.getTime())) return false;
      return created.toDateString() === now.toDateString();
    })
    .reduce((sum, order) => sum + order.total, 0);
};

export const getSpentThisMonth = (orders: Order[]) => {
  const now = new Date();
  return orders
    .filter((order) => {
      if (order.status === 'pending-approval' || order.status === 'cancelled') return false;
      const created = new Date(order.createdAt);
      if (Number.isNaN(created.getTime())) return false;
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    })
    .reduce((sum, order) => sum + order.total, 0);
};

export const GROUPS: Record<string, { image: string; group: string }> = {
  'Fruits & Fresh': { image: fresh, group: 'Fresh' },
  'Biscuits & Cookies': { image: sweet, group: 'Sweet' },
  'Snacks & Namkeen': { image: snacks, group: 'Snacks' },
  Chocolates: { image: sweet, group: 'Sweet' },
  'Candies & Treats': { image: sweet, group: 'Sweet' },
  'Bakery & Rusks': { image: pantry, group: 'Bakery & Breakfast' },
  'Pickles & Add-ons': { image: pantry, group: 'Bakery & Breakfast' },
  Beverages: { image: fresh, group: 'Fresh' },
  'Coconut Water': { image: fresh, group: 'Fresh' },
  'Hygiene & Home Care': { image: home, group: 'Home Care' },
  Emergency: { image: care, group: 'Personal Care' },
  Stationery: { image: pantry, group: 'Bakery & Breakfast' },
  Chips: { image: snacks, group: 'Snacks' },
  Nachos: { image: snacks, group: 'Snacks' }
};

export const CATEGORY_GROUPS = ['Snacks', 'Sweet', 'Bakery & Breakfast', 'Fresh', 'Personal Care', 'Home Care'];

export function categoryGroup(category: string) {
  return GROUPS[category]?.group ?? 'Snacks';
}

export function categoryImage(category: string) {
  return GROUPS[category]?.image ?? snacks;
}

export function productImage(product: Pick<Product, 'category'> & { image?: string; imageUrl?: string | null }) {
  return {
    src: product.imageUrl ? `/products/${product.imageUrl}` : product.image || categoryImage(product.category),
    fallback: categoryImage(product.category)
  };
}

export type StockState = 'in-stock' | 'limited' | 'out-of-stock';

export function stockState(p: Product): StockState {
  if (p.availability === 'out-of-stock' || (p.stockQuantity !== undefined && p.stockQuantity <= 0) || (p.stock !== undefined && p.stock <= 0))
    return 'out-of-stock';
  if (
    p.availability === 'limited' ||
    (p.stockQuantity !== undefined && p.stockQuantity <= (p.reorderThreshold ?? 5)) ||
    (p.stock !== undefined && p.stock <= 5)
  )
    return 'limited';
  return 'in-stock';
}

const rawMockProducts: Product[] = [
  { id: 'f1', name: 'Fresh Bananas', price: 40, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', category: 'Fruits & Fresh', availability: 'in-stock', tags: ['healthy'], unit: '6 pcs' },
  { id: 'f2', name: 'Apple Pack', price: 120, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', category: 'Fruits & Fresh', availability: 'in-stock', tags: ['healthy'], unit: '4 pcs' },
  { id: 'f3', name: 'Orange Juice', price: 80, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', category: 'Fruits & Fresh', availability: 'limited', tags: ['healthy'], unit: '500ml' },
  { id: 'f4', name: 'Mixed Fruit Bowl', price: 90, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', category: 'Fruits & Fresh', availability: 'in-stock', tags: ['healthy'], unit: '250g' },
  { id: 'b1', name: 'Digestive Biscuits', price: 35, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: ['healthy'], unit: '100g' },
  { id: 'b2', name: 'Bourbon Cookies', price: 30, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: [], unit: '150g' },
  { id: 'b3', name: 'Good Day Butter', price: 25, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: [], unit: '100g' },
  { id: 'b4', name: 'Marie Gold', price: 20, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: ['parent-approved'], unit: '120g' },
  { id: 's1', name: 'Aloo Bhujia', price: 45, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 's2', name: 'Moong Dal Namkeen', price: 40, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: ['healthy'], unit: '200g' },
  { id: 's3', name: 'Salted Peanuts', price: 30, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: ['healthy'], unit: '150g' },
  { id: 's4', name: 'Roasted Makhana', price: 65, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'limited', tags: ['healthy', 'parent-approved'], unit: '100g' },
  { id: 'c1', name: 'Dairy Milk Silk', price: 80, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '60g' },
  { id: 'c2', name: 'KitKat 4 Finger', price: 30, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '38g' },
  { id: 'c3', name: '5 Star Bar', price: 15, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '20g' },
  { id: 'c4', name: 'Perk Twin Pack', price: 10, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '15g' },
  { id: 'cn1', name: 'Alpenliebe Gold', price: 20, image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '100g' },
  { id: 'cn2', name: 'Pulse Candy Pack', price: 25, image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '100g' },
  { id: 'cn3', name: 'Kaccha Aam Bites', price: 20, image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '100g' },
  { id: 'cn4', name: 'Lollipop Pack 5s', price: 30, image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '5 pcs' },
  { id: 'bk1', name: 'Sujii Rusks 200g', price: 40, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'bk2', name: 'Brown Bread 400g', price: 45, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: ['healthy'], unit: '400g' },
  { id: 'bk3', name: 'Milk Bread 400g', price: 40, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: [], unit: '400g' },
  { id: 'bk4', name: 'Fruit Bun Pack', price: 25, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Bakery & Rusks', availability: 'limited', tags: [], unit: '2 pcs' },
  { id: 'p1', name: 'Mango Pickle 200g', price: 65, image: 'https://images.unsplash.com/photo-1589135233689-d5861b559d2a?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'p2', name: 'Mixed Veg Pickle', price: 60, image: 'https://images.unsplash.com/photo-1589135233689-d5861b559d2a?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'p3', name: 'Tomato Ketchup 200g', price: 45, image: 'https://images.unsplash.com/photo-1589135233689-d5861b559d2a?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'p4', name: 'Green Chilli Pickle', price: 55, image: 'https://images.unsplash.com/photo-1589135233689-d5861b559d2a?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'bv1', name: 'Mineral Water 1L', price: 20, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400', category: 'Beverages', availability: 'in-stock', tags: ['parent-approved'], unit: '1L' },
  { id: 'bv2', name: 'Appy Fizz 250ml', price: 20, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400', category: 'Beverages', availability: 'in-stock', tags: [], unit: '250ml' },
  { id: 'bv3', name: 'Sprite 250ml Can', price: 35, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400', category: 'Beverages', availability: 'in-stock', tags: [], unit: '250ml' },
  { id: 'bv4', name: 'Amul Buttermilk 200ml', price: 15, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400', category: 'Beverages', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '200ml' },
  { id: 'cw1', name: 'Fresh Tender Coconut', price: 50, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400', category: 'Coconut Water', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '1 pc' },
  { id: 'cw2', name: 'Packaged Coconut Water', price: 45, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400', category: 'Coconut Water', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '200ml' },
  { id: 'cw3', name: 'Coconut Water 500ml', price: 85, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400', category: 'Coconut Water', availability: 'limited', tags: ['healthy', 'parent-approved'], unit: '500ml' },
  { id: 'cw4', name: 'Raw Coconut Water Tetra', price: 40, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400', category: 'Coconut Water', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '200ml' },
  { id: 'h1', name: 'Pocket Tissues 3s', price: 30, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '3 packs' },
  { id: 'h2', name: 'Hand Sanitizer 50ml', price: 25, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '50ml' },
  { id: 'h3', name: 'Dettol Soap 75g', price: 38, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '75g' },
  { id: 'h4', name: 'Toothbrush Soft', price: 30, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '1 pc' },
  { id: 'h5', name: 'Toothpaste 100g', price: 55, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '100g' },
  { id: 'h6', name: 'Wet Wipes Pack 10s', price: 40, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '10 pcs' },
  { id: 'h7', name: 'Detergent Bar 200g', price: 20, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '200g' },
  { id: 'h8', name: 'Mosquito Vaporizer', price: 85, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '1 pc' },
  { id: 'h9', name: 'Sanitary Pads 6s', price: 45, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '6 pcs' },
  { id: 'h10', name: 'Face Wash 50ml', price: 75, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '50ml' },
  { id: 'h11', name: 'Soap Bar 100g', price: 35, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '100g' },
  { id: 'h12', name: 'Shampoo Sachet 6pcs', price: 30, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '6 pcs' },
  { id: 'e1', name: 'First Aid Kit Basic', price: 250, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency', 'parent-approved'], unit: '1 kit' },
  { id: 'e2', name: 'Pain Relief Tablets 10s', price: 35, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency'], unit: '10 tabs' },
  { id: 'e3', name: 'Band-Aids Assorted 20pcs', price: 40, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency'], unit: '20 pcs' },
  { id: 'e4', name: 'Antacid Tablets 15s', price: 25, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency'], unit: '15 tabs' },
  { id: 'e5', name: 'Cold & Flu Relief 10s', price: 45, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency'], unit: '10 tabs' },
  { id: 'e6', name: 'ORS Sachets 5pcs', price: 30, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency', 'healthy'], unit: '5 pcs' },
  { id: 'st1', name: 'Notebook 200 Pages', price: 60, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '1 pc' },
  { id: 'st2', name: 'Pen Set Blue 5pcs', price: 45, image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '5 pcs' },
  { id: 'st3', name: 'Highlighters Set 4pcs', price: 80, image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '4 pcs' },
  { id: 'st4', name: 'Sticky Notes Pack', price: 40, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '100 pcs' },
  { id: 'st5', name: 'Pencil Box', price: 85, image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '1 pc' }
];

export const mockProducts: Product[] = rawMockProducts.map((product, index) => ({
  ...product,
  sku: product.sku ?? `CK-${String(index + 1).padStart(3, '0')}`,
  stockQuantity: product.availability === 'out-of-stock' ? 0 : product.availability === 'limited' ? 3 : 25,
  stock: product.availability === 'out-of-stock' ? 0 : product.availability === 'limited' ? 3 : 25,
  reorderThreshold: 5,
  isActive: true,
  active: true
}));

export function useProducts() {
  return useQuery({
    queryKey: ['products', 'store'],
    queryFn: async (): Promise<Product[]> => mockProducts,
    staleTime: 60_000
  });
}

export const categories = [
  { id: 'fruits-fresh', name: 'Fruits & Fresh', icon: '🍎', color: 'bg-emerald-100' },
  { id: 'biscuits-cookies', name: 'Biscuits & Cookies', icon: '🍪', color: 'bg-amber-100' },
  { id: 'snacks-namkeen', name: 'Snacks & Namkeen', icon: '🍿', color: 'bg-orange-100' },
  { id: 'chocolates', name: 'Chocolates', icon: '🍫', color: 'bg-yellow-100' },
  { id: 'candies-treats', name: 'Candies & Treats', icon: '🍬', color: 'bg-pink-100' },
  { id: 'bakery-rusks', name: 'Bakery & Rusks', icon: '🥐', color: 'bg-rose-100' },
  { id: 'pickles-addons', name: 'Pickles & Add-ons', icon: '🥫', color: 'bg-lime-100' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: 'bg-blue-100' },
  { id: 'coconut-water', name: 'Coconut Water', icon: '🥥', color: 'bg-teal-100' },
  { id: 'hygiene-home', name: 'Hygiene & Home Care', icon: '🧴', color: 'bg-purple-100' },
  { id: 'emergency', name: 'Emergency', icon: '🩹', color: 'bg-red-100' },
  { id: 'stationery', name: 'Stationery', icon: '📝', color: 'bg-cyan-100' },
];

export const cities = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Surat',
  'Jaipur',
];
