import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  availability: 'in-stock' | 'limited' | 'out-of-stock';
  tags: string[];
  unit: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending-approval' | 'placed' | 'packed' | 'on-the-way' | 'collected' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  deliverySlot?: string;
  studentName: string;
  studentId: string;
  city: string;
  institution: string;
  hostel: string;
  paymentMethod: 'wallet' | 'pay-at-pickup';
  paymentStatus: 'paid' | 'pending';
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
  type: 'top-up' | 'purchase' | 'refund';
  amount: number;
  description: string;
  createdAt: string;
  orderId?: string;
}

interface ParentLimits {
  daily: number;
  monthly: number;
  categories: string[];
  approvalAbove: number;
  timeRestrictionEnabled: boolean;
  allowedFrom: string;
  allowedUntil: string;
}

interface AppState {
  student: StudentProfile;
  updateStudent: (profile: Partial<StudentProfile>) => void;
  selectedCampus: string;
  setSelectedCampus: (city: string) => void;
  selectedInstitution: string;
  setSelectedInstitution: (institution: string) => void;
  selectedHostel: string;
  setSelectedHostel: (hostel: string) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  orders: Order[];
  addOrder: (order: Order) => void;
  approveOrder: (orderId: string) => boolean;
  rejectOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  addFunds: (amount: number) => void;
  parentLimits: ParentLimits;
  updateParentLimits: (limits: Partial<ParentLimits>) => void;
  resetDemo: () => void;
}

const CITY_NAMES = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Pune', 'Surat', 'Jaipur',
];

const defaultStudent: StudentProfile = {
  fullName: 'Aarav Mehta',
  studentId: 'CK2026001',
  city: 'Hyderabad',
  institution: 'Hyderabad Campus Partner',
  hostel: 'B-Block Hostel',
  parentName: 'Rajesh Mehta',
  parentContact: '+91 98XXXXXX24',
};

const defaultLimits: ParentLimits = {
  daily: 500,
  monthly: 5000,
  approvalAbove: 400,
  timeRestrictionEnabled: true,
  allowedFrom: '06:00',
  allowedUntil: '23:00',
  categories: ['Fruits & Fresh', 'Biscuits & Cookies', 'Snacks & Namkeen', 'Chocolates', 'Candies & Treats', 'Bakery & Rusks', 'Pickles & Add-ons', 'Beverages', 'Coconut Water', 'Hygiene & Home Care', 'Emergency', 'Stationery'],
};

