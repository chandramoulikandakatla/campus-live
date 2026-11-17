export type PortalType = 'student' | 'parent' | 'ops' | 'college';

export type StudentScreenType =
  | 'welcome'
  | 'credentials'
  | 'pin'
  | 'home'
  | 'shop'
  | 'product_detail'
  | 'cart'
  | 'order_review'
  | 'payment_method'
  | 'wallet_verify'
  | 'payment_processing'
  | 'order_confirmation'
  | 'my_orders'
  | 'order_tracking'
  | 'wallet'
  | 'profile';

export type ParentScreenType =
  | 'welcome'
  | 'login'
  | 'dashboard'
  | 'add_money'
  | 'funding_method'
  | 'funding_confirm'
  | 'funding_processing'
  | 'funding_success'
  | 'transactions'
  | 'analytics'
  | 'controls'
  | 'orders'
  | 'notifications'
  | 'statements';

export type OpsScreenType = 'overview' | 'orders' | 'inventory' | 'students' | 'reconciliation';

export type CollegeScreenType = 'overview' | 'reports';

export interface Student {
  id: string;
  name: string;
  firstName: string;
  password: string;
  pin: string;
  institution: string;
  academicYear: string;
  status: 'Active' | 'Inactive';
  walletBalance: number;
  parentId: string;
  parentName: string;
  parentPin: string;
  parentPhone: string;
  notificationsPref: {
    sms: boolean;
    app: boolean;
    lowBalance: boolean;
  };
}

export interface SpendingControl {
  dailyLimitEnabled: boolean;
  dailyLimit: number;
  weeklyLimitEnabled: boolean;
  weeklyLimit: number;
  monthlyLimitEnabled: boolean;
  monthlyLimit: number;
  restrictedCategories: string[];
  lowBalanceAlertEnabled: boolean;
  lowBalanceThreshold: number;
  instantTxnNotification: boolean;
  spendingAlertsEnabled: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  frequent: boolean;
  offerTag?: string;
  description: string;
  sku?: string;
  unit?: string;
  image?: string;
  imageUrl?: string | null;
  stockQuantity?: number;
  availability?: 'in-stock' | 'limited' | 'out-of-stock';
  reorderThreshold?: number;
  tags?: string[];
}

export interface OrderLineItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  month: string;
  items: OrderLineItem[];
  totalAmount: number;
  paymentStatus: string;
  txnRef: string;
  fulfilmentMethod: string;
  collectionPoint: string;
  estimatedTime: string;
  status: string; // 'Order Placed' | 'Payment Confirmed' | 'Accepted' | 'Preparing' | 'Ready for Collection' | 'Completed' | 'Cancelled'
  previousBalance: number;
  remainingBalance: number;
  pickupCode?: string;
  note?: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  type: string; // 'Wallet Funding' | 'Student Purchase' | 'Refund' | 'Adjustment'
  category: string;
  amount: number; // positive for credits, negative for debits
  previousBalance: number;
  newBalance: number;
  timestamp: string;
  month: string;
  status: string;
  method: string;
  relatedOrderId: string | null;
  note: string;
  reconciled: boolean;
}

export interface Notification {
  id: string;
  target: 'student' | 'parent' | 'both';
  studentId: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'spend' | 'funding' | 'alert' | 'statement';
  read: boolean;
}

export interface College {
  name: string;
  code: string;
  city: string;
  pilotWindow: string;
  collectionPoints: string[];
}

export interface EcosystemState {
  college: College;
  students: Student[];
  spendingControls: Record<string, SpendingControl>;
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  notifications: Notification[];
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface ToastInfo {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface FundingReceipt {
  txnId: string;
  studentName: string;
  studentId: string;
  amount: number;
  method: string;
  timestamp: string;
  previousBalance: number;
  newBalance: number;
}
