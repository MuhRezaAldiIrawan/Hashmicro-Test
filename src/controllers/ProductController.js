/**
 * ProductController
 * Full CRUD for Product management
 */

const ProductModel = require('../models/ProductModel');

class ProductController {
  // ── GET /products ────────────────────────────────────────────────────────────
  async index(req, res) {
    try {
      const { category, search } = req.query;
      let products;

      if (search) {
        products = await ProductModel.search(search);
      } else if (category) {
        products = await ProductModel.findByCategory(category);
      } else {
        products = await ProductModel.findAll();
      }

      // Sort by name
      products.sort((a, b) => a.name.localeCompare(b.name));

      res.render('products/index', {
        title: 'Products',
        products,
        categories: ProductModel.CATEGORIES,
        filter: { category, search },
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/dashboard');
    }
  }

  // ── GET /products/new ────────────────────────────────────────────────────────
  showCreate(req, res) {
    res.render('products/form', {
      title: 'Add Product',
      product: {},
      categories: ProductModel.CATEGORIES,
      action: '/products',
      method: 'POST',
    });
  }

  // ── POST /products ───────────────────────────────────────────────────────────
  async create(req, res) {
    try {
      const { name, category, price, stock, minStock, description } = req.body;

      if (!name || !category || price === undefined) {
        req.flash('error', 'Name, category, and price are required.');
        return res.redirect('/products/new');
      }

      await ProductModel.create({ name, category, price, stock, minStock, description });
      req.flash('success', `Product "${name}" created successfully.`);
      res.redirect('/products');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/products/new');
    }
  }

  // ── GET /products/:id ────────────────────────────────────────────────────────
  async show(req, res) {
    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product) {
        req.flash('error', 'Product not found.');
        return res.redirect('/products');
      }
      res.render('products/show', { title: product.name, product });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/products');
    }
  }

  // ── GET /products/:id/edit ───────────────────────────────────────────────────
  async showEdit(req, res) {
    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product) {
        req.flash('error', 'Product not found.');
        return res.redirect('/products');
      }
      res.render('products/form', {
        title: 'Edit Product',
        product,
        categories: ProductModel.CATEGORIES,
        action: `/products/${product._id}?_method=PUT`,
        method: 'POST',
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/products');
    }
  }

  // ── PUT /products/:id ────────────────────────────────────────────────────────
  async update(req, res) {
    try {
      const { name, category, price, stock, minStock, description } = req.body;
      await ProductModel.update(req.params.id, { name, category, price, stock, minStock, description });
      req.flash('success', `Product "${name}" updated.`);
      res.redirect('/products');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/products/${req.params.id}/edit`);
    }
  }

  // ── DELETE /products/:id ─────────────────────────────────────────────────────
  async destroy(req, res) {
    try {
      const product = await ProductModel.findById(req.params.id);
      await ProductModel.delete(req.params.id);
      req.flash('success', `Product "${product?.name || ''}" deleted.`);
      res.redirect('/products');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/products');
    }
  }
}

module.exports = new ProductController();
