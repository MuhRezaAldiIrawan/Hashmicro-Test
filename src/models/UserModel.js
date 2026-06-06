const bcrypt = require('bcryptjs');
const BaseModel = require('./BaseModel');
const db = require('../../config/database');

const ROLES = { ADMIN: 'admin', USER: 'user' };
const SALT_ROUNDS = 10;

class UserModel extends BaseModel {
  constructor() {
    super(db.users, 'User');
    this.ROLES = ROLES;
  }


  async beforeCreate(data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    if (!data.role) data.role = ROLES.USER;
    return data;
  }

  async beforeUpdate(data) {
    if (data.password && !data.password.startsWith('$2')) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    return data;
  }


  async findByUsername(username) {
    return await this.findOne({ username });
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async authenticate(username, password) {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) return null;

    // Jangan return password ke client
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  }

  async findAllSafe() {
    const users = await this.findAll();
    return users.map(({ password: _pw, ...u }) => u);
  }

  async usernameExists(username) {
    const user = await this.findByUsername(username);
    return !!user;
  }

  async seedAdmin() {
    const count = await this.count();
    if (count === 0) {
      await this.create({
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        email: 'admin@hashmicro.com',
        role: ROLES.ADMIN,
      });
      console.log('[UserModel] Default admin seeded: admin / admin123');
    }
  }
}

module.exports = new UserModel();
