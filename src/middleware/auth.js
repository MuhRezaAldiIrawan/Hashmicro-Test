const authMiddleware = {
  requireLogin(req, res, next) {
    if (req.session && req.session.user) {
      res.locals.currentUser = req.session.user;
      return next();
    }
    req.flash('error', 'Please login to access this page.');
    return res.redirect('/auth/login');
  },

  requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.flash('error', 'Access denied. Admin only.');
    return res.redirect('/dashboard');
  },

  redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
      return res.redirect('/dashboard');
    }
    next();
  },

  injectUser(req, res, next) {
    res.locals.currentUser = req.session ? req.session.user : null;
    res.locals.flashSuccess = req.flash('success');
    res.locals.flashError = req.flash('error');
    next();
  },
};

module.exports = authMiddleware;
