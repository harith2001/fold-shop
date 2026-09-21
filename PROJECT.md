# Fold Shop

Personal Vue 2 + TypeScript storefront built to talk about in a Senior Software Engineer interview (Gapstars / Brompton Digital Commerce). Not a production shop. Not a resume fiction. A small, finished product that forces the same conversations a real Vue 2 commerce codebase forces: Options API, Vuex, money, locales, checkout failure, and changing code you already wrote.

**Repo name:** `fold-shop`  
**Live demo:** GitHub Pages or Netlify (required before the interview)  
**Honesty on CV:** “Vue 2 + TypeScript storefront (personal): cart, multi-market checkout, Vuex, Jest.” Do not list as production.

---

## 1. Why this project exists

The hole on the CV is Vue. React, NestJS, and MarketHub already cover delivery, APIs, and e-commerce backend thinking. This repo exists so the answer to *“tell us about your Vue experience”* is a walkthrough of **this** codebase, not a mapping from React.

What the panel should hear after ten minutes:

- Options API is fluent, not translated live from React.
- Vue 2 reactivity caveats were hit and fixed, not memorised from a blog.
- Cart state lives in Vuex with synchronous mutations and async actions.
- Money is integer cents; formatting is a display concern.
- Two markets (GBP / EUR) with `vue-i18n` and `Intl`.
- Checkout is idempotent on double-click and has a failure path.
- Product page refreshes when only the `:id` in the URL changes.
- Tests cover totals and checkout, not “it renders.”
- Vue 3 was considered and **not** used, because the target storefront is Vue 2.

---

## 2. Product

A tiny D2C shop for folding-bike accessories. Eight to twelve SKUs is enough. The domain is chosen so conversation can move from this repo to Brompton without pretending this *is* Brompton.

**Actors**

| Actor | Can do |
| --- | --- |
| Guest shopper | Browse, filter, search, add to cart, change market, check out |
| Returning guest | Same, with cart restored from `localStorage` |
| System (mock API) | Return catalog, reserve stock, accept or reject payment |

No real accounts, no Keycloak, no Azure, no Kafka. Auth and identity are already covered by other stories. Do not dilute Vue depth with another identity stack.

**Markets**

| Market | Locale | Currency | Tax (demo) |
| --- | --- | --- | --- |
| United Kingdom | `en-GB` | GBP | 20% VAT included in listed price |
| Netherlands | `nl-NL` | EUR | 21% VAT included in listed price |

Prices are stored **per market in cents**. Do not convert GBP→EUR with a live FX rate. Conversion is a lie in a demo and a trap in an interview. Each SKU has `prices: { GBP: 4500, EUR: 5200 }`.

---

## 3. Goals and non-goals

### In scope (MVP — must ship)

- Catalog with category filter, in-stock filter, sort, debounced search
- Product detail page that reloads data when the route param changes
- Vuex cart: add, update qty, remove, persist, restore
- Mini-cart badge (item count) in the header
- Market switcher that re-prices the cart and reformats every number/date
- Checkout: address (minimal), review, pay, success / failure
- Double-submit guard + idempotency key
- Empty, loading, and error states on catalog, PDP, cart, checkout
- Jest + Vue Test Utils on money, cart getters, checkout guard
- One documented Vue 2 reactivity bug (see §12)
- `DECISIONS.md` in the repo (copy of §11)
- README with run instructions and a 90-second interview pitch

### Explicitly out of scope

- Vue 3 / `<script setup>` / Pinia as the implementation (discuss only)
- Nuxt, Vue Storefront, Alokai, BigCommerce
- Real payments, real stock, real shipping APIs
- User accounts, OAuth, Entra ID, MSAL
- Server-side rendering
- Admin CMS
- Pixel-perfect design system
- Micro-frontends, monorepo of packages, Nx/Turborepo
- Full Playwright suite (one optional smoke test is enough)
- B2B dealer pricing (that is Project 2, if time remains)

### Stretch (only after MVP is deployed)

- Guest cart merge rules written down as a test (same SKU, different qty)
- Playwright: add to cart → checkout → success
- `beforeRouteLeave` dirty guard on checkout if the form is half-filled
- Project 2: “inherit a messy Vue 2 module and improve it” (see §18)

---

## 4. Tech stack

Pin versions. Do not “latest.” Vue 2.7 is the last Vue 2 line and still allows TypeScript without Vue 3.

