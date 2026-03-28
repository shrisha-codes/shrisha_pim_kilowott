const Product = require('../models/Product');
const logger = require('../utils/logger');

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, category } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (status) query.status = status;
    if (category) query.categories = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    logger.info(`Product created: ${product._id}`);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, syncedAt: null }, // mark as unsynced on edit
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    logger.info(`Product updated: ${product._id}`);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    logger.info(`Product deleted: ${req.params.id}`);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
