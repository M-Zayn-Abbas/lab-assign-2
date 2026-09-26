// UNIT: Email format checker
function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email.trim());
}

// UNIT: Password strength checker
// Rules: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
function validatePassword(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length === 0) {
    return { valid: false, errors: ['Password is required'] };
  }
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a digit');
  return { valid: errors.length === 0, errors };
}

// UNIT: Login validation function
function validateLoginForm({ email, password } = {}) {
  const errors = [];
  if (!email) errors.push('Email is required');
  else if (!validateEmail(email)) errors.push('Invalid email format');
  if (!password) errors.push('Password is required');
  return { valid: errors.length === 0, errors };
}

// UNIT: Registration form validation
function validateRegisterForm({ name, email, password } = {}) {
  const errors = [];
  if (!name || String(name).trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!validateEmail(email)) errors.push('Invalid email format');
  const pw = validatePassword(password);
  if (!pw.valid) errors.push(...pw.errors);
  return { valid: errors.length === 0, errors };
}

// UNIT: Product form validation
function validateProductForm({ name, price, stock } = {}) {
  const errors = [];
  if (!name || String(name).trim().length === 0) errors.push('Product name is required');
  const p = Number(price);
  if (price === undefined || price === '' || Number.isNaN(p) || p <= 0) errors.push('Price must be a positive number');
  const s = Number(stock);
  if (stock === undefined || stock === '' || !Number.isInteger(s) || s < 0) errors.push('Stock must be a non-negative integer');
  return { valid: errors.length === 0, errors };
}

// UNIT: Card number validation (Luhn algorithm) + expiry + CVV
function validateCard({ cardNumber, expiry, cvv } = {}) {
  const errors = [];
  const digits = String(cardNumber || '').replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(digits) || !luhnCheck(digits)) errors.push('Invalid card number');
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(expiry || ''))) {
    errors.push('Expiry must be MM/YY');
  } else {
    const [mm, yy] = expiry.split('/').map(Number);
    const now = new Date();
    const expDate = new Date(2000 + yy, mm, 0, 23, 59, 59); // last day of month
    if (expDate < now) errors.push('Card has expired');
  }
  if (!/^\d{3,4}$/.test(String(cvv || ''))) errors.push('CVV must be 3 or 4 digits');
  return { valid: errors.length === 0, errors };
}

function luhnCheck(num) {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num[i], 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

module.exports = {
  validateEmail,
  validatePassword,
  validateLoginForm,
  validateRegisterForm,
  validateProductForm,
  validateCard,
  luhnCheck,
};
