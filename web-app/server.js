const app = require('./src/app');
const { seed } = require('./src/db');

const PORT = process.env.PORT || 3000;
seed();
app.listen(PORT, () => console.log(`ShopEase running at http://localhost:${PORT}`));
