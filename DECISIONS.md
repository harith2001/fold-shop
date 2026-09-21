# Decisions

Copied from `PROJECT.md` §11. These are the calls this repo is willing to defend in an interview.

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

### D13 — Bundled catalog on Netlify

The mock API is a Node process on `localhost:4000`. Netlify serves the static `dist/` build only, so `GET /api/products` 404s in production. The production bundle reads `mock-api/db.json` in the client (`NODE_ENV === 'production'`). Local `npm run serve` still proxies to the mock so loading latency and 404s stay real. Checkout will need the same split when that story lands — either a hosted mock or a Netlify function — because stock and idempotency cannot live only in the browser.
