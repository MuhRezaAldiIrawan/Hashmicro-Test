/**
 * DashboardController
 * Shows the main dashboard with inventory summary
 */

const ProductModel = require('../models/ProductModel');
const UserModel = require('../models/UserModel');
const StringAnalyzerModel = require('../models/StringAnalyzerModel');

class DashboardController {
  async index(req, res) {
    try {
      const [analytics, lowStock, recentHistory, totalUsers] = await Promise.all([
        ProductModel.getInventoryAnalytics(),
        ProductModel.getLowStockProducts(),
        StringAnalyzerModel.getHistory(5),
        UserModel.count(),
      ]);

      res.render('dashboard/index', {
        title: 'Dashboard',
        analytics,
        lowStock: lowStock.slice(0, 5),
        recentHistory,
        totalUsers,
      });
    } catch (err) {
      console.error('[DashboardController.index]', err);
      res.render('error', { title: 'Error', message: err.message });
    }
  }
}

module.exports = new DashboardController();
