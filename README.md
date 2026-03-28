# PIM System — WooCommerce Integration

A production-ready **Product Information Management (PIM)** system that integrates with WooCommerce via its REST API. Built with the MERN stack.

---

## Features

- Pull products from WooCommerce into a central MongoDB catalog
- Create, edit, and delete products via a clean dashboard UI
- Push product changes back to WooCommerce (individual or bulk)
- Search and filter by name, status, category
- Pagination, validation, and error handling throughout
- Mock WooCommerce mode — works without a live store
- Swap to a real WooCommerce store by adding three environment variables

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, React Router v6           |
| Backend  | Node.js, Express                    |
| Database | MongoDB (Mongoose ODM)              |
| Security | Helmet, CORS, Rate Limiting, express-validator |
| Logging  | Winston                             |
| Testing  | Jest, Supertest                     |

---

## Prerequisites

- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)
- npm

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/pim-woocommerce.git
cd pim-woocommerce
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pim_system
USE_MOCK_WOOCOMMERCE=true
```

### 3. Install dependencies

```bash
npm run install:all
```

### 4. Start development servers

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## Connecting a Real WooCommerce Store

When you have a WooCommerce store ready:

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Create an API key with **Read/Write** permissions
3. Update `.env`:

```env
USE_MOCK_WOOCOMMERCE=false
WC_BASE_URL=https://your-store.com
WC_CONSUMER_KEY=ck_your_key
WC_CONSUMER_SECRET=cs_your_secret
```

4. Restart the server — no code changes needed.

---

## API Reference

### Products

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/products         | List products (paginated, filterable) |
| GET    | /api/products/:id     | Get single product   |
| POST   | /api/products         | Create product       |
| PUT    | /api/products/:id     | Update product       |
| DELETE | /api/products/:id     | Delete product       |

**Query params for GET /api/products:**
- `page`, `limit` — pagination
- `search` — full-text search
- `status` — filter by draft/published/pending
- `category` — filter by category name

### Sync

| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| POST   | /api/sync/pull        | Import all products from WooCommerce |
| POST   | /api/sync/push/:id    | Push one product to WooCommerce |
| POST   | /api/sync/push-all    | Push all unsynced products      |

---

## Running Tests

```bash
npm test
```

---

## Project Structure

```
pim-woocommerce/
├── server/
│   ├── config/        # Express app, MongoDB connection
│   ├── controllers/   # Route handler logic
│   ├── middleware/     # Validation, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── services/       # WooCommerce API service (mock + real)
│   └── utils/          # Logger
├── client/
│   └── src/
│       ├── components/ # Layout, shared UI
│       ├── pages/      # Dashboard, ProductList, ProductForm
│       └── services/   # Axios API client
├── tests/              # Jest + Supertest tests
├── .env.example
└── README.md
```

---

## Security

- **Helmet** sets secure HTTP headers
- **CORS** restricted to frontend origin in production
- **Rate limiting** — 100 requests per 15 minutes per IP
- **Input validation** on all POST/PUT endpoints via express-validator
- **No secrets in code** — all credentials via `.env` (never committed)
- **Stack traces hidden** in production error responses

---

## Future Scope

- [ ] Product image upload and management
- [ ] Variant/attribute matrix support
- [ ] Bulk CSV import/export
- [ ] Webhook listener for real-time WooCommerce sync
- [ ] User authentication with JWT
- [ ] Category management UI

---

## License

MIT
