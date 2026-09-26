// Frontend controller: wires the UI to the backend API
const state = { token: null, user: null, cart: [] };
const $ = (id) => document.getElementById(id);

function showMsg(el, res, okText) {
  el.className = 'msg ' + (res.ok ? 'success' : 'error');
  el.textContent = res.ok ? okText : (res.errors || ['Something went wrong']).join('\n');
}

function cartTotal() {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  return subtotal > 10000 ? subtotal * 0.9 : subtotal;
}

function renderAuth() {
  const loggedIn = !!state.token;
  $('userInfo').textContent = loggedIn ? `Hi, ${state.user.name} (${state.user.email})` : 'Not logged in';
  $('authSection').classList.toggle('hidden', loggedIn);
  $('logoutBtn').classList.toggle('hidden', !loggedIn);
  ['addProductSection', 'checkoutSection', 'ordersSection'].forEach((id) => $(id).classList.toggle('hidden', !loggedIn));
}

async function loadProducts() {
  const q = encodeURIComponent($('searchInput').value);
  const res = await apiRequest(`/api/products?search=${q}`);
  $('productTable').innerHTML = (res.products || [])
    .map(
      (p) => `<tr>
        <td>${p.id}</td><td>${p.name}</td><td>${formatPrice(p.price)}</td><td>${p.stock}</td>
        <td><input type="number" min="1" value="1" id="qty-${p.id}" style="width:60px" /></td>
        <td>
          <button onclick="addToCart(${p.id})">Add to cart</button>
          <button class="danger" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>`
    )
    .join('');
}

async function loadOrders() {
  if (!state.token) return;
  const res = await apiRequest('/api/orders', { token: state.token });
  $('ordersTable').innerHTML = (res.orders || [])
    .map((o) => `<tr><td>${o.id}</td><td>${o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</td><td>${formatPrice(o.total)}</td><td>${o.status}</td></tr>`)
    .join('');
}

function renderCart() {
  $('cartTable').innerHTML = state.cart.map((i) => `<tr><td>${i.name}</td><td>x${i.qty}</td><td>${formatPrice(i.price * i.qty)}</td></tr>`).join('') || '<tr><td>Cart is empty</td></tr>';
  $('cartTotal').textContent = formatPrice(cartTotal());
}

window.addToCart = async (id) => {
  if (!state.token) return showMsg($('productMsg'), { ok: false, errors: ['Please login first'] });
  const qty = Number($(`qty-${id}`).value);
  const res = await apiRequest(`/api/products/${id}`);
  if (!res.ok) return showMsg($('productMsg'), res);
  const existing = state.cart.find((i) => i.productId === id);
  if (existing) existing.qty += qty;
  else state.cart.push({ productId: id, name: res.product.name, price: res.product.price, qty });
  renderCart();
  showMsg($('productMsg'), { ok: true }, `${res.product.name} added to cart`);
};

window.deleteProduct = async (id) => {
  const res = await apiRequest(`/api/products/${id}`, { method: 'DELETE', token: state.token });
  showMsg($('productMsg'), res, 'Product deleted');
  loadProducts();
};

$('registerBtn').onclick = async () => {
  const res = await apiRequest('/api/register', {
    method: 'POST',
    body: { name: $('regName').value, email: $('regEmail').value, password: $('regPassword').value },
  });
  showMsg($('regMsg'), res, 'Registration successful! You can now login.');
};

$('loginBtn').onclick = async () => {
  const res = await apiRequest('/api/login', {
    method: 'POST',
    body: { email: $('loginEmail').value, password: $('loginPassword').value },
  });
  showMsg($('loginMsg'), res, 'Login successful');
  if (res.ok) {
    state.token = res.token;
    state.user = res.user;
    renderAuth();
    loadOrders();
  }
};

$('logoutBtn').onclick = async () => {
  await apiRequest('/api/logout', { method: 'POST', token: state.token });
  state.token = null;
  state.user = null;
  state.cart = [];
  renderCart();
  renderAuth();
};

$('addProductBtn').onclick = async () => {
  const res = await apiRequest('/api/products', {
    method: 'POST',
    token: state.token,
    body: { name: $('prodName').value, price: $('prodPrice').value, stock: $('prodStock').value },
  });
  showMsg($('addProductMsg'), res, 'Product added');
  loadProducts();
};

$('clearCartBtn').onclick = () => {
  state.cart = [];
  renderCart();
};

$('payBtn').onclick = async () => {
  const res = await apiRequest('/api/orders', {
    method: 'POST',
    token: state.token,
    body: {
      items: state.cart.map((i) => ({ productId: i.productId, qty: i.qty })),
      card: { cardNumber: $('cardNumber').value, expiry: $('cardExpiry').value, cvv: $('cardCvv').value },
    },
  });
  showMsg($('payMsg'), res, res.ok ? `Order #${res.order.id} placed! Paid ${formatPrice(res.order.total)}` : '');
  if (res.ok) {
    state.cart = [];
    renderCart();
    loadProducts();
    loadOrders();
  }
};

$('searchInput').oninput = loadProducts;

renderAuth();
renderCart();
loadProducts();
