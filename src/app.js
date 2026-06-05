/**
 * HashMicro Technical Test - Node.js MVC Application
 * Entry Point: app.js
 *
 * Architecture:
 *   - MVC pattern (Models / Views / Controllers)
 *   - OOP with class inheritance (BaseModel → UserModel, ProductModel, StringAnalyzerModel)
 *   - EJS templating engine
 *   - NeDB embedded database (no external DB needed)
 *   - Session-based authentication
 */

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const routes = require('./routes/index');
const { injectUser } = require('./middleware/auth');
const UserModel = require('./models/UserModel');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── View Engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Method Override (supports PUT/DELETE from HTML forms) ────────────────────
app.use(methodOverride('_method'));

// ─── Session ──────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'hashmicro-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
}));

// ─── Flash Messages ───────────────────────────────────────────────────────────
app.use(flash());

// ─── Global Locals (inject currentUser + flash into all views) ────────────────
app.use(injectUser);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/', routes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', { title: '404', message: 'Page not found.' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[App Error]', err.stack);
  res.status(500).render('error', { title: 'Error', message: err.message });
});

// ─── Startup ──────────────────────────────────────────────────────────────────
async function start() {
  // Seed default admin account if no users exist
  await UserModel.seedAdmin();

  app.listen(PORT, () => {
    console.log('');
    console.log('  ⬡  HashMicro IMS — Technical Test');
    console.log(`  🚀 Running at: http://localhost:${PORT}`);
    console.log(`  👤 Default login: admin / admin123`);
    console.log('');
  });
}

start().catch(console.error);

module.exports = app;