| Concern | Choice | Why |
| --- | --- | --- |
| UI | **Vue 2.7.16** | Matches the target storefront (Options API). 2.7 also *can* use Composition API, which is a talking point, not the default style of this repo. |
| Language | **TypeScript 4.9** | Interview stack is Vue + TS. Stay on 4.9 so `vue-class-component` / shim types stay quiet. Prefer Options API + typed `Vue.extend` / `defineComponent` from Vue 2.7. |
| Bundler | **Vue CLI 5** (`@vue/cli-service`) | Closest to many Vue 2 codebases. Vite + Vue 2 is possible via a plugin; CLI is the conservative interview story. |
| Routing | **Vue Router 3.6** | Vue 2 compatible. History mode. |
| State | **Vuex 3.6** | Mutations vs actions is a question they will ask. Pinia is Vue 3. |
| i18n | **vue-i18n 8.28** | Vue 2 line. Locale + pluralization. |
| HTTP | **axios 1.x** | Interceptors for the mock latency and 409/500 mapping. |
| Mock API | **json-server** plus a tiny **Express** overlay for POST `/checkout` | json-server cannot do idempotent checkout or stock reservation. Overlay handles those two routes. |
| Unit tests | **Jest 27** + **@vue/test-utils 1.x** + **vue-jest** | Matches Vue 2. RTL/Playwright are the client’s React/e2e tools; be honest that those would be learned on the job. |
| E2E (stretch) | **Playwright** | One critical path only. |
| Lint | ESLint + `@vue/eslint-config-typescript` + Prettier | |
| CSS | Plain scoped SCSS, no UI kit | Avoid Vuetify/Element absorbing the interview into “I used a library.” |
| Money display | `Intl.NumberFormat` | No `toFixed` on intermediate totals. |
| IDs | string SKUs (`fold-bag-01`) plus numeric `id` | Stable `:key` is `id`, never index. |

**Node:** 18 LTS.  
**Package manager:** npm.  
**Deploy:** Netlify (SPA redirect all routes to `index.html` because history mode).

### Why not Vue 3

The job’s customer storefront is Vue 2. A Vue 3 portfolio piece does not survive “how does component `v-model` work in Vue 2?” or “why did this array index assignment not re-render?” This repo is interview ammunition for **that** codebase. Vue 3 differences belong in `DECISIONS.md` and in spoken contrast, not in `src/`.

---

## 5. Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Views       │     │  Vuex            │     │  Mock API           │
│  (pages)     │────▶│  catalog         │────▶│  GET /products      │
│              │     │  cart            │     │  GET /products/:id  │
│  Components  │     │  checkout        │     │  GET /markets       │
│  (dumb-ish)  │     │  ui (locale)     │     │  POST /checkout     │
└─────────────┘     └──────────────────┘     └─────────────────────┘
        │                     │
        │                     ▼
        │            localStorage (cart v1)
        ▼
 vue-i18n  +  money.ts  +  tax.ts
