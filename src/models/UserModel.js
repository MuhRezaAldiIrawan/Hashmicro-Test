/**
 * UserModel - Extends BaseModel
 *
 * OOP Concept: Inheritance - UserModel inherits all CRUD from BaseModel
 * and adds user-specific logic (password hashing, role validation, etc.)
 */

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

  // ─── Override Hooks ──────────────────────────────────────────────────────────

  /**
   * beforeCreate: Hash password before storing
   */
  async beforeCreate(data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    if (!data.role) data.role = ROLES.USER;
    return data;
  }

  /**
   * beforeUpdate: Hash password if it's being changed
   */
  async beforeUpdate(data) {
    if (data.password && !data.password.startsWith('$2')) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    return data;
  }

  // ─── User-Specific Methods ───────────────────────────────────────────────────

  /**
   * Find user by username
   */
  async findByUsername(username) {
    return await this.findOne({ username });
  }

  /**
   * Verify plain password against stored hash
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Authenticate user (login)
   * Returns user object (without password) or null
   */
  async authenticate(username, password) {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) return null;

    // Return user without password field
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Get all users without their passwords
   */
  async findAllSafe() {
    const users = await this.findAll();
    return users.map(({ password: _pw, ...u }) => u);
  }

  /**
   * Check if a username already exists
   */
  async usernameExists(username) {
    const user = await this.findByUsername(username);
    return !!user;
  }

  /**
   * Seeder - create default admin if no users exist
   */
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

module.exports = new UserModel(); // Singleton pattern
