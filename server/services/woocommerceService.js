const axios = require('axios');
const logger = require('../utils/logger');

// Mock product data simulating WooCommerce API response
const MOCK_PRODUCTS = [
  { id: 1, name: 'Classic White Tee', sku: 'CWT-001', description: 'Premium cotton t-shirt', regular_price: '29.99', sale_price: '', stock_status: 'instock', stock_quantity: 150, categories: [{ name: 'Apparel' }], attributes: [{ name: 'Color', options: ['White'] }, { name: 'Size', options: ['S', 'M', 'L', 'XL'] }], images: [], status: 'publish' },
  { id: 2, name: 'Leather Wallet', sku: 'LW-002', description: 'Full-grain leather bifold wallet', regular_price: '79.99', sale_price: '59.99', stock_status: 'instock', stock_quantity: 45, categories: [{ name: 'Accessories' }], attributes: [{ name: 'Material', options: ['Leather'] }, { name: 'Color', options: ['Brown', 'Black'] }], images: [], status: 'publish' },
  { id: 3, name: 'Running Shoes Pro', sku: 'RSP-003', description: 'Lightweight performance running shoes', regular_price: '129.99', sale_price: '', stock_status: 'instock', stock_quantity: 80, categories: [{ name: 'Footwear' }], attributes: [{ name: 'Size', options: ['7', '8', '9', '10', '11'] }], images: [], status: 'publish' },
  { id: 4, name: 'Yoga Mat Premium', sku: 'YMP-004', description: 'Non-slip eco-friendly yoga mat', regular_price: '49.99', sale_price: '39.99', stock_status: 'instock', stock_quantity: 200, categories: [{ name: 'Sports' }], attributes: [{ name: 'Thickness', options: ['6mm'] }, { name: 'Color', options: ['Purple', 'Blue', 'Green'] }], images: [], status: 'publish' },
  { id: 5, name: 'Wireless Earbuds X1', sku: 'WEX-005', description: 'True wireless earbuds with ANC', regular_price: '199.99', sale_price: '', stock_status: 'outofstock', stock_quantity: 0, categories: [{ name: 'Electronics' }], attributes: [{ name: 'Battery Life', options: ['8 hours'] }], images: [], status: 'publish' },
  { id: 6, name: 'Bamboo Cutting Board', sku: 'BCB-006', description: 'Sustainable bamboo kitchen board', regular_price: '34.99', sale_price: '', stock_status: 'instock', stock_quantity: 120, categories: [{ name: 'Kitchen' }], attributes: [{ name: 'Size', options: ['Small', 'Large'] }], images: [], status: 'publish' },
];

// Map WooCommerce product format to our schema
const mapWooProduct = (woo) => ({
  wooId:       woo.id,
  name:        woo.name,
  sku:         woo.sku || '',
  description: woo.description || '',
  price:       parseFloat(woo.regular_price) || 0,
  salePrice:   parseFloat(woo.sale_price) || null,
  stockStatus: woo.stock_status,
  stockQty:    woo.stock_quantity || 0,
  categories:  (woo.categories || []).map((c) => c.name),
  attributes:  (woo.attributes || []).flatMap((a) =>
    (a.options || []).map((v) => ({ name: a.name, value: v }))
  ),
  images:      (woo.images || []).map((i) => i.src),
  status:      woo.status === 'publish' ? 'published' : 'draft',
  syncedAt:    new Date(),
});

// Map our schema back to WooCommerce format
const mapToWooProduct = (product) => ({
  name:          product.name,
  sku:           product.sku,
  description:   product.description,
  regular_price: String(product.price || 0),
  sale_price:    product.salePrice ? String(product.salePrice) : '',
  stock_status:  product.stockStatus,
  stock_quantity: product.stockQty,
  status:        product.status === 'published' ? 'publish' : 'draft',
  categories:    (product.categories || []).map((name) => ({ name })),
});

class WooCommerceService {
  constructor() {
    this.useMock = process.env.USE_MOCK_WOOCOMMERCE === 'true';
    if (!this.useMock) {
      this.client = axios.create({
        baseURL: `${process.env.WC_BASE_URL}/wp-json/wc/v3`,
        auth: {
          username: process.env.WC_CONSUMER_KEY,
          password: process.env.WC_CONSUMER_SECRET,
        },
        timeout: 10000,
      });
    }
  }

  async fetchProducts() {
    if (this.useMock) {
      logger.info('WooCommerce: using mock data');
      return MOCK_PRODUCTS.map(mapWooProduct);
    }
    const { data } = await this.client.get('/products', { params: { per_page: 100 } });
    return data.map(mapWooProduct);
  }

  async pushProduct(product) {
    if (this.useMock) {
      logger.info(`WooCommerce mock: push product ${product._id}`);
      return { success: true, wooId: product.wooId || Math.floor(Math.random() * 9000 + 1000) };
    }
    const payload = mapToWooProduct(product);
    if (product.wooId) {
      const { data } = await this.client.put(`/products/${product.wooId}`, payload);
      return { success: true, wooId: data.id };
    }
    const { data } = await this.client.post('/products', payload);
    return { success: true, wooId: data.id };
  }
}

module.exports = new WooCommerceService();