```

**Rules**

1. **Views** load data (dispatch actions) and pass props down.
2. **Components** do not call the API. They emit events or dispatch mapped actions.
3. **Never mutate a prop.** Cart lines change only through Vuex mutations.
4. **Money math** lives in `src/domain/money.ts`. Vuex getters call it. Components only format.
5. **Filters for the catalog** live in a computed (`filteredProducts`), never `v-if` + `v-for` on the same node.
6. **Async work** is Vuex actions (or a thin `api/` module called *from* actions). Mutations are synchronous and boring.
7. **The mock API is the source of truth for stock and order ids.** The client may optimistic-update the cart UI; checkout confirmation comes from the server.

This is a scoped SPA, not a layered enterprise app. Do not add a “core/application/infrastructure” folder tree. Interviewers for this role want someone who ships tickets in an existing Vue 2 tree, not a hexagonal rewrite.

---

## 6. Repository layout

```
fold-shop/
├── PROJECT.md                 ← this file (or a short pointer to it)
├── DECISIONS.md               ← copy of §11, kept in the public repo
├── README.md
├── package.json
├── tsconfig.json
├── vue.config.js              ← history-mode publicPath, proxy to mock API
├── babel.config.js
├── jest.config.js
├── .nvmrc                     ← 18
├── public/
│   ├── index.html
│   └── images/                ← 12 product photos, compressed
├── mock-api/
│   ├── db.json                ← products, markets
│   ├── server.js              ← json-server + POST /checkout
│   └── README.md
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── shims-vue.d.ts
│   ├── shims-tsx.d.ts
│   ├── router/
│   │   └── index.ts
│   ├── store/
│   │   ├── index.ts           ← modules + persist plugin
│   │   ├── catalog.ts
│   │   ├── cart.ts
│   │   ├── checkout.ts
│   │   └── ui.ts              ← locale, market
│   ├── api/
│   │   ├── client.ts          ← axios instance
│   │   ├── products.ts
│   │   └── checkout.ts
│   ├── domain/
│   │   ├── types.ts
│   │   ├── money.ts
│   │   ├── tax.ts
│   │   └── cart.ts            ← pure functions: addLine, changeQty, merge
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── en-GB.json
│   │   └── nl-NL.json
│   ├── views/
│   │   ├── CatalogView.vue
│   │   ├── ProductView.vue
│   │   ├── CartView.vue
│   │   ├── CheckoutView.vue
│   │   ├── OrderSuccessView.vue
│   │   ├── OrderFailedView.vue
│   │   └── NotFoundView.vue
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── MarketSwitcher.vue
│   │   ├── SearchInput.vue
│   │   ├── ProductCard.vue
│   │   ├── ProductList.vue
│   │   ├── PriceTag.vue
│   │   ├── CartLine.vue
│   │   ├── CartSummary.vue
│   │   ├── StockBadge.vue
│   │   └── ErrorBanner.vue
│   ├── composables/           ← empty in MVP; do not use unless a stretch
│   └── assets/
│       └── styles/
│           └── main.scss
└── tests/
    ├── unit/
    │   ├── money.spec.ts
    │   ├── cart-getters.spec.ts
    │   ├── cart-mutations.spec.ts
    │   ├── catalog-filter.spec.ts
    │   ├── checkout-guard.spec.ts
    │   └── ProductView.route.spec.ts
    ├── setup.ts
    └── e2e/                   ← stretch
        └── checkout.spec.ts
```

Every `.vue` file in MVP uses **Options API** (`export default Vue.extend({ ... })` or `defineComponent`). No class components. No `vue-property-decorator`.

---

## 7. Domain model

```ts
// src/domain/types.ts

export type CurrencyCode = 'GBP' | 'EUR';
export type MarketId = 'GB' | 'NL';
export type LocaleId = 'en-GB' | 'nl-NL';

export interface Market {
  id: MarketId;
  locale: LocaleId;
  currency: CurrencyCode;
  /** VAT rate in basis points, e.g. 2000 = 20.00% */
  vatBps: number;
  /** Display prices include VAT */
  pricesIncludeVat: true;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  nameKey: string;          // i18n key, not a raw English string
  descriptionKey: string;
  category: 'bags' | 'lights' | 'racks' | 'covers';
  image: string;
  /** Integer minor units per currency. Never a float. */
  prices: Record<CurrencyCode, number>;
  stock: number;            // units available in the mock warehouse
  weightGrams: number;
}

export interface CartLine {
  productId: number;
  sku: string;
  qty: number;
  /** Unit price in cents captured at add-to-cart for that market */
  unitPriceCents: number;
  currency: CurrencyCode;
}

export interface CartState {
  version: 1;
  marketId: MarketId;
  lines: CartLine[];
  /** ISO timestamp */
  updatedAt: string;
}

export interface CheckoutPayload {
  idempotencyKey: string;
  marketId: MarketId;
  currency: CurrencyCode;
  lines: Array<{ productId: number; qty: number; unitPriceCents: number }>;
  customer: {
    email: string;
    name: string;
    country: MarketId;
  };
}

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; code: 'OUT_OF_STOCK' | 'PRICE_MISMATCH' | 'PAYMENT_FAILED' | 'DUPLICATE' };
```

### Money

All arithmetic is integer cents.

```ts
// src/domain/money.ts — behaviour, not exact code

export function lineTotal(unitPriceCents: number, qty: number): number {
  return unitPriceCents * qty;
}

export function subtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l.unitPriceCents, l.qty), 0);
}

/** Demo rule: 10% off subtotal when subtotal > 10000 cents in that currency. */
export function discount(subtotalCents: number): number {
  return subtotalCents > 10000 ? Math.floor(subtotalCents * 0.1) : 0;
}

export function payable(subtotalCents: number): number {
  return subtotalCents - discount(subtotalCents);
}

