const Product = require('../models/Product');
const wooService = require('../services/woocommerceService');
const logger = require('../utils/logger');

// POST /api/sync/pull — import products from WooCommerce into MongoDB
const pullFromWoo = async (req, res, next) => {
  try {
    const wooProducts = await wooService.fetchProducts();
    const results = { created: 0, updated: 0, failed: 0 };

    for (const p of wooProducts) {
      try {
        await Product.findOneAndUpdate(
          { wooId: p.wooId },
          p,
          { upsert: true, new: true, runValidators: true }
        );
        results.created++;
      } catch (e) {
        logger.error(`Sync pull failed for wooId ${p.wooId}: ${e.message}`);
        results.failed++;
      }
    }

    logger.info(`Sync pull complete: ${JSON.stringify(results)}`);
    res.json({ message: 'Pull sync complete', results });
  } catch (err) {
    next(err);
  }
};

// POST /api/sync/push/:id — push single product to WooCommerce
const pushToWoo = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const result = await wooService.pushProduct(product);
    if (result.wooId && !product.wooId) {
      product.wooId = result.wooId;
    }
    product.syncedAt = new Date();
    await product.save();

    logger.info(`Sync push complete for product ${product._id}`);
    res.json({ message: 'Push sync complete', wooId: result.wooId });
  } catch (err) {
    next(err);
  }
};

// POST /api/sync/push-all — push all unsynced products
const pushAllToWoo = async (req, res, next) => {
  try {
    const unsynced = await Product.find({ syncedAt: null });
    const results = { success: 0, failed: 0 };

    for (const product of unsynced) {
      try {
        const result = await wooService.pushProduct(product);
        product.wooId = product.wooId || result.wooId;
        product.syncedAt = new Date();
        await product.save();
        results.success++;
      } catch (e) {
        logger.error(`Push failed for ${product._id}: ${e.message}`);
        results.failed++;
      }
    }

    res.json({ message: 'Push all complete', results });
  } catch (err) {
    next(err);
  }
};

module.exports = { pullFromWoo, pushToWoo, pushAllToWoo };
