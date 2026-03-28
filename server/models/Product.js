const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  wooId:       { type: Number, sparse: true },
  name:        { type: String, required: true, trim: true, maxlength: 200 },
  sku:         { type: String, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 5000 },
  price:       { type: Number, min: 0 },
  salePrice:   { type: Number, min: 0 },
  stockStatus: { type: String, enum: ['instock', 'outofstock', 'onbackorder'], default: 'instock' },
  stockQty:    { type: Number, min: 0, default: 0 },
  categories:  [{ type: String, trim: true }],
  attributes:  [attributeSchema],
  images:      [{ type: String, trim: true }],
  status:      { type: String, enum: ['draft', 'published', 'pending'], default: 'draft' },
  syncedAt:    { type: Date },
}, { timestamps: true });

productSchema.index({ name: 'text', sku: 'text' });
productSchema.index({ status: 1 });
productSchema.index({ wooId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Product', productSchema);
