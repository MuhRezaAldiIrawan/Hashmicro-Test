const ProductModel = require('../models/ProductModel');

class ProductController {

  async index(req, res) {
    try {
      const products = await ProductModel.findAll();
      products.sort((a, b) => a.name.localeCompare(b.name));

      res.render('products/index', {
        title: 'Products',
        products,
        categories: ProductModel.CATEGORIES,
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/dashboard');
    }
  }


  showCreate(req, res) {
    res.render('products/form', {
      title: 'Add Product',
      product: {},
      categories: ProductModel.CATEGORIES,
      action: '/products',
      method: 'POST',
    });
  }


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
