const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const DashboardController = require('../controllers/DashboardController');
const ProductController = require('../controllers/ProductController');
const StringAnalyzerController = require('../controllers/StringAnalyzerController');
const UserController = require('../controllers/UserController');
const { requireLogin, requireAdmin, redirectIfLoggedIn } = require('../middleware/auth');

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/auth/login', redirectIfLoggedIn, AuthController.showLogin);
router.post('/auth/login', redirectIfLoggedIn, AuthController.login.bind(AuthController));
router.get('/auth/register', redirectIfLoggedIn, AuthController.showRegister);
router.post('/auth/register', redirectIfLoggedIn, AuthController.register.bind(AuthController));
router.post('/auth/logout', requireLogin, AuthController.logout);

router.get('/dashboard', requireLogin, DashboardController.index.bind(DashboardController));

router.get('/products', requireLogin, ProductController.index.bind(ProductController));
router.get('/products/new', requireLogin, requireAdmin, ProductController.showCreate);
router.post('/products', requireLogin, requireAdmin, ProductController.create.bind(ProductController));
router.get('/products/:id', requireLogin, ProductController.show.bind(ProductController));
router.get('/products/:id/edit', requireLogin, requireAdmin, ProductController.showEdit.bind(ProductController));
router.put('/products/:id', requireLogin, requireAdmin, ProductController.update.bind(ProductController));
router.delete('/products/:id', requireLogin, requireAdmin, ProductController.destroy.bind(ProductController));

router.get('/analyzer', requireLogin, StringAnalyzerController.index.bind(StringAnalyzerController));
router.post('/analyzer', requireLogin, StringAnalyzerController.analyze.bind(StringAnalyzerController));

router.get('/users', requireLogin, requireAdmin, UserController.index.bind(UserController));
router.get('/users/new', requireLogin, requireAdmin, UserController.showCreate);
router.post('/users', requireLogin, requireAdmin, UserController.create.bind(UserController));
router.get('/users/:id/edit', requireLogin, requireAdmin, UserController.showEdit.bind(UserController));
router.put('/users/:id', requireLogin, requireAdmin, UserController.update.bind(UserController));
router.delete('/users/:id', requireLogin, requireAdmin, UserController.destroy.bind(UserController));

module.exports = router;
