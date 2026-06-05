/**
 * Authentication Middleware
 * Protects routes that require login
 */

const authMiddleware = {
  /**
   * requireLogin - redirect to login if not authenticated
   */
  requireLogin(req, res, next) {
    if (req.session && req.session.user) {
      res.locals.currentUser = req.session.user;
      return next();
    }
    req.flash('error', 'Please login to access this page.');
    return res.redirect('/auth/login');
  },

  /**
   * requireAdmin - only admin role can access
   */
  requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.flash('error', 'Access denied. Admin only.');
    return res.redirect('/dashboard');
  },

  /**
   * redirectIfLoggedIn - redirect to dashboard if already logged in
   * (used on login/register pages)
   */
  redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
      return res.redirect('/dashboard');
    }
    next();
  },

  /**
   * injectUser - makes currentUser available in all views
   * (call this globally before routes)
   */
  injectUser(req, res, next) {
    res.locals.currentUser = req.session ? req.session.user : null;
    res.locals.flashSuccess = req.flash('success');
    res.locals.flashError = req.flash('error');
    next();
  },
};

module.exports = authMiddleware;
