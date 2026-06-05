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

require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
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
// Uses cookie-session: session data is stored in a signed cookie on the client.
// This works in Vercel's serverless environment where server-side memory is not
// shared across function instances.
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET || 'hashmicro-secret-key-change-in-production',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  httpOnly: true,
  sameSite: 'lax',
}));

// ─── Flash Messages ───────────────────────────────────────────────────────────
app.use(flash());

// ─── Global Locals (inject currentUser + flash into all views) ────────────────
app.use(injectUser);

// ─── Lazy Init (seed admin once per cold start) ───────────────────────────────
let initPromise = null;
function ensureInit() {
  if (!initPromise) {
    initPromise = UserModel.seedAdmin().catch(console.error);
  }
  return initPromise;
}

app.use((req, res, next) => {
  ensureInit().then(() => next()).catch(next);
});

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
// In development / direct run: start the HTTP server.
// On Vercel (serverless): just export the app — Vercel handles listening.
if (require.main === module) {
  UserModel.seedAdmin().then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('  ⬡  HashMicro IMS — Technical Test');
      console.log(`  🚀 Running at: http://localhost:${PORT}`);
      console.log(`  👤 Default login: admin / admin123`);
      console.log('');
    });
  }).catch(console.error);
}

module.exports = app;
