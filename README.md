# CampusKart — Interactive Frontend Pitch Demo

A frontend-only, interactive CampusKart prototype built with Vite, React, TypeScript and Tailwind CSS. It is designed for a college presentation and runs without Supabase, server credentials, payment processing or backend services.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:8080).

## Demo presentation flow

1. Open the student storefront and browse the sample catalog.
2. Add products to the cart, choose a same-day window and place an order.
3. Open Parent Portal to view the shared order, fund the demo wallet, set daily/monthly limits, allowed categories and purchase hours, or approve an order.
4. Open Student Wallet to inspect the available balance, allowance and transaction ledger.
5. Open Kiosk for CampusKart ID lookup and the explicitly simulated identity-check step.
6. Open Campus Operations to accept the order and mark it packed.
7. Open Rider to accept the packed order and start the demo delivery route.
8. Return to Operations to verify collection using the student's pickup code.
9. Open College Dashboard to review monthly aggregated activity and export a CSV statement.

Use `/demo` (or the Demo Center navigation link) to edit the sample student, city, institution and hostel. The profile, spending policy, wallet, cart and order state are persisted in local browser storage so all seven experiences share the same data in that browser.

## GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the deployment source. The workflow builds the static `dist/` folder and deploys it. No Supabase variables, secrets, backend or API keys are required.

## Demo limitations

This is a presentation prototype. Browser-local demo state is not synchronized across different devices or visitors. Authentication, student/parent relationship verification, wallet funding, payment processing, inventory reservation, dispatch, OTP pickup validation and reporting are simulations. No real order, payment, delivery, identity verification or invoice is created. Production use requires a trusted backend, authorization, transactional wallet ledger, payment gateway and operational integrations.


## Catalog note

The uploaded project contains 99 sample products. The original CampusKart concept calls for a 271-product catalog; the remaining approved SKU master, prices, images and campus inventory were not present in this project archive. Import that validated master before presenting the full catalog size as live.
