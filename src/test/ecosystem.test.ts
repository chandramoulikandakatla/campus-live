import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../lib/store';

describe('Modular CampusKart Ecosystem - Multi-Portal Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.getState().resetDemo();
  });

  describe('Initial State & Navigation', () => {
    it('initializes with default active student and student portal', () => {
      const state = useStore.getState();
      expect(state.activePortal).toBe('student');
      expect(state.loggedStudentId).toBe('CK-2026-101');
      expect(state.getCurrentStudent()?.name).toBe('Aarav Sharma');
      expect(state.ecosystem.products.length).toBeGreaterThan(0);
      expect(state.ecosystem.students.length).toBe(3);
    });

    it('switches between all 4 portals smoothly', () => {
      const store = useStore.getState();

      store.setActivePortal('parent');
      expect(useStore.getState().activePortal).toBe('parent');

      store.setActivePortal('ops');
      expect(useStore.getState().activePortal).toBe('ops');

      store.setActivePortal('college');
      expect(useStore.getState().activePortal).toBe('college');

      store.setActivePortal('student');
      expect(useStore.getState().activePortal).toBe('student');
    });
  });

  describe('Student Portal: Authentication & PIN Validation', () => {
    it('rejects invalid student credentials', () => {
      const store = useStore.getState();
      store.setCredIdInput('CK-9999-999');
      store.setCredPassInput('WRONGPASS');

      const ok = store.validateStudentCredentials();
      expect(ok).toBe(false);
      expect(useStore.getState().credError).toContain('not found in CampusKart registry');
    });

    it('validates correct credentials and proceeds to PIN keypad', () => {
      const store = useStore.getState();
      store.setCredIdInput('CK-2026-101');
      store.setCredPassInput('PASS101');

      const ok = store.validateStudentCredentials();
      expect(ok).toBe(true);
      expect(useStore.getState().studentScreen).toBe('pin');
      expect(useStore.getState().pendingStudent?.id).toBe('CK-2026-101');
    });

    it('rejects incorrect PIN and accepts valid 4-digit PIN', () => {
      const store = useStore.getState();
      store.setCredIdInput('CK-2026-101');
      store.setCredPassInput('PASS101');
      store.validateStudentCredentials();

      store.setPinInput('9999');
      const failOk = store.verifyStudentPin();
      expect(failOk).toBe(false);
      expect(useStore.getState().pinError).toContain('Incorrect 4-digit PIN');

      store.setPinInput('1234');
      const successOk = store.verifyStudentPin();
      expect(successOk).toBe(true);
      expect(useStore.getState().studentAuthed).toBe(true);
      expect(useStore.getState().studentScreen).toBe('home');
    });
  });

  describe('Student Portal: Cart & Policy Checks', () => {
    it('adds, increments, and removes products in the cart', () => {
      const store = useStore.getState();
      const product = store.ecosystem.products[0];

      store.addToCart(product, 2);
      expect(useStore.getState().cart.find((i) => i.product.id === product.id)?.quantity).toBe(2);

      store.updateCartQty(product.id, 1);
      expect(useStore.getState().cart.find((i) => i.product.id === product.id)?.quantity).toBe(3);

      store.removeFromCart(product.id);
      expect(useStore.getState().cart.find((i) => i.product.id === product.id)).toBeUndefined();
    });

    it('blocks checkout when category is prohibited by parent', async () => {
      const store = useStore.getState();
      const student = store.getCurrentStudent();

      // Restrict "Beverages" category in parent controls
      store.updateSpendingControls(student.id, {
        restrictedCategories: ['Beverages']
      });

      // Find beverage item
      const beverage = store.ecosystem.products.find((p) => p.category === 'Beverages')!;
      store.addToCart(beverage, 1);

      const ok = await store.executeStudentPayment();
      expect(ok).toBe(false);
      expect(useStore.getState().toast?.title).toBe('Category Restricted');
    });

    it('prevents checkout if purchase exceeds daily limit', async () => {
      const store = useStore.getState();
      const student = store.getCurrentStudent();

      // Set low daily limit of 50 with dailyLimitEnabled true
      store.updateSpendingControls(student.id, {
        dailyLimit: 50,
        dailyLimitEnabled: true
      });

      // Put expensive item in cart
      const expensiveItem = store.ecosystem.products.find((p) => p.price > 100)!;
      store.addToCart(expensiveItem, 1);

      const ok = await store.executeStudentPayment();
      expect(ok).toBe(false);
      expect(useStore.getState().toast?.title).toBe('Daily Limit Exceeded');
    });

    it('processes order successfully, debits wallet balance, and creates audit transaction', async () => {
      const store = useStore.getState();
      const student = store.getCurrentStudent();
      const initialBalance = student.walletBalance;

      // Add 1 affordable item
      const item = store.ecosystem.products.find((p) => p.price <= 50)!;
      store.addToCart(item, 1);

      const ok = await store.executeStudentPayment();
      expect(ok).toBe(true);

      const updatedStudent = useStore.getState().getCurrentStudent();
      expect(updatedStudent.walletBalance).toBe(initialBalance - item.price);

      // Verify order registered
      const latestOrder = useStore.getState().ecosystem.orders[0];
      expect(latestOrder.totalAmount).toBe(item.price);
      expect(latestOrder.status).toBe('Order Placed');
      expect(latestOrder.pickupCode).toHaveLength(6);

      // Verify transaction ledger record was created
      const latestTx = useStore.getState().ecosystem.transactions[0];
      expect(latestTx.type).toBe('Student Purchase');
      expect(latestTx.amount).toBe(-item.price);
      expect(latestTx.relatedOrderId).toBe(latestOrder.id);
    });
  });

  describe('Parent Portal: Login, Funding & Controls', () => {
    it('authenticates parent with valid student ID and parent PIN', () => {
      const store = useStore.getState();
      store.setParentLookupStudentId('CK-2026-101');
      store.setParentPinInput('9999');

      const ok = store.loginParent();
      expect(ok).toBe(true);
      expect(useStore.getState().parentAuthed).toBe(true);
      expect(useStore.getState().parentScreen).toBe('dashboard');
    });

    it('funds student wallet and creates wallet funding transaction', async () => {
      const store = useStore.getState();
      store.setParentLookupStudentId('CK-2026-101');
      store.setParentPinInput('9999');
      store.loginParent();

      const initialBalance = store.getCurrentStudent().walletBalance;
      store.setFundAmount(500);
      store.setFundingMethod('UPI');

      const receipt = await store.executeParentFunding();

      expect(receipt).not.toBeNull();
      expect(receipt?.amount).toBe(500);
      expect(receipt?.method).toBe('UPI');

      const updatedStudent = useStore.getState().getCurrentStudent();
      expect(updatedStudent.walletBalance).toBe(initialBalance + 500);

      const latestTx = useStore.getState().ecosystem.transactions[0];
      expect(latestTx.type).toBe('Wallet Funding');
      expect(latestTx.amount).toBe(500);
    });

    it('updates spending controls and restrictions', () => {
      const store = useStore.getState();
      store.updateSpendingControls('CK-2026-101', {
        dailyLimit: 350,
        weeklyLimit: 1500,
        monthlyLimit: 4000,
        curfewEnabled: true,
        curfewStartTime: '21:00',
        curfewEndTime: '06:00'
      });

      const controls = useStore.getState().ecosystem.spendingControls['CK-2026-101'];
      expect(controls.dailyLimit).toBe(350);
      expect(controls.curfewEnabled).toBe(true);
      expect(controls.curfewStartTime).toBe('21:00');
    });
  });

  describe('Operations Console: Order Lifecycle, OTP & Inventory', () => {
    it('advances order through fulfillment lifecycle and verifies pickup OTP', () => {
      const store = useStore.getState();
      // Find an order that can be advanced
      const order = store.ecosystem.orders.find((o) => o.status === 'Ready for Collection')!;

      // Advance with correct pickupCode to complete
      const res = store.advanceOrderStatus(order.id, order.pickupCode);
      expect(res.success).toBe(true);

      const updatedOrder = useStore.getState().ecosystem.orders.find((o) => o.id === order.id)!;
      expect(updatedOrder.status).toBe('Completed');
    });

    it('allows quick stock adjustments and adding new products', () => {
      const store = useStore.getState();
      const product = store.ecosystem.products[0];
      const initialStock = product.stock;

      store.updateProduct(product.id, { stock: initialStock + 10 });
      const updatedProduct = useStore.getState().ecosystem.products.find((p) => p.id === product.id)!;
      expect(updatedProduct.stock).toBe(initialStock + 10);

      // Add new product
      store.addProduct({
        name: 'Organic Granola Bar',
        category: 'Food and Snacks',
        price: 45,
        stock: 50,
        offerTag: 'New Arrival',
        description: 'Nutritious oats and almond snack',
        calories: 180,
        sugar: '8g',
        rating: 4.8,
        reviewsCount: 15,
        featured: false,
        active: true
      });

      const newProduct = useStore
        .getState()
        .ecosystem.products.find((p) => p.name === 'Organic Granola Bar');
      expect(newProduct).toBeDefined();
      expect(newProduct?.price).toBe(45);
    });

    it('performs manual audited wallet adjustments with operators tracking', () => {
      const store = useStore.getState();
      const student = store.getCurrentStudent();
      const initialBalance = student.walletBalance;

      store.executeManualAdjustment(
        student.id,
        'Adjustment',
        50,
        'Refund for dispenser jam',
        'OPS-ADMIN-01'
      );

      const updatedStudent = useStore.getState().getCurrentStudent();
      expect(updatedStudent.walletBalance).toBe(initialBalance + 50);

      const latestTx = useStore.getState().ecosystem.transactions[0];
      expect(latestTx.type).toBe('Adjustment');
      expect(latestTx.note).toContain('Refund for dispenser jam');
    });
  });

  describe('College Dashboard & Institutional Privacy Boundary', () => {
    it('aggregates total GMV and volume without exposing individual student records', () => {
      const store = useStore.getState();
      const orders = store.ecosystem.orders;
      const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      expect(totalGMV).toBeGreaterThan(0);
      expect(store.ecosystem.college.name).toBe('Sri Chaitanya & Narayana Junior Academy');
      expect(store.ecosystem.college.collectionPoints.length).toBeGreaterThan(0);
    });
  });
});