export function formatCents(cents: number, locale: LocaleId, currency: CurrencyCode): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}
```

**Invariants**

- Never store a number that has been through `toFixed`.
- Never add GBP cents to EUR cents. Switching market **re-prices** every line from the catalog’s `prices[newCurrency]`. Quantities stay; captured `unitPriceCents` and `currency` update.
- If a product has no price for the new market, drop the line and show a banner. Do not guess.

### Tax

Listed prices include VAT. Checkout summary shows:

- Subtotal (inc. VAT)
- Discount
- VAT amount (extracted, not added): `vat = round(payable * vatBps / (10000 + vatBps))` is **wrong** for included tax.

Correct extract from a VAT-inclusive payable amount:

```
vat = payable - round(payable * 10000 / (10000 + vatBps))
```

Use integer math only. Put a unit test: GB, payable `12000` cents (£120.00) at 20% inclusive → VAT `2000` cents, net `10000`. NL, 21% on `12100` → VAT `2100`, net `10000`.

You do not need a tax engine. You need one correct function and the ability to say “inclusive vs exclusive is the actual complexity, not the Vue.”

---

## 8. Mock API

`npm run mock` starts Express on `http://localhost:4000`. Vue CLI proxies `/api` → `4000`.

### `GET /api/markets`

Returns the two markets in §2.

### `GET /api/products`

Query: `?category=&q=` (optional). Server may ignore filters; the client still filters in a computed so the interview can discuss that choice. Prefer **client-side filter on the 12 SKUs** and say so: “at this size a round trip is theatre.”

### `GET /api/products/:id`

404 if missing.

### `POST /api/checkout`

Headers: `Idempotency-Key: <uuid>`.

Body: `CheckoutPayload`.

Behaviour:

1. If the key was seen and succeeded → `200` same `orderId` (`DUPLICATE` is **not** an error for the client; it is success replay).
2. If any line qty > current stock → `409` `{ code: 'OUT_OF_STOCK', productId }`.
3. If any `unitPriceCents` ≠ current catalog price for that market → `409` `{ code: 'PRICE_MISMATCH' }`.
4. If `x-demo-fail: payment` header or email `fail@pay.test` → `402` `{ code: 'PAYMENT_FAILED' }`.
5. Else decrement stock, store order, `201` `{ orderId }`.

Simulate 400–800 ms latency so the UI loading state is real.

`db.json` is the catalog. Stock mutations live in memory (reset on server restart). That is fine; mention it if asked.

---

## 9. Vuex modules

Namespaced modules. No flattened global soup.

### `ui`

```
state: { locale: 'en-GB', marketId: 'GB' }
mutations: SET_MARKET
actions: setMarket({ commit, dispatch }, marketId)
         → commit SET_MARKET
         → dispatch('cart/reprice', marketId)
         → load vue-i18n locale
getters: market, currency, locale
```

### `catalog`

```
state: { items: Product[], loading: boolean, error: string | null, activeId: number | null }
mutations: SET_ITEMS, SET_LOADING, SET_ERROR, SET_ACTIVE
actions: fetchAll, fetchOne(id)
getters: byId: (state) => (id) => ...,
         inStock, byCategory
```

### `cart`

```
state: CartState
mutations: (sync only)
  HYDRATE(payload)
  ADD_LINE(line)
  SET_QTY({ productId, qty })
  REMOVE_LINE(productId)
  CLEAR
  REPRICE({ currency, pricesByProductId })
  SET_MARKET(marketId)
getters:
  itemCount         // sum of qty
  subtotalCents
  discountCents
  payableCents
  vatCents
  isEmpty
  lineByProductId
actions:
  add(product)            // read market + price, commit ADD_LINE or SET_QTY
  persist                 // write localStorage
  restore                 // version check; drop unknown versions
  reprice(marketId)
```

**Persist plugin:** subscribe to `cart` mutations, write `{ version: 1, ... }`. Key: `fold-shop:cart:v1`. On restore, if `version !== 1`, discard.

### `checkout`

```
state: {
  submitting: boolean,
  idempotencyKey: string | null,
  lastError: CheckoutResult | null,
  orderId: string | null
}
mutations: SET_SUBMITTING, SET_KEY, SET_ERROR, SET_ORDER, RESET
actions:
  start()                 // if no key, generate uuid; never generate a second key while submitting
  submit(payload)         // POST; map 409/402; on 201 dispatch cart/CLEAR
```

The idempotency key is created when the user **lands on the pay step** or first clicks Pay, and is **reused** until success or until they change the cart. Changing the cart (any `cart/*` mutation) clears the key. That is a decision you must be able to defend: a new cart is a new order.

---

## 10. Routing

History mode. Netlify `_redirects`: `/* /index.html 200`.

