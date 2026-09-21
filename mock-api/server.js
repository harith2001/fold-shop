/**
 * Fold Shop mock API.
 *
 * json-server serves GET /api/markets and GET /api/products from db.json.
 * POST /api/checkout is added in S15 — json-server cannot do idempotent
 * checkout or in-memory stock reservation, so an Express overlay will own
 * that route. Catalog rows stay on disk; stock mutations (when they exist)
 * live in memory and reset when this process exits.
 */
const path = require('path');
const jsonServer = require('json-server');

const PORT = 4000;
const MIN_LATENCY_MS = 400;
const MAX_LATENCY_MS = 800;

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ logger: true });

function latencyMs() {
  return MIN_LATENCY_MS + Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS + 1));
}

server.use(middlewares);
server.use((req, res, next) => {
  setTimeout(next, latencyMs());
});
server.use(jsonServer.rewriter({ '/api/*': '/$1' }));
server.use(router);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Fold Shop mock API listening on http://localhost:${PORT}`);
});
