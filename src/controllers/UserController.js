const UserModel = require('../models/UserModel');

class UserController {
  async index(req, res) {
    try {
      const users = await UserModel.findAllSafe();
      res.render('users/index', { title: 'User Management', users });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/dashboard');
    }
  }

  showCreate(req, res) {
    res.render('users/form', {
      title: 'Add User',
      user: {},
      roles: Object.values(UserModel.ROLES),
      action: '/users',
      method: 'POST',
    });
  }

  async create(req, res) {
    try {
      const { username, password, name, email, role } = req.body;
      if (!username || !password || !name) {
        req.flash('error', 'Name, username, and password are required.');
        return res.redirect('/users/new');
      }
      if (await UserModel.usernameExists(username)) {
        req.flash('error', 'Username already exists.');
        return res.redirect('/users/new');
      }
      await UserModel.create({ username, password, name, email, role });
      req.flash('success', `User "${username}" created.`);
      res.redirect('/users');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/users/new');
    }
  }

  async showEdit(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) { req.flash('error', 'User not found.'); return res.redirect('/users'); }
      const { password: _pw, ...safeUser } = user;
      res.render('users/form', {
        title: 'Edit User',
        user: safeUser,
        roles: Object.values(UserModel.ROLES),
        action: `/users/${user._id}?_method=PUT`,
        method: 'POST',
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/users');
    }
  }

  async update(req, res) {
    try {
      const { name, email, role, password } = req.body;
      const updateData = { name, email, role };
      if (password && password.trim()) updateData.password = password;
      await UserModel.update(req.params.id, updateData);
      req.flash('success', 'User updated.');
      res.redirect('/users');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/users/${req.params.id}/edit`);
    }
  }

  async destroy(req, res) {
    try {
      // Prevent deleting yourself
      if (req.params.id === req.session.user._id) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/users');
      }
      await UserModel.delete(req.params.id);
      req.flash('success', 'User deleted.');
      res.redirect('/users');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/users');
    }
  }
}

module.exports = new UserController();
