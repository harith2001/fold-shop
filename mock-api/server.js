/**
 * Fold Shop mock API.
 *
 * json-server serves GET /api/markets and GET /api/products from db.json.
 * POST /api/checkout is an Express overlay: idempotent replay, stock/price
 * checks, forced payment failure, then success with in-memory stock decrement.
 * Catalog rows are copied into memory at boot; stock mutations reset on restart.
 */
const path = require('path');
const jsonServer = require('json-server');
const db = require('./db.json');

const PORT = 4000;
const MIN_LATENCY_MS = 400;
const MAX_LATENCY_MS = 800;

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ logger: true });

const catalog = db.products.map((product) => ({
  ...product,
  prices: { ...product.prices }
}));
const successfulOrders = new Map();

function latencyMs() {
  return MIN_LATENCY_MS + Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS + 1));
}

const { evaluateCheckout } = require('./evaluate-checkout');

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  setTimeout(next, latencyMs());
});

server.post('/api/checkout', (req, res) => {
  const idempotencyKey = req.get('Idempotency-Key') || '';
  const payload = req.body || {};
  const forceFail =
    req.get('x-demo-fail') === 'payment' ||
    (payload.customer && payload.customer.email === 'fail@pay.test');
  const result = evaluateCheckout({
    idempotencyKey,
    payload,
    forceFail,
    catalog,
    successfulOrders
  });

  if (result.replay) {
    // eslint-disable-next-line no-console
    console.log('checkout replay', { orderId: result.body.orderId, idempotencyKey });
  }

  if (result.decrement) {
    (payload.lines || []).forEach((line) => {
      const product = catalog.find((item) => item.id === line.productId);
      if (product) {
        product.stock -= line.qty;
      }
    });
    if (idempotencyKey) {
      successfulOrders.set(idempotencyKey, { orderId: result.body.orderId });
    }
    // eslint-disable-next-line no-console
    console.log('checkout', { orderId: result.body.orderId, idempotencyKey, lines: payload.lines });
  }

  res.status(result.status).json(result.body);
});

server.use(jsonServer.rewriter({ '/api/*': '/$1' }));
server.use(router);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Fold Shop mock API listening on http://localhost:${PORT}`);
});
