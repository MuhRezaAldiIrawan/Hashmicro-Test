const UserModel = require('../models/UserModel');

class AuthController {

  showLogin(req, res) {
    res.render('auth/login', { title: 'Login' });
  }


  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        req.flash('error', 'Username and password are required.');
        return res.redirect('/auth/login');
      }

      const user = await UserModel.authenticate(username, password);

      if (!user) {
        req.flash('error', 'Invalid username or password.');
        return res.redirect('/auth/login');
      }

      req.session.user = user;
      req.flash('success', `Welcome back, ${user.name}!`);
      res.redirect('/dashboard');
    } catch (err) {
      console.error('[AuthController.login]', err);
      req.flash('error', 'An error occurred. Please try again.');
      res.redirect('/auth/login');
    }
  }


  showRegister(req, res) {
    res.render('auth/register', { title: 'Register' });
  }


  async register(req, res) {
    try {
      const { username, password, name, email } = req.body;

      if (!username || !password || !name) {
        req.flash('error', 'Name, username, and password are required.');
        return res.redirect('/auth/register');
      }

      if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters.');
        return res.redirect('/auth/register');
      }

      const exists = await UserModel.usernameExists(username);
      if (exists) {
        req.flash('error', 'Username already taken.');
        return res.redirect('/auth/register');
      }

      await UserModel.create({ username, password, name, email, role: 'user' });
      req.flash('success', 'Account created! Please login.');
      res.redirect('/auth/login');
    } catch (err) {
      console.error('[AuthController.register]', err);
      req.flash('error', 'Registration failed. Please try again.');
      res.redirect('/auth/register');
    }
  }


  logout(req, res) {
    req.session = null;
    res.redirect('/auth/login');
  }
}

module.exports = new AuthController();
