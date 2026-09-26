const crypto = require('crypto');

// UNIT: Password encryption (salted SHA-256 via PBKDF2)
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

// UNIT: Password verification
function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt] = stored.split(':');
  try {
    return hashPassword(password, salt) === stored;
  } catch {
    return false;
  }
}

// UNIT: Session token generator
function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

module.exports = { hashPassword, verifyPassword, generateToken };
