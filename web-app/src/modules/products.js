// COMPONENT: Product Module (Add / View / Delete / Stock)
const { db, nextId } = require('../db');
const { validateProductForm } = require('../utils/validators');

function addProduct({ name, price, stock }) {
  const v = validateProductForm({ name, price, stock });
  if (!v.valid) return { ok: false, status: 400, errors: v.errors };
  const product = { id: nextId('product'), name: String(name).trim(), price: Number(price), stock: Number(stock) };
  db.products.push(product);
  return { ok: true, status: 201, product };
}

function listProducts(search = '') {
  const q = String(search).toLowerCase();
  return db.products.filter((p) => p.name.toLowerCase().includes(q));
}

function getProduct(id) {
  return db.products.find((p) => p.id === Number(id)) || null;
}

function deleteProduct(id) {
  const idx = db.products.findIndex((p) => p.id === Number(id));
  if (idx === -1) return { ok: false, status: 404, errors: ['Product not found'] };
  const [removed] = db.products.splice(idx, 1);
  return { ok: true, status: 200, product: removed };
}

function reduceStock(id, qty) {
  const p = getProduct(id);
  if (!p) throw new Error('Product not found');
  if (qty > p.stock) throw new Error(`Insufficient stock for ${p.name}`);
  p.stock -= qty;
  return p;
}

module.exports = { addProduct, listProducts, getProduct, deleteProduct, reduceStock };
