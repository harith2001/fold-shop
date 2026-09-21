# Mock API

`npm run mock` starts json-server on port 4000 with a 400–800 ms delay on every request so catalog loading states are real. The product and market catalogs live in `db.json` and are read from disk; when checkout lands, stock changes and idempotency keys stay in memory and reset on restart. There is no persistent warehouse.