| Path | Name | Component | Notes |
| --- | --- | --- | --- |
| `/` | `catalog` | `CatalogView` | |
| `/product/:id` | `product` | `ProductView` | `props: true`. **Watch `$route.params.id`.** |
| `/cart` | `cart` | `CartView` | |
| `/checkout` | `checkout` | `CheckoutView` | `meta.requiresCart: true` |
| `/order/:orderId` | `success` | `OrderSuccessView` | |
| `/order-failed` | `failed` | `OrderFailedView` | query `?code=` |
| `*` | `not-found` | `NotFoundView` | Vue Router 3 catch-all |

**Navigation guard**

```ts
router.beforeEach((to, from, next) => {
  if (to.meta.requiresCart && store.getters['cart/isEmpty']) next({ name: 'catalog' });
  else next();
});
```

Call `next` exactly once.

**Product view contract (this is a scored interview topic)**

Navigating `/product/1` → `/product/2` **reuses the same component instance**. `created` / `mounted` do not run again.

Required implementation:

```ts
watch: {
  '$route.params.id': {
    immediate: true,
    handler(id: string) {
      this.load(Number(id));
    }
  }
}
```

Also acceptable: `beforeRouteUpdate`. Putting `:key="$route.fullPath"` on `<router-view>` is a third option; use the watch so you can *explain* the reuse, not hide it.

On `load`, abort or ignore stale responses if the user clicks quickly (simple `requestId` increment is enough).

---

## 11. Decisions (copy into `DECISIONS.md`)

### D1 — Vue 2.7, not Vue 3

The storefront we are interviewing for is Vue 2 + TypeScript. Vue 3 would practise the wrong `v-model`, the wrong lifecycle names, and would skip `Vue.set`. Composition API is available on 2.7 and is unused in MVP so the repo looks like the codebase we would join.

### D2 — Options API, not class components

Class + decorator style (`vue-class-component`) still exists in older TS Vue 2 apps. Options API is what TestDome and most Vue 2 storefronts use. `Vue.extend` / `defineComponent` for types.

### D3 — Vuex 3, not Pinia

Pinia has no mutations. The interview will ask why mutations must be synchronous. Vuex is the tool that makes that question real.

### D4 — Money as integer cents

Floats (`19.99 * 3`) produce binary dust. `toFixed` on intermediate values drops pennies. Format once, at the edge, with `Intl.NumberFormat`.

### D5 — No live FX

A folding-bike shop with two list prices is how multi-market catalogs actually work at this size. FX would imply a rate feed, rounding rules, and stale rates — out of scope and easy to get wrong on stage.

### D6 — Client-side catalog filter

Twelve SKUs. Filtering in a computed is the Vue lesson (`v-if` + `v-for` is an anti-pattern; Vue 2 vs 3 priority differs). If the catalog were thousands of rows, this decision would reverse. Say that out loud.

### D7 — VAT-inclusive list prices

UK/NL retail for this category is typically VAT-inclusive. The code **extracts** VAT for the summary rather than adding it. That is the commercially honest model and a better talking point than `price * 1.2`.

### D8 — Idempotent checkout, button disabled

Double-click and retry-after-timeout are the real checkout bugs. The mock API keys on `Idempotency-Key`. The client never mints a second key while `submitting === true`. Cart edits invalidate the key.

### D9 — Do not mutate props; emit or commit

`shopping-cart` style components receive data and emit `remove` / `change-qty`, or map Vuex actions. Splicing a prop array is an automatic fail in assessments and in review.

### D10 — Do not rewrite to Vue 3 later in this repo

A “migration” would look like greenfield heroics. The job description wants people who improve existing Vue 2. If a second weekend exists, spend it on tests and a messy-module cleanup (Project 2), not on `createApp`.

### D11 — localStorage cart with a version key

Without `version`, a future shape change crashes the homepage for anyone who visited last week. Discard unknown versions. Same idea as a schema migration, without a database.

### D12 — No `v-html` of product copy

XSS is a free own-goal. Product names come from i18n JSON you control. If markdown is ever added, sanitise; until then, interpolation only.

---

## 12. The reactivity bug you must actually hit

Do this as a commit, then fix it in the next commit. Keep both commits. Interviewers can be shown the diff.

**Broken (commit `feat: add promo flag on a cart line`):**

```ts
// inside a mutation or a method
this.lines[index].promo = true;          // new property — Vue 2 will not detect
// or
this.lines[0] = newLine;                 // index assignment — Vue 2 will not detect
```

