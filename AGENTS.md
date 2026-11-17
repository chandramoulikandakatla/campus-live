# Project Rules & Agent Instructions

- **Public vs Authenticated Route Boundary**: Keep public welcome (`/`) and login (`/login`) screens separate from authenticated kiosk screens (`/home`, `/shop`, `/cart`, `/orders`, `/wallet`). All authenticated student/kiosk screens must be wrapped in `RequireAuth` and share the unified `KioskShell` navigation.
- **Single Source of Truth (No Dual Stores)**: Never create parallel or duplicate state management stores. All shared state (cart, products, orders, wallet, parent limits, profile) must live in `src/lib/store.ts`. Secondary store wrappers like `cart.ts`, `catalog.ts`, `orders.ts` are forbidden.
- **Parent Spending Policy Invariants**:
  - Daily and monthly spend limits must strictly gate order checkout.
  - Category restrictions (whitelists) must prevent prohibited items from checkout.
  - Time-of-day restrictions must require parent approval if ordered outside allowed hours.
  - Any order exceeding `parentLimits.approvalAbove` must be placed in `pending-approval` status without debiting the wallet until approved.
- **Atomic Wallet Ledger**:
  - Wallet balance must never be arbitrarily modified without an accompanying `WalletTransaction` record.
  - Transactions must have a clear `type` (`top-up`, `purchase`, `refund`), `amount`, `orderId`, and timestamp.
- **Campus Privacy Boundary**:
  - The College Admin dashboard (`/college`) must only surface anonymized, aggregate metrics (order volume, category distribution, total GMV). It must NEVER expose student names, individual IDs, or specific itemized student purchase histories.
- **Kiosk-Optimized UX**:
  - Touch targets on kiosk and student interfaces must meet a minimum size of 44x44px (with 56px preferred for primary actions).
  - Visual hierarchy must prioritize clarity, stock state, and balance visibility.
