function evaluateCheckout({ idempotencyKey, payload, forceFail, catalog, successfulOrders }) {
  const replay = idempotencyKey ? successfulOrders.get(idempotencyKey) : null;
  if (replay) {
    return { status: 200, body: { orderId: replay.orderId }, replay: true };
  }

  const lines = Array.isArray(payload.lines) ? payload.lines : [];
  const market = payload.marketId;
  const currency =
    market === 'NL' ? 'EUR' : market === 'GB' ? 'GBP' : market === 'LK' ? 'LKR' : null;

  const stockLine = lines.find((line) => {
    const product = catalog.find((item) => item.id === line.productId);
    return !product || line.qty > product.stock;
  });
  if (stockLine) {
    return { status: 409, body: { code: 'OUT_OF_STOCK', productId: stockLine.productId } };
  }

  const priceMismatch = lines.some((line) => {
    const product = catalog.find((item) => item.id === line.productId);
    return !product || currency == null || product.prices[currency] !== line.unitPriceCents;
  });
  if (priceMismatch) {
    return { status: 409, body: { code: 'PRICE_MISMATCH' } };
  }

  if (forceFail) {
    return { status: 402, body: { code: 'PAYMENT_FAILED' } };
  }

  const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return { status: 201, body: { orderId }, decrement: true };
}

module.exports = { evaluateCheckout };