UI does not update. Devtools may still show the data.

**Fixed:**

```ts
Vue.set(this.lines[index], 'promo', true);
// or
this.lines.splice(0, 1, newLine);
```

README section “Vue 2 reactivity” links those two commits. Spoken answer:

> Vue 2 tracks properties that existed when the object was made reactive. New keys and `arr[i] = x` are invisible. `Vue.set` / `.splice` notify the dependency tracker. Vue 3’s Proxy removes this; this codebase is Vue 2, so I treat it as a real constraint.

Also implement, and be ready to state:

- `data()` must be a function in a component (shared definition object).
- `v-for` `:key` is a stable id, not the index.
- `v-if` + `v-for` on the same node: Vue 2 prefers `v-for`; still do not do it.
- Component `v-model` in Vue 2 is `value` + `$emit('input')`, not `modelValue`.

---

## 13. UI and UX (keep it boring)

One column on mobile, header + content on desktop. System font stack. Black / off-white / one accent. No animations beyond a disabled Pay button and a spinner.

**Header:** logo, catalog link, market switcher, search (optional in header or catalog only), cart icon + `itemCount`.

**Catalog:** grid of `ProductCard` (image, name, `PriceTag`, `StockBadge`, add-to-cart). Filter chips for category. Sort: price asc/desc, name. Checkbox: in stock only.

**PDP:** image, name, description, price, qty stepper, add to cart, “out of stock” disabled state. Related products: three others in the same category, links that trigger the `$route` watch.

**Cart:** lines with qty, remove, `CartSummary` (subtotal, discount, VAT, payable). Empty state CTA to catalog.

**Checkout:** three fields only — name, email, country (pre-filled from market). Pay button shows payable. While submitting: button disabled, label `Paying…`. Errors from API mapped to i18n strings.

**Copy:** all user-visible strings through `$t`. Including error codes.

**A11y minimum:** one `h1` per view, buttons are `<button>`, form labels, focus visible, cart count on the icon has `aria-label`.

---

## 14. i18n

Files: `en-GB.json`, `nl-NL.json`. Nested keys.

```
catalog.title
catalog.empty
product.addToCart
product.outOfStock
cart.empty
cart.remove
checkout.pay
checkout.paying
errors.OUT_OF_STOCK
errors.PRICE_MISMATCH
errors.PAYMENT_FAILED
```

Pluralization for cart badge: `cart.itemsCount` with `{n} item | {n} items` (English) and Dutch equivalents. Use vue-i18n 8 plural pipes.

Market switcher changes **both** `vue-i18n.locale` and Vuex `ui.marketId`. Language and currency stay aligned (GB→en-GB+GBP, NL→nl-NL+EUR). Do not allow English + EUR; it is a third product decision you do not have time to defend.

Dutch translations can be imperfect. Mark a comment in `nl-NL.json` that they are interview-demo quality. Better an honest demo than machine-translated legal copy.

---

## 15. Component contracts

### `PriceTag.vue`

Props: `cents: number`, `locale`, `currency`. Renders `formatCents`. No math.

### `ProductCard.vue`

Props: `product: Product`. Emits `add`. Displays price for current market via mapped getter. Does not read Vuex cart.

### `CartLine.vue`

Props: `line: CartLine`, `name: string`, `image: string`. Emits `change-qty` `{ productId, qty }`, `remove` `productId`. Qty `1..stock` (stock from catalog getter). If qty would exceed stock, emit nothing and show a short error.

### `SearchInput.vue`

`v-model` on the parent query string **or** Vue 2 component v-model (`value` + `input`). Debounce 300 ms in the parent watch, not inside a chain of child timers. Clear the timer in `beforeDestroy`.

### `MarketSwitcher.vue`

`<select>` of markets. `@change` → `dispatch('ui/setMarket')`. Confirm if cart is non-empty: “Prices will update to the new market.” Cancel leaves the select on the old value.

---

## 16. Testing

Run with `npm test`. No snapshot tests.

| File | Asserts |
| --- | --- |
| `money.spec.ts` | line totals; discount threshold exclusive (`10000` → 0 off, `10001` → 10%); `payable`; `formatCents` for GBP and EUR |
| `tax.spec.ts` | inclusive VAT extract for 20% and 21% on round numbers |
| `cart-mutations.spec.ts` | ADD_LINE merges qty for same `productId`; SET_QTY 0 removes; REPRICE updates cents + currency; never mutates input product |
| `cart-getters.spec.ts` | `itemCount`, empty cart, discount applied |
| `catalog-filter.spec.ts` | computed filter helper (export the pure function from `domain` or a `filters.ts` if easier than mounting the view) |
| `checkout-guard.spec.ts` | second `submit` while `submitting` does not mint a new key; cart mutation clears key |
| `ProductView.route.spec.ts` | stub `$route`, change `params.id`, assert `fetchOne` called with the new id |

