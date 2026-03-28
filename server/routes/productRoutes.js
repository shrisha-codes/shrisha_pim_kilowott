const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const validate = require('../middleware/validate');

const productValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('salePrice').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stockStatus').optional().isIn(['instock', 'outofstock', 'onbackorder']),
  body('stockQty').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['draft', 'published', 'pending']),
];

router.get('/',    getProducts);
router.get('/:id', param('id').isMongoId(), validate, getProduct);
router.post('/',   productValidation, validate, createProduct);
router.put('/:id', param('id').isMongoId(), productValidation, validate, updateProduct);
router.delete('/:id', param('id').isMongoId(), validate, deleteProduct);

module.exports = router;
