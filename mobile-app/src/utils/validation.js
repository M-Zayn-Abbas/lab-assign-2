// UNIT: Input validation functions

export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validateLogin(email, password) {
  const errors = {};
  if (!email || !email.trim()) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Invalid email format';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProfile({ name, age, phone } = {}) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  const n = Number(age);
  if (age === undefined || age === '' || !Number.isInteger(n) || n < 1 || n > 120) {
    errors.age = 'Age must be a whole number between 1 and 120';
  }
  // Pakistani mobile format: 03XXXXXXXXX or +923XXXXXXXXX
  if (!phone || !/^(03\d{9}|\+923\d{9})$/.test(phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Phone must be like 03001234567 or +923001234567';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
