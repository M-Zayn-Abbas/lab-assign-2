# Lab 2: Unit, Component & Integration Testing projects

| Project | Tech | Run | Test |
|---|---|---|---|
| `web-app/` (ShopEase) | Node + Express + HTML/JS | `npm start` → http://localhost:3000 | `npm test` (Jest + Supertest) |
| `mobile-app/` (PostHub) | Expo / React Native | `npx expo start` (scan the QR with Expo Go) | `npm test` (jest-expo + RN Testing Library) |
| `dsa-project/` (DSA Toolkit) | Python 3 | `python main.py` | `python -m unittest discover -s tests -t . -v` |

Each project has a sample test file showing one test at each level. Add your own tests next to it.

---

## 1. Web App: ShopEase (`web-app/`)
Demo card: `4242 4242 4242 4242`, expiry `12/30`, CVV `123`. Declined card: `4000 0000 0000 0002`.

**Units (5+)**
| Unit | File |
|---|---|
| `validateEmail` (email format checker) | `src/utils/validators.js` |
| `validatePassword`, `validateLoginForm`, `validateRegisterForm` | `src/utils/validators.js` |
| `validateProductForm`, `validateCard` / `luhnCheck` | `src/utils/validators.js` |
| `hashPassword` / `verifyPassword` (password encryption) | `src/utils/crypto.js` |
| `apiRequest` (API request handler), `formatPrice` | `public/api.js` |
| `calculateTotal` (10% off above Rs 10,000) | `src/modules/orders.js` |

**Components (3+)**
- Authentication module: `src/modules/auth.js` (register, login, logout, token check, DB lookup)
- Product module: `src/modules/products.js` (add, list/search, get, delete, reduce stock)
- Payment module: `src/modules/payment.js` (card validation, mock gateway, declined cards)
- Order module: `src/modules/orders.js` (cart, payment, stock update)

**Integration points**
- Frontend (`public/main.js` + `api.js`) ↔ Backend API (`src/app.js`)
- Backend ↔ Database (`src/db.js`, in memory; `reset()` / `seed()` for tests)
- Payment gateway ↔ Order module (a declined payment must NOT reduce stock)

## 2. Mobile App: PostHub (`mobile-app/`)
Demo logins: `ali@test.com / ali123`, `sara@test.com / sara123`. Data comes from the public API `jsonplaceholder.typicode.com`.

**Units (5+)**
| Unit | File |
|---|---|
| Input validation: `validateEmail`, `validateLogin`, `validateProfile` | `src/utils/validation.js` |
| Button click handlers: `toggleLike`, `stepCounter` | `src/utils/handlers.js` |
| Data parsing: `parsePost`, `parsePosts`, `parseUser` | `src/utils/parser.js` |
| Local storage: `saveProfile`, `loadProfile`, `clearProfile`, session | `src/services/storage.js` |
| API response handler: `handleApiResponse` | `src/services/api.js` |

**Components**
- User profile module: `ProfileScreen` + `validateProfile` + storage
- API communication module: `src/services/api.js` (`fetchPosts`, `fetchUser`; takes a `fetchImpl` so you can mock it)
- Notification module: `src/services/notifications.js` + `NotificationsScreen`
- Login module: `src/services/auth.js` + `LoginScreen`

**Integration points**
- App UI (`DashboardScreen`) ↔ API server (jsonplaceholder)
- Login module ↔ Dashboard (`App.js`: logging in shows the dashboard and saves the session)
- Notification service ↔ User data (notifications change with the profile and posts, e.g. age under 18, profile missing)

## 3. DSA Project: DSA Toolkit (`dsa-project/`)

**Units (5+)**
| Unit | File |
|---|---|
| Linked list `insert_at_head/tail/at`, `delete`, `search`, `reverse` | `dsa/linked_list.py` |
| BST `insert`, `delete`, `search`, traversals, `height` | `dsa/bst.py` |
| `Stack` push/pop/peek, `Queue` enqueue/dequeue, `is_balanced` | `dsa/stack_queue.py` |
| `bubble/insertion/merge/quick_sort`, `linear/binary_search` | `dsa/sorting.py` |
| Graph `add_edge`, `bfs`, `dfs`, `dijkstra` | `dsa/graph.py` |

**Components:** complete linked list module, tree operations module, graph processing module, stack/queue module.

**Integration points** (Input → Processing → Visualization)
- Data input module (`input_module.py`: `parse_numbers`, `parse_edges`) ↔ Processing module (`processing.py`)
- Algorithm module ↔ Output visualization (`visualizer.py`: `render_tree`, `render_linked_list`, `render_graph`, `render_bars`, `render_path`)
- Full pipeline through the CLI: `main.py`

Suggested strategy: **bottom-up** (units → processing → visualizer → `main.py`) or **incremental** (add one module at a time).