Mounting Vue 2 components: `@vue/test-utils` `shallowMount`, stub Vuex with `localVue.use(Vuex)` and a real module for cart tests (preferred) or a mocked store for views.

**Do not** chase 100% coverage. These tests exist so you can say what you test at each layer: pure domain, store, one routing gotcha.

---

## 17. Scripts and local run

```json
{
  "scripts": {
    "mock": "node mock-api/server.js",
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "test": "vue-cli-service test:unit",
    "lint": "vue-cli-service lint"
  }
}
```

`vue.config.js` devServer proxy: `'/api' → 'http://localhost:4000'`.

README “Quick start”: Node 18, two terminals (`mock`, `serve`), `npm test`.

---

## 18. Follow-on: Project 2 (only if MVP is live)

**Name:** `fold-shop-legacy` branch or a folder `legacy-notes/`.

Take `store/cart.ts` *before* namespacing (or a deliberately messy extra module `eventBus.ts` + index-keyed list) and open a series of small PRs:

1. Add a unit test around payable.
2. Replace `$root.$on` / event bus with Vuex.
3. Change `v-for` keys from index to `id`.
4. Remove one `v-html`.
5. Leave unrelated mess.

`LEGACY.md` explains what you did **not** rewrite. Spoken link: Gold Trust defect work — read the path, change the smallest safe thing.

Do not start Project 2 until `/` , PDP, cart, and checkout work on the deployed URL.

---

## 19. Build plan (7 evenings)

Do not start evening 4 until evening 3 is on GitHub.

| Evening | Outcome |
| --- | --- |
| 1 | Scaffold Vue CLI 5 + TS. Router skeleton. `types.ts`, `money.ts`, `formatCents`. `mock-api` with 10 products. Catalog view renders names and prices. |
| 2 | Vuex `catalog` + `ui`. Market switcher. i18n en-GB + nl-NL for catalog strings. `PriceTag`. |
| 3 | Vuex `cart`, persist, `CartView`, header badge. Add / qty / remove. Tests: mutations + getters. |
| 4 | `ProductView` with `$route` watch + related products. Debounced search + `beforeDestroy`. Reactivity bug commit + fix commit. |
| 5 | Checkout + mock `POST /checkout`. Idempotency. Success/fail views. VAT extract on summary. |
| 6 | Tests for tax, checkout guard, ProductView route. Empty/error/loading everywhere. A11y pass. |
| 7 | Deploy. README + DECISIONS.md. Rehearse the 90-second pitch against the live site. Record the two reactivity commits in README. |

If an evening slips, cut related products, Dutch copy quality, and Playwright. Do not cut cents, Vuex, route watch, or checkout failure.

---

## 20. Acceptance criteria (definition of done)

The project is done when all of the following are true:

1. `npm run serve` + `npm run mock` shows catalog, PDP, cart, checkout without console errors.
2. Switching GB ↔ NL changes language, currency symbol, and every line’s unit price.
3. Cart survives a refresh; wiping `localStorage` empties it.
4. `/product/1` → click related `/product/2` updates title and price without a full remount (watch works).
5. Pay double-click creates **one** order in the mock API log.
6. `fail@pay.test` shows the failed view, cart still populated.
7. An SKU with `stock: 0` cannot be added; checkout 409 on oversell if stock was decremented in another tab (optional to demo; at least the 409 handler exists).
8. `npm test` green.
9. Production build is deployed; refreshing `/cart` does not 404.
10. README contains the pitch in §21 and links the reactivity commits.

---

## 21. Interview pitch (memorise, do not read)

> React is my daily driver. I built Fold Shop in Vue 2.7 and TypeScript to get production-shaped reps on the Options API, Vuex, and the Vue 2 reactivity system. It is a two-market accessory shop: prices in integer cents, VAT-inclusive summaries, vue-i18n for en-GB and nl-NL. Cart lives in a namespaced Vuex module — async work in actions, synchronous mutations — and persists with a schema version. The two bugs I care about in the demo: the product page reuses the component when only the id changes, so I watch `$route`; and a new field on a cart line did not re-render until `Vue.set`. Checkout sends an idempotency key and ignores a second click while the request is in flight. I did not rewrite it to Vue 3, because the storefront I would be joining is Vue 2.

