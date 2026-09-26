const { suite, catchError } = require('../helpers/recorder');
const { seed } = require('../../src/db');
const products = require('../../src/modules/products');

suite(
  {
    level: 'component', id: 'CT-W02', name: 'Product Module', uc: 'UC-W03 Manage Products',
    objective: 'Verify add / view / search / delete / stock operations of the product module',
    pre: 'DB seeded with 3 products (Mouse, Keyboard, Cable) before each test', steps: '1. Prepare state (see Preconditions)  2. Perform the actions listed in Test Data  3. Compare the output with Expected Result', beforeEach: seed,
    meta: {
      component: 'Product Module (src/modules/products.js)',
      units: ['validateProductForm()', 'addProduct()', 'listProducts()', 'getProduct()', 'deleteProduct()', 'reduceStock()'],
    },
  },
  [
    {
      title: 'Add a valid product', data: '{name:"Monitor", price:30000, stock:3}', priority: 'High',
      expected: { ok: true, status: 201, product: { id: 4, name: 'Monitor', price: 30000, stock: 3 } },
      run: () => products.addProduct({ name: 'Monitor', price: 30000, stock: 3 }),
    },
    {
      title: 'Add product with invalid price and stock is rejected', data: '{name:"Bad", price:-5, stock:1.5}',
      expected: { ok: false, status: 400, errors: ['Price must be a positive number', 'Stock must be a non-negative integer'] },
      run: () => products.addProduct({ name: 'Bad', price: -5, stock: 1.5 }),
    },
    {
      title: 'Search products by partial name (case-insensitive)', data: 'search="KEY"',
      expected: ['Mechanical Keyboard'],
      run: () => products.listProducts('KEY').map((p) => p.name),
    },
    {
      title: 'Delete existing product removes it', data: 'deleteProduct(2) then getProduct(2)', priority: 'High',
      expected: { status: 200, deleted: 'Mechanical Keyboard', after: null },
      run: () => { const r = products.deleteProduct(2); return { status: r.status, deleted: r.product.name, after: products.getProduct(2) }; },
    },
    {
      title: 'Delete non-existent product returns 404', data: 'deleteProduct(99)',
      expected: { ok: false, status: 404, errors: ['Product not found'] },
      run: () => products.deleteProduct(99),
    },
    {
      title: 'Reducing stock beyond availability throws', data: 'reduceStock(1, 11) (stock=10)',
      expected: 'throws: Insufficient stock for Wireless Mouse',
      run: catchError(() => products.reduceStock(1, 11)),
    },
    {
      title: 'Product name containing HTML/script is rejected', data: '{name:"<img src=x onerror=alert(1)>", price:10, stock:1}', priority: 'High',
      expectedText: 'status 400 (markup rejected, prevents stored XSS in product table)',
      run: () => products.addProduct({ name: '<img src=x onerror=alert(1)>', price: 10, stock: 1 }),
      actualText: (r) => `status ${r.status}, product stored with name ${JSON.stringify(r.product && r.product.name)}`,
      check: (r) => expect(r.status).toBe(400),
    },
  ]
);
