require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const routes = require('./routes/index');
const { injectUser } = require('./middleware/auth');
const UserModel = require('./models/UserModel');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// cookie-session: signed cookie, kompatibel dengan Vercel serverless
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET || 'default_secret_key',
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
}));

app.use(flash());
app.use(injectUser);

// Cegah Vercel CDN meng-cache halaman dinamis
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

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

app.use('/', routes);

app.use((req, res) => {
  res.status(404).render('error', { title: '404', message: 'Page not found.' });
});

app.use((err, req, res, next) => {
  console.error('[App Error]', err.stack);
  res.status(500).render('error', { title: 'Error', message: err.message });
});

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