**Follow-ups to have cold**

| They ask | You answer |
| --- | --- |
| Why not Pinia? | Vue 2 storefront; they will ask about mutations. Pinia is the Vue 3 default; I would use it on a new surface. |
| Why cents? | Binary floats and `toFixed` on running totals lose pennies. Format at the edge. |
| How does component v-model work? | Vue 2: `value` + `input`. Vue 3: `modelValue` + `update:modelValue`. |
| v-if vs v-show? | Destroy vs `display:none`. Frequent toggle → `v-show`. Rare/expensive → `v-if`. |
| First month on their codebase? | Trace one checkout path, ship small reviewed changes, no rewrite. Same as this repo’s D10. |
| Testing? | Jest + Vue Test Utils on money and store. Playwright on the critical path is what I would add with the team; I have one stretch spec. |

---

## 22. CV and GitHub hygiene

**CV line (one):** Fold Shop — Vue 2.7, TypeScript, Vuex, vue-i18n. Multi-market cart and idempotent checkout. Jest. `github.com/<you>/fold-shop`

**README structure**

1. One-paragraph what / why  
2. Screenshot  
3. Stack  
4. Quick start  
5. Decisions (link)  
6. Vue 2 reactivity (link commits)  
7. What I would do next (Playwright, dealer pricing, Vue 3 on a *new* app only)

**Do not** put `.env` secrets (there are none). Do not commit `node_modules`. Do not use a private repo if you want to paste the URL in the call.

**Git history:** real commits, not one dump. Evening plan ≈ commit groups. `feat:`, `fix:`, `test:`, `docs:` is enough.

---

## 23. Seed catalog (minimum 10 SKUs)

Use these ids so tests and screenshots stay stable.

| id | sku | category | GBP cents | EUR cents | stock |
| --- | --- | --- | --- | --- | --- |
| 1 | fold-bag-01 | bags | 8900 | 9900 | 12 |
| 2 | fold-bag-02 | bags | 12500 | 13900 | 4 |
| 3 | light-front | lights | 3500 | 3900 | 20 |
| 4 | light-rear | lights | 2900 | 3200 | 20 |
| 5 | rack-rear | racks | 7900 | 8900 | 6 |
| 6 | cover-night | covers | 4500 | 4900 | 8 |
| 7 | cover-rain | covers | 5200 | 5800 | 0 |
| 8 | light-set | lights | 5900 | 6500 | 10 |
| 9 | bag-mini | bags | 4900 | 5500 | 15 |
| 10 | rack-front | racks | 6400 | 7200 | 3 |

`cover-rain` is the permanent out-of-stock demo. `fold-bag-02` is the over-£100 / over-€100 discount trigger when qty ≥ 1 (GBP 12500 already exceeds 10000). Put that in a test.

Images: unsplash/compressed placeholders, or solid colour cards with SKU text if photos eat the week.

---

## 24. File-level notes for the tricky files

### `src/main.ts`

Create router, store, i18n, `new Vue({ router, store, i18n, render: h => h(App) }).$mount('#app')`. Restore cart **before** first navigation (`store.dispatch('cart/restore')`).

### `src/store/index.ts`

```ts
export default new Vuex.Store({
  modules: {
    ui,
    catalog,
    cart,
    checkout
  }
});
```

Enable `strict: process.env.NODE_ENV !== 'production'` so accidental state edits outside mutations fail in dev. That is a teaching feature; mention it.

### `src/domain/cart.ts`

Pure functions used by mutations, so mutations stay one-liners and tests do not need Vue:

- `addLine(lines, incoming): CartLine[]`
- `setQty(lines, productId, qty): CartLine[]` — qty `< 1` removes
- `reprice(lines, currency, priceLookup): CartLine[]`

Mutations assign `state.lines = addLine(...)` (replace the array). Replacement is detectable. Index assignment is not. Prefer replacement.

### `mock-api/server.js`

json-server for GET. Custom router for POST `/api/checkout`. In-memory `Map` for idempotency keys. Log every checkout line to the console so a demo can show “one request, one order.”

---

## 25. What this is not allowed to become

If a choice would make the README longer than the product, cut the choice. The interview is won by a deployed Vue 2 cart with a route-watch bugfix and a `Vue.set` story, not by a design system.

When in doubt, implement less UI and more of: cents, Vuex, i18n, idempotency, tests, README.