const makeWalletTransaction = (type: WalletTransaction['type'], amount: number, description: string, orderId?: string): WalletTransaction => ({
  id: `WT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  amount,
  description,
  createdAt: new Date().toISOString(),
  orderId,
});

const calculateSpent = (orders: Order[], period: 'today' | 'month') => {
  const now = new Date();
  return orders.filter((order) => {
    if (order.status === 'pending-approval' || order.status === 'cancelled') return false;
    const created = new Date(order.createdAt);
    if (Number.isNaN(created.getTime())) return false;
    return period === 'today'
      ? created.toDateString() === now.toDateString()
      : created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).reduce((sum, order) => sum + order.total, 0);
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      student: defaultStudent,
      updateStudent: (profile) => set((state) => {
        const next = { ...state.student, ...profile };
        return {
          student: next,
          selectedCampus: next.city,
          selectedInstitution: next.institution,
          selectedHostel: next.hostel,
        };
      }),
      selectedCampus: defaultStudent.city,
      setSelectedCampus: (city) => set((state) => ({ selectedCampus: city, student: { ...state.student, city } })),
      selectedInstitution: defaultStudent.institution,
      setSelectedInstitution: (institution) => set((state) => ({ selectedInstitution: institution, student: { ...state.student, institution } })),
      selectedHostel: defaultStudent.hostel,
      setSelectedHostel: (hostel) => set((state) => ({ selectedHostel: hostel, student: { ...state.student, hostel } })),
      cart: [],
      addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.product.id === product.id);
        if (existing) return { cart: state.cart.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, 20) } : item) };
        return { cart: [...state.cart, { product, quantity: 1 }] };
      }),
      removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter((item) => item.product.id !== productId) })),
      updateQuantity: (productId, quantity) => set((state) => ({ cart: quantity <= 0 ? state.cart.filter((item) => item.product.id !== productId) : state.cart.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(quantity, 20) } : item) })),
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
      orders: [],
      addOrder: (order) => set((state) => {
        const needsPayment = order.status !== 'pending-approval' && order.paymentMethod === 'wallet';
        return {
          orders: [order, ...state.orders],
          walletBalance: needsPayment ? state.walletBalance - order.total : state.walletBalance,
          walletTransactions: needsPayment ? [makeWalletTransaction('purchase', -order.total, `CampusKart order ${order.id}`, order.id), ...state.walletTransactions] : state.walletTransactions,
        };
      }),
      approveOrder: (orderId) => {
        const state = get();
        const order = state.orders.find((entry) => entry.id === orderId);
        if (!order || order.status !== 'pending-approval' || state.walletBalance < order.total) return false;
        set({
          walletBalance: state.walletBalance - order.total,
          walletTransactions: [makeWalletTransaction('purchase', -order.total, `Parent-approved order ${order.id}`, order.id), ...state.walletTransactions],
          orders: state.orders.map((entry) => entry.id === orderId ? { ...entry, status: 'placed', paymentStatus: 'paid' } : entry),
        });
        return true;
      },
      rejectOrder: (orderId) => set((state) => ({ orders: state.orders.map((order) => order.id === orderId ? { ...order, status: 'cancelled' } : order) })),
      updateOrderStatus: (orderId, status) => set((state) => ({ orders: state.orders.map((order) => order.id === orderId ? { ...order, status } : order) })),
      walletBalance: 2500,
      walletTransactions: [makeWalletTransaction('top-up', 2500, 'Opening demo wallet allocation')],
      addFunds: (amount) => set((state) => ({ walletBalance: state.walletBalance + amount, walletTransactions: [makeWalletTransaction('top-up', amount, 'Parent wallet top-up'), ...state.walletTransactions] })),
      parentLimits: defaultLimits,
      updateParentLimits: (limits) => set((state) => ({ parentLimits: { ...state.parentLimits, ...limits } })),
      resetDemo: () => set({ student: defaultStudent, selectedCampus: defaultStudent.city, selectedInstitution: defaultStudent.institution, selectedHostel: defaultStudent.hostel, cart: [], orders: [], walletBalance: 2500, walletTransactions: [makeWalletTransaction('top-up', 2500, 'Opening demo wallet allocation')], parentLimits: defaultLimits }),
    }),
    {
      name: 'campuskart-storage',
      version: 4,
      migrate: (persistedState: any) => {
        const legacyCityNames: Record<string, string> = {
          'IIT Delhi': 'Delhi', 'IIT Bombay': 'Mumbai', 'IIT Madras': 'Chennai', 'IIT Kanpur': 'Kanpur',
          'BITS Pilani': 'Jaipur', 'NIT Trichy': 'Chennai', 'IIIT Hyderabad': 'Hyderabad', 'DTU Delhi': 'Delhi',
          'NSIT Delhi': 'Delhi', 'VIT Vellore': 'Vellore',
        };
        const oldCity = persistedState?.selectedCampus;
        const city = legacyCityNames[oldCity] ?? (CITY_NAMES.includes(oldCity) ? oldCity : defaultStudent.city);
        const student = { ...defaultStudent, ...(persistedState?.student ?? {}), city };
        const oldOrders = Array.isArray(persistedState?.orders) ? persistedState.orders : [];
        const existingTransactions = Array.isArray(persistedState?.walletTransactions) ? persistedState.walletTransactions : [];
        const migratedBalance = persistedState?.walletBalance ?? 2500;
        const migratedTransactions = existingTransactions.length > 0 ? existingTransactions : migratedBalance > 0 ? [makeWalletTransaction('top-up', migratedBalance, 'Opening demo wallet allocation')] : [];
        const migratedOrders = oldOrders.map((order: any) => ({
          ...order,
          createdAt: typeof order.createdAt === 'string' ? order.createdAt : new Date(order.createdAt ?? Date.now()).toISOString(),
          studentName: order.studentName ?? student.fullName,
          studentId: order.studentId ?? student.studentId,
          city: order.city ?? city,
          institution: order.institution ?? persistedState?.selectedInstitution ?? defaultStudent.institution,
          hostel: order.hostel ?? persistedState?.selectedHostel ?? defaultStudent.hostel,
          paymentMethod: order.paymentMethod ?? 'wallet',
          paymentStatus: order.paymentStatus ?? 'paid',
          pickupCode: order.pickupCode ?? '123456',
          status: order.status ?? 'placed',
        }));
        return { ...persistedState, student, orders: migratedOrders, selectedCampus: city, selectedInstitution: persistedState?.selectedInstitution ?? student.institution, selectedHostel: persistedState?.selectedHostel ?? student.hostel, walletBalance: migratedBalance, walletTransactions: migratedTransactions, parentLimits: { ...defaultLimits, ...(persistedState?.parentLimits ?? {}) } };
      },
    }
  )
);

export const getSpentToday = (orders: Order[]) => calculateSpent(orders, 'today');
export const getSpentThisMonth = (orders: Order[]) => calculateSpent(orders, 'month');

// Mock Products Data
export const mockProducts: Product[] = [
  // Fruits & Fresh
  { id: 'f1', name: 'Fresh Bananas', price: 40, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', category: 'Fruits & Fresh', availability: 'in-stock', tags: ['healthy'], unit: '6 pcs' },
  { id: 'f2', name: 'Apple Pack', price: 120, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', category: 'Fruits & Fresh', availability: 'in-stock', tags: ['healthy'], unit: '4 pcs' },
  { id: 'f3', name: 'Orange Juice', price: 80, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', category: 'Fruits & Fresh', availability: 'limited', tags: ['healthy'], unit: '500ml' },
  { id: 'f4', name: 'Mixed Fruit Bowl', price: 90, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', category: 'Fruits & Fresh', availability: 'in-stock', tags: ['healthy'], unit: '250g' },
  
  // Biscuits & Cookies
  { id: 'bc1', name: 'Glucose Biscuits 100g', price: 10, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: ['parent-approved'], unit: '100g' },
  { id: 'bc2', name: 'Marie Light 120g', price: 25, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '120g' },
  { id: 'bc3', name: 'Cream Biscuits Orange 150g', price: 30, image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: [], unit: '150g' },
  { id: 'bc4', name: 'Digestive Biscuits 250g', price: 55, image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '250g' },
  { id: 'bc5', name: 'Chocolate Chip Cookies 200g', price: 65, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'bc6', name: 'Monaco Salted Crackers 120g', price: 30, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: [], unit: '120g' },
  { id: 'bc7', name: 'Dark Fantasy Choco Fills 75g', price: 40, image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400', category: 'Biscuits & Cookies', availability: 'limited', tags: [], unit: '75g' },
  { id: 'bc8', name: 'Bourbon Cream 150g', price: 35, image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: [], unit: '150g' },
  { id: 'bc9', name: 'Milk Shakti Biscuits 100g', price: 15, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: ['parent-approved'], unit: '100g' },
  { id: 'bc10', name: 'Farmlite Oats Cookies 150g', price: 45, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '150g' },
  { id: 'bc11', name: 'Hide & Seek Choco 100g', price: 35, image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400', category: 'Biscuits & Cookies', availability: 'in-stock', tags: [], unit: '100g' },
  { id: 'bc12', name: 'Butter Cookies Tin 400g', price: 180, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', category: 'Biscuits & Cookies', availability: 'limited', tags: [], unit: '400g' },

  // Snacks & Namkeen
  { id: 'sn1', name: 'Classic Salted Chips 52g', price: 20, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: ['emergency'], unit: '52g' },
  { id: 'sn2', name: 'Aloo Bhujia 200g', price: 55, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'sn3', name: 'Moong Dal Namkeen 150g', price: 45, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '150g' },
  { id: 'sn4', name: 'Sev Bhujia 180g', price: 50, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '180g' },
  { id: 'sn5', name: 'Masala Peanuts 200g', price: 60, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: ['healthy'], unit: '200g' },
  { id: 'sn6', name: 'Navratan Mix 200g', price: 65, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'sn7', name: 'Khatta Meetha Mix 200g', price: 55, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'sn8', name: 'Punjabi Tadka Mix 200g', price: 70, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'limited', tags: [], unit: '200g' },
  { id: 'sn9', name: 'Cheese Puffs 55g', price: 20, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: ['emergency'], unit: '55g' },
  { id: 'sn10', name: 'Nachos Tomato 60g', price: 40, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '60g' },
  { id: 'sn11', name: 'Wafers Cream & Onion 75g', price: 30, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '75g' },
  { id: 'sn12', name: 'Chana Dal Namkeen 150g', price: 40, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: [], unit: '150g' },
  { id: 'sn13', name: 'Mixed Nuts Premium 100g', price: 150, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '100g' },
  { id: 'sn14', name: 'Roasted Almonds 100g', price: 180, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', category: 'Snacks & Namkeen', availability: 'limited', tags: ['healthy', 'parent-approved'], unit: '100g' },

  // Chocolates
  { id: 'ch1', name: 'Dairy Milk Silk 60g', price: 80, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '60g' },
  { id: 'ch2', name: 'Dairy Milk Classic 25g', price: 25, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '25g' },
  { id: 'ch3', name: 'KitKat 4 Finger', price: 35, image: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '45g' },
  { id: 'ch4', name: 'Munch Bar', price: 10, image: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '23g' },
  { id: 'ch5', name: '5 Star Chocolate', price: 20, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '40g' },
  { id: 'ch6', name: 'Gems Tube', price: 20, image: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '18g' },
  { id: 'ch7', name: 'Milkybar 25g', price: 25, image: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '25g' },
  { id: 'ch8', name: 'Snickers Bar 52g', price: 50, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '52g' },
  { id: 'ch9', name: 'Mars Bar 51g', price: 50, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', category: 'Chocolates', availability: 'limited', tags: [], unit: '51g' },
  { id: 'ch10', name: 'Galaxy Smooth Milk 56g', price: 65, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '56g' },
  { id: 'ch11', name: 'Twix Twin Bars 50g', price: 55, image: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '50g' },
  { id: 'ch12', name: 'Kinder Joy', price: 50, image: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400', category: 'Chocolates', availability: 'in-stock', tags: [], unit: '20g' },
  { id: 'ch13', name: 'Amul Dark Chocolate 150g', price: 120, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', category: 'Chocolates', availability: 'in-stock', tags: ['healthy'], unit: '150g' },
  { id: 'ch14', name: 'Hersheys Kisses 108g', price: 250, image: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400', category: 'Chocolates', availability: 'limited', tags: [], unit: '108g' },

  // Candies & Treats
  { id: 'ct1', name: 'Eclairs Toffees 50pcs', price: 50, image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '50 pcs' },
  { id: 'ct2', name: 'Mango Bite 100g', price: 40, image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '100g' },
  { id: 'ct3', name: 'Alpenliebe Caramel 40pcs', price: 80, image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '40 pcs' },
  { id: 'ct4', name: 'Fruit Drops Jar 400g', price: 120, image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '400g' },
  { id: 'ct5', name: 'Pulse Candy 50pcs', price: 50, image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '50 pcs' },
  { id: 'ct6', name: 'Chewing Gum Mint 10pcs', price: 20, image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400', category: 'Candies & Treats', availability: 'in-stock', tags: [], unit: '10 pcs' },
  { id: 'ct7', name: 'M&Ms Peanut 45g', price: 80, image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400', category: 'Candies & Treats', availability: 'limited', tags: [], unit: '45g' },

  // Bakery & Rusks
  { id: 'br1', name: 'Elaichi Rusk 300g', price: 55, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: ['parent-approved'], unit: '300g' },
  { id: 'br2', name: 'Milk Rusk 200g', price: 45, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: ['parent-approved'], unit: '200g' },
  { id: 'br3', name: 'Suji Toast 150g', price: 35, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: [], unit: '150g' },
  { id: 'br4', name: 'Fruit Cake Pack 150g', price: 60, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: [], unit: '150g' },
  { id: 'br5', name: 'Chocolate Cake Pack 150g', price: 65, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: [], unit: '150g' },
  { id: 'br6', name: 'Swiss Roll Chocolate 200g', price: 80, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'Bakery & Rusks', availability: 'limited', tags: [], unit: '200g' },
  { id: 'br7', name: 'Butter Toast 200g', price: 40, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'br8', name: 'Muffin Chocolate 2pcs', price: 50, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'Bakery & Rusks', availability: 'in-stock', tags: [], unit: '2 pcs' },

  // Pickles & Add-ons
  { id: 'pa1', name: 'Mango Pickle 200g', price: 65, image: 'https://images.unsplash.com/photo-1601312018203-c3c3aae20f58?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'pa2', name: 'Lemon Pickle 200g', price: 55, image: 'https://images.unsplash.com/photo-1601312018203-c3c3aae20f58?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'pa3', name: 'Mixed Veg Pickle 300g', price: 85, image: 'https://images.unsplash.com/photo-1601312018203-c3c3aae20f58?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '300g' },
  { id: 'pa4', name: 'Punjabi Papad 200g', price: 50, image: 'https://images.unsplash.com/photo-1601312018203-c3c3aae20f58?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'pa5', name: 'Jeera Papad 200g', price: 45, image: 'https://images.unsplash.com/photo-1601312018203-c3c3aae20f58?w=400', category: 'Pickles & Add-ons', availability: 'in-stock', tags: [], unit: '200g' },
  { id: 'pa6', name: 'Masala Papad 150g', price: 40, image: 'https://images.unsplash.com/photo-1601312018203-c3c3aae20f58?w=400', category: 'Pickles & Add-ons', availability: 'limited', tags: [], unit: '150g' },

  // Beverages
  { id: 'b1', name: 'Mineral Water 1L', price: 20, image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400', category: 'Beverages', availability: 'in-stock', tags: [], unit: '1L' },
  { id: 'b2', name: 'Green Tea 250ml', price: 35, image: 'https://images.unsplash.com/photo-1556679343-c1306c6aa167?w=400', category: 'Beverages', availability: 'in-stock', tags: ['healthy'], unit: '250ml' },
  { id: 'b3', name: 'Energy Drink 250ml', price: 85, image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400', category: 'Beverages', availability: 'limited', tags: [], unit: '250ml' },
  { id: 'b4', name: 'Cold Coffee 200ml', price: 55, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', category: 'Beverages', availability: 'in-stock', tags: [], unit: '200ml' },
  { id: 'b5', name: 'Mango Juice 200ml', price: 25, image: 'https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=400', category: 'Beverages', availability: 'in-stock', tags: [], unit: '200ml' },
  { id: 'b6', name: 'Lemonade 300ml', price: 30, image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400', category: 'Beverages', availability: 'in-stock', tags: ['healthy'], unit: '300ml' },
  { id: 'b7', name: 'Cola 300ml', price: 35, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', category: 'Beverages', availability: 'in-stock', tags: [], unit: '300ml' },
  { id: 'b8', name: 'Buttermilk 200ml', price: 20, image: 'https://images.unsplash.com/photo-1628087236791-0ffd1f32cff2?w=400', category: 'Beverages', availability: 'in-stock', tags: ['healthy', 'parent-approved'], unit: '200ml' },

  // Coconut Water
  { id: 'c1', name: 'Fresh Coconut Water 300ml', price: 45, image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=400', category: 'Coconut Water', availability: 'in-stock', tags: ['healthy'], unit: '300ml' },
  { id: 'c2', name: 'Tender Coconut', price: 60, image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=400', category: 'Coconut Water', availability: 'limited', tags: ['healthy'], unit: '1 pc' },
  { id: 'c3', name: 'Coconut Water Tetra 200ml', price: 35, image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=400', category: 'Coconut Water', availability: 'in-stock', tags: ['healthy'], unit: '200ml' },

  // Hygiene & Home Care
  { id: 'h1', name: 'Hand Sanitizer 100ml', price: 50, image: 'https://images.unsplash.com/photo-1584483720412-ce931f4aefa8?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '100ml' },
  { id: 'h2', name: 'Face Wash 100ml', price: 120, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '100ml' },
  { id: 'h3', name: 'Tissue Pack 50pcs', price: 25, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '50 pcs' },
  { id: 'h4', name: 'Surf Excel Powder 500g', price: 95, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '500g' },
  { id: 'h5', name: 'Surf Excel Liquid 500ml', price: 145, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '500ml' },
  { id: 'h6', name: 'Rin Powder 500g', price: 55, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '500g' },
  { id: 'h7', name: 'Rin Detergent Bar 250g', price: 30, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '250g' },
  { id: 'h8', name: 'Wheel Powder 1kg', price: 85, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '1kg' },
  { id: 'h9', name: 'Comfort Fabric Conditioner 200ml', price: 75, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '200ml' },
  { id: 'h10', name: 'Toothpaste 100g', price: 55, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '100g' },
  { id: 'h11', name: 'Soap Bar 100g', price: 35, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '100g' },
  { id: 'h12', name: 'Shampoo Sachet 6pcs', price: 30, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', category: 'Hygiene & Home Care', availability: 'in-stock', tags: ['parent-approved'], unit: '6 pcs' },

  // Emergency
  { id: 'e1', name: 'First Aid Kit Basic', price: 250, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency', 'parent-approved'], unit: '1 kit' },
  { id: 'e2', name: 'Pain Relief Tablets 10s', price: 35, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency'], unit: '10 tabs' },
  { id: 'e3', name: 'Band-Aids Assorted 20pcs', price: 40, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency'], unit: '20 pcs' },
  { id: 'e4', name: 'Antacid Tablets 15s', price: 25, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency'], unit: '15 tabs' },
  { id: 'e5', name: 'Cold & Flu Relief 10s', price: 45, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency'], unit: '10 tabs' },
  { id: 'e6', name: 'ORS Sachets 5pcs', price: 30, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'Emergency', availability: 'in-stock', tags: ['emergency', 'healthy'], unit: '5 pcs' },

  // Stationery
  { id: 'st1', name: 'Notebook 200 Pages', price: 60, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '1 pc' },
  { id: 'st2', name: 'Pen Set Blue 5pcs', price: 45, image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '5 pcs' },
  { id: 'st3', name: 'Highlighters Set 4pcs', price: 80, image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '4 pcs' },
  { id: 'st4', name: 'Sticky Notes Pack', price: 40, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '100 pcs' },
  { id: 'st5', name: 'Pencil Box', price: 85, image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', category: 'Stationery', availability: 'in-stock', tags: [], unit: '1 pc' },
];

export const categories = [
  { id: 'fruits', name: 'Fruits & Fresh', icon: '🍎', color: 'bg-green-100' },
  { id: 'biscuits', name: 'Biscuits & Cookies', icon: '🍪', color: 'bg-amber-100' },
  { id: 'snacks', name: 'Snacks & Namkeen', icon: '🥨', color: 'bg-orange-100' },
  { id: 'chocolates', name: 'Chocolates', icon: '🍫', color: 'bg-amber-200' },
  { id: 'candies', name: 'Candies & Treats', icon: '🍬', color: 'bg-pink-100' },
  { id: 'bakery', name: 'Bakery & Rusks', icon: '🥐', color: 'bg-yellow-100' },
  { id: 'pickles', name: 'Pickles & Add-ons', icon: '🫙', color: 'bg-lime-100' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: 'bg-blue-100' },
  { id: 'coconut', name: 'Coconut Water', icon: '🥥', color: 'bg-emerald-100' },
  { id: 'hygiene', name: 'Hygiene & Home Care', icon: '🧼', color: 'bg-purple-100' },
  { id: 'emergency', name: 'Emergency', icon: '🩹', color: 'bg-red-100' },
  { id: 'stationery', name: 'Stationery', icon: '📝', color: 'bg-cyan-100' },
];

export const cities = CITY_NAMES;
