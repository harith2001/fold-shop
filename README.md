# Fold Shop

Fold Shop is a small storefront for folding-bike accessories. It sells the same catalog in three markets — the United Kingdom (GBP), the Netherlands (EUR), and Sri Lanka (LKR) — with language, currency, and list prices staying in lockstep.

**Live demo:** [fold-shop.netlify.app](https://fold-shop.netlify.app)  
**Repository:** [github.com/harith2001/fold-shop](https://github.com/harith2001/fold-shop)

## The problem

A shop that lists in more than one country usually trips over money and language. Floats (`19.99 * 3`) drop pennies. A live FX rate invents a price the warehouse never agreed to. English copy next to euro or rupee amounts looks like a third product. VAT is often added on top of a price that already included it.

Fold Shop is built so those mistakes cannot sneak in: three real list prices per SKU, integer cents, VAT already in the ticket price, and one market switch that moves locale and currency together.

## How it is solved

- **Money is integer cents.** Totals stay whole numbers until display. `Intl.NumberFormat` formats once, at the edge.
- **Each SKU has GBP, EUR, and LKR list prices.** Switching market re-reads the catalog; nothing is converted with a rate.
- **List prices include VAT** (20% in GB, 21% in NL, 18% in LK). Order summaries extract the included amount rather than adding tax on top.
- **Market and language are one setting.** GB is `en-GB` + GBP. NL is `nl-NL` + EUR. LK is `si-LK` + LKR. Those pairings are the only ones the UI can reach.
- **Catalog state lives in Vuex.** Views dispatch actions and read getters; list and card components stay props-only.
- **Local development uses a mock API** on port 4000 (latency, 404s, in-memory data that resets on restart). The Netlify site is a static build, so production reads the same seed catalog from the bundle.

## What works today

- Ten-SKU catalog with names, images, stock, and GBP / EUR / LKR list prices
- Header market switcher: GB · NL · LK updates chrome, product names, currency, number format, and `lang`
- Add-to-cart toast (paper notice, fades after a few seconds, copy follows the active locale)
- Checkout with custom inline field errors — no native browser validation bubbles
- History-mode routes (`/`, `/cart`, `/product/:id`, checkout, success, and failure)
- Loading and error copy through i18n (`en-GB`, `nl-NL`, `si-LK`)
- Unit tests for money, inclusive VAT, the catalog store, market/price UI, and checkout validation

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | Vue 2.7.16 (Options API) |
| Language | TypeScript 4.9 |
| Bundler | Vue CLI 5 |
| Routing | Vue Router 3.6 (history mode) |
| State | Vuex 3.6 |
| i18n | vue-i18n 8.28 |
| HTTP | axios 1.20 |
| Mock API | json-server + a small Express overlay |
| Tests | Jest 27 + Vue Test Utils 1.x |
| Styles | Scoped SCSS |
| Node | 18 LTS (`.nvmrc`) |
| Hosting | Netlify (`/* /index.html 200` so refreshes on nested routes work) |

Dependencies are pinned. There are no caret ranges on Vue, Vuex, Vue Router, vue-i18n, TypeScript, or Jest.

## Getting started

Needs **Node 18** and **npm**. Run the app and the mock API in two terminals.

```bash
git clone https://github.com/harith2001/fold-shop.git
cd fold-shop
npm install

# terminal 1 — catalog and markets on http://localhost:4000
npm run mock

# terminal 2 — SPA, proxies /api to the mock
npm run serve
```

Open [http://localhost:8080](http://localhost:8080).

```bash
npm test
npm run lint
npm run build
```

### Live demo vs local

Netlify serves only the static `dist/` build. It does not run `mock-api/server.js`, so production loads the seed catalog from `mock-api/db.json` inside the bundle. Local `npm run serve` still talks to the mock through the `/api` proxy.

## Markets

| Market | Locale | Currency | VAT (included) |
| --- | --- | --- | --- |
| United Kingdom (`GB`) | `en-GB` | GBP | 20% |
| Netherlands (`NL`) | `nl-NL` | EUR | 21% |
| Sri Lanka (`LK`) | `si-LK` | LKR | 18% |

Switching market reprints prices from the catalog. It does not apply an exchange rate.

## Future work

- Category filter, sort, in-stock toggle, and debounced search
- Empty, loading, and error states on every remaining edge, plus a deeper accessibility pass

Not planned here: Vue 3 / Pinia, real payments, accounts, or a live FX feed.

## License

This project is licensed under the [MIT License](LICENSE).

## Author

Built by [Harith](https://github.com/harith2001).
