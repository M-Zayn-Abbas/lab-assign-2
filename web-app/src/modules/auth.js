// COMPONENT: Authentication Module (Register + Login + Validation + DB Check)
const { db, nextId } = require('../db');
const { validateLoginForm, validateRegisterForm } = require('../utils/validators');
const { hashPassword, verifyPassword, generateToken } = require('../utils/crypto');

function findUserByEmail(email) {
  return db.users.find((u) => u.email === String(email).trim().toLowerCase());
}

function register({ name, email, password }) {
  const v = validateRegisterForm({ name, email, password });
  if (!v.valid) return { ok: false, status: 400, errors: v.errors };
  if (findUserByEmail(email)) return { ok: false, status: 409, errors: ['Email already registered'] };

  const user = {
    id: nextId('user'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
  };
  db.users.push(user);
  return { ok: true, status: 201, user: publicUser(user) };
}

function login({ email, password }) {
  const v = validateLoginForm({ email, password });
  if (!v.valid) return { ok: false, status: 400, errors: v.errors };

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, status: 401, errors: ['Invalid email or password'] };
  }
  const token = generateToken();
  db.sessions[token] = user.id;
  return { ok: true, status: 200, token, user: publicUser(user) };
}

function logout(token) {
  if (!db.sessions[token]) return false;
  delete db.sessions[token];
  return true;
}

function getUserByToken(token) {
  const id = db.sessions[token];
  if (!id) return null;
  const user = db.users.find((u) => u.id === id);
  return user ? publicUser(user) : null;
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email };
}

module.exports = { register, login, logout, getUserByToken, findUserByEmail };
