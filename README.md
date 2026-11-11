# CampusKart — Frontend Demo

A frontend-only, interactive CampusKart prototype built with Vite, React, TypeScript and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:8080).

## GitHub Pages

This repository deploys the static `dist/` build using the GitHub Actions workflow at `.github/workflows/deploy-pages.yml`. In repository Settings → Pages, select **GitHub Actions** as the deployment source. No Supabase project, secrets, variables, database or backend service is required.

## Demo behavior

- Product catalog, city selection, cart, sample orders and parent spending controls run in the browser.
- Cart, city selection and parent settings are saved in browser local storage.
- Checkout creates a local demonstration order only. No payment, real fulfillment, real identity verification or backend order is created.
- Each visitor has their own local demo state. Changes made by one visitor do not sync to other visitors or devices.
- Parent dashboard transaction figures are labeled sample demo data.
