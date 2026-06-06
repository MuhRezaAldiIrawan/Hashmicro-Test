const BaseModel = require('./BaseModel');
const db = require('../../config/database');

const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverage', 'Office Supplies', 'Tools'];

class ProductModel extends BaseModel {
  constructor() {
    super(db.products, 'Product');
    this.CATEGORIES = CATEGORIES;
  }


  async beforeCreate(data) {
    data.price = parseFloat(data.price) || 0;
    data.stock = parseInt(data.stock) || 0;
    data.minStock = parseInt(data.minStock) || 5;
    return data;
  }

  async beforeUpdate(data) {
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.stock !== undefined) data.stock = parseInt(data.stock);
    return data;
  }


  async findByCategory(category) {
    return await this.findAll({ category });
  }

  async getLowStockProducts() {
    const allProducts = await this.findAll();
    const result = [];

    for (const product of allProducts) {
      if (product.stock <= product.minStock) {
        let alertLevel;
        if (product.stock === 0) {
          alertLevel = 'critical';
        } else if (product.stock <= Math.floor(product.minStock / 2)) {
          alertLevel = 'high';
        } else {
          alertLevel = 'low';
        }
        result.push({ ...product, alertLevel });
      }
    }

    return result;
  }

  async getInventoryAnalytics() {
    const allProducts = await this.findAll();

    const categoryMap = {};

    for (const category of CATEGORIES) {
      categoryMap[category] = {
        name: category,
        productCount: 0,
        totalStockValue: 0,
        totalStock: 0,
        avgPrice: 0,
        prices: [],
        lowStockCount: 0,
      };
    }

    for (const product of allProducts) {
      const cat = categoryMap[product.category];
      if (!cat) continue;

      cat.productCount += 1;
      cat.totalStock += product.stock;
      cat.totalStockValue += product.price * product.stock;
      cat.prices.push(product.price);

      if (product.stock === 0) {
        cat.lowStockCount += 1;
      } else if (product.stock <= product.minStock) {
        cat.lowStockCount += 1;
      }
    }

    for (const key of Object.keys(categoryMap)) {
      const cat = categoryMap[key];
      if (cat.prices.length > 0) {
        const sum = cat.prices.reduce((acc, p) => acc + p, 0);
        cat.avgPrice = sum / cat.prices.length;

        const variance = cat.prices.reduce((acc, p) => acc + Math.pow(p - cat.avgPrice, 2), 0) / cat.prices.length;
        cat.priceStdDev = Math.sqrt(variance);

        cat.stockHealthPct = cat.productCount > 0
          ? ((cat.productCount - cat.lowStockCount) / cat.productCount) * 100
          : 100;
      }
      delete cat.prices;
    }

    const totalValue = Object.values(categoryMap).reduce((a, c) => a + c.totalStockValue, 0);
    const totalProducts = allProducts.length;

    return {
      categories: Object.values(categoryMap).filter(c => c.productCount > 0),
      summary: {
        totalProducts,
        totalValue,
        totalStock: allProducts.reduce((a, p) => a + p.stock, 0),
        avgProductPrice: totalProducts > 0
          ? allProducts.reduce((a, p) => a + p.price, 0) / totalProducts
          : 0,
      },
    };
  }

  /**
   * Search products by name (case-insensitive), optionally filtered by category
   */
  async search(keyword, category = null) {
    const all = await this.findAll();
    const lower = keyword.toLowerCase();
    return all.filter(p => {
      const matchesName = p.name.toLowerCase().includes(lower);
      const matchesCategory = !category || p.category === category;
      return matchesName && matchesCategory;
    });
  }
}

module.exports = new ProductModel();
