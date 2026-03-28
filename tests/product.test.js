const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server/config/app');
const Product = require('../server/models/Product');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pim_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Product.deleteMany({});
});

describe('Product API', () => {
  const validProduct = { name: 'Test Product', price: 19.99, stockStatus: 'instock', status: 'draft' };

  test('GET /api/products — returns empty list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  test('POST /api/products — creates product', async () => {
    const res = await request(app).post('/api/products').send(validProduct);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product');
  });

  test('POST /api/products — rejects missing name', async () => {
    const res = await request(app).post('/api/products').send({ price: 10 });
    expect(res.status).toBe(400);
  });

  test('PUT /api/products/:id — updates product', async () => {
    const created = await Product.create(validProduct);
    const res = await request(app).put(`/api/products/${created._id}`).send({ name: 'Updated', price: 25 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  test('DELETE /api/products/:id — deletes product', async () => {
    const created = await Product.create(validProduct);
    const res = await request(app).delete(`/api/products/${created._id}`);
    expect(res.status).toBe(200);
  });
});
