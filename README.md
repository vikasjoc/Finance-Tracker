# 💰 Personal Finance Tracker

A modern, full-stack **Personal Finance Tracker** built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Features AI-powered budget planning, financial insights, a beautiful responsive UI with dark/light mode, and an admin panel.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Frontend Routes](#-frontend-routes)
- [Bug Fixes & Error Handling](#-bug-fixes--error-handling)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication
- User registration & login with JWT (JSON Web Tokens)
- Forgot password & reset password via email
- Remember me functionality
- Role-based access (user / admin)
- Protected routes with redirect

### 📊 Dashboard
- Current balance overview (income - expenses)
- Monthly income vs expenses summary
- Interactive charts: Income vs Expense bar chart, Monthly spending trends, Category breakdown (pie chart)
- Recent transactions list
- AI-powered financial insights and suggestions
- Quick action buttons

### 💳 Transactions
- Full CRUD operations for income & expenses
- Search transactions by description or notes
- Sort by date, amount, category, or type
- Filter by date range, category, and transaction type
- Pagination with configurable page size
- CSV export functionality
- Category & payment method management

### 📋 Budget Management
- Set monthly budgets per category
- Visual progress bars showing spending vs budget
- Color-coded status indicators (On Track, Almost Full, Over Budget)
- Summary cards: Total Budget, Total Spent, Budget Left
- Create, edit, and delete budgets
- Prevents duplicate budgets for the same category/month/year

### 🤖 AI Budget Planner (Finance AI)
- **Natural language processing** for budget creation
- Three modes:
  - 🟢 **Conservative** — Prioritizes savings
  - 🟡 **Balanced** — Equal split between needs, wants, and savings
  - 🔴 **Aggressive Saving** — Maximizes savings, minimizes expenses
- Automatic extraction of income, expenses, bills, and savings goals from user input
- Detailed budget breakdown with category-wise allocations and explanations
- **AI Financial Assistant** — Chat interface for financial advice
- Personalized financial insights based on transaction history

### 📈 Reports
- Visual charts and graphs (bar, line, pie)
- Date range filtering for custom reports
- Category-wise breakdown
- Income vs expense comparison
- CSV download for offline analysis

### 👤 User Profile
- Profile management (name, email, avatar)
- Dark/Light theme toggle with persistence
- Currency preferences
- Change password functionality

### 👑 Admin Panel
- User management dashboard
- Platform analytics (total users, transactions, etc.)
- Block/unblock users
- View all users with details
- Transaction reports overview

### 🎨 UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark mode / Light mode with smooth transitions
- Animated page transitions (Framer Motion)
- Skeleton loading states
- Toast notifications for all actions
- Form validation with React Hook Form

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM (Object Data Modeling) |
| **JWT (jsonwebtoken)** | Authentication & authorization |
| **bcryptjs** | Password hashing |
| **express-validator** | Input validation & sanitization |
| **helmet** | Security headers |
| **cors** | Cross-Origin Resource Sharing |
| **express-rate-limit** | API rate limiting |
| **multer** | File upload handling |
| **cloudinary** | Cloud image storage |
| **winston** | Logging |
| **nodemailer** | Email service (password reset, etc.) |
| **morgan** | HTTP request logging |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Redux Toolkit** | State management |
| **React Redux** | React-Redux bindings |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animations & transitions |
| **Chart.js + react-chartjs-2** | Charts & graphs |
| **Recharts** | Composable chart library |
| **React Hook Form** | Form state management & validation |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Icon library (Heroicons) |
| **Axios** | HTTP client |
| **react-csv** | CSV export |
| **react-datepicker** | Date picker component |

---

## 📁 Project Structure

```
finance-tracker/
│
├── server/                          # Backend (Express.js + MongoDB)
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── cloudinary.js            # Cloudinary configuration
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── transactionController.js # Transaction CRUD
│   │   ├── budgetController.js      # Budget management
│   │   ├── categoryController.js    # Category management
│   │   ├── notificationController.js# Notifications
│   │   ├── aiController.js          # AI-powered features
│   │   └── adminController.js       # Admin operations
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── error.js                 # Error handling
│   │   ├── validation.js            # Request validation
│   │   └── rateLimiter.js           # Rate limiting
│   │
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Transaction.js           # Transaction schema
│   │   ├── Budget.js                # Budget schema
│   │   ├── Category.js              # Category schema
│   │   ├── Notification.js          # Notification schema
│   │   └── AIConversation.js        # AI chat history schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── aiRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── utils/
│   │   ├── aiEngine.js              # AI processing engine
│   │   ├── email.js                 # Email helper
│   │   ├── errorResponse.js         # Custom error class
│   │   ├── logger.js                # Winston logger
│   │   └── seedCategories.js        # Default category seeds
│   │
│   ├── data/db/                     # Local MongoDB data (gitignored)
│   ├── logs/                        # Application logs (gitignored)
│   │
│   ├── server.js                    # Entry point
│   ├── seed.js                      # Database seeder
│   ├── package.json
│   └── .env                         # Environment variables (gitignored)
│
├── client/                          # Frontend (React + Vite)
│   ├── public/
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AuthLayout.jsx   # Auth pages layout
│   │   │   │   ├── MainLayout.jsx   # Main app layout (sidebar + navbar)
│   │   │   │   ├── Navbar.jsx       # Top navigation bar
│   │   │   │   └── Sidebar.jsx      # Side navigation menu
│   │   │   └── ErrorBoundary.jsx    # Error boundary (catches crashes)
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Budgets.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── AIBudgets.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       └── AdminUsers.jsx
│   │   │
│   │   ├── redux/
│   │   │   ├── store.js             # Redux store configuration
│   │   │   └── slices/
│   │   │       ├── authSlice.js     # Authentication state
│   │   │       ├── transactionSlice.js
│   │   │       ├── budgetSlice.js
│   │   │       ├── categorySlice.js
│   │   │       ├── notificationSlice.js
│   │   │       ├── aiSlice.js
│   │   │       └── uiSlice.js       # Theme, sidebar state
│   │   │
│   │   ├── utils/
│   │   │   └── axios.js             # Axios instance with interceptors
│   │   │
│   │   ├── App.jsx                  # Main app with routing
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles + Tailwind
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── README.md                        # This file
├── .gitignore
└── package.json                     # Root package (if any)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud database)
- **npm** or **yarn** package manager
- **Git** (for version control)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd finance-tracker
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/finance-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Cloudinary (optional - for avatar uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME='Finance Tracker'

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# AI Configuration
AI_API_ENDPOINT=https://api.example.com/ai
AI_API_KEY=your-ai-api-key
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

### 4. Seed the Database (Optional)

This creates default categories and a demo user.

```bash
cd ../server
npm run seed
```

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@financetracker.com` | `admin123` |
| User | `demo@financetracker.com` | `demo123` |

### 5. Run the Application

**Start MongoDB** (if running locally):
```bash
mongod
```

**Start the Backend Server:**
```bash
cd server
npm run dev          # with nodemon (auto-restart on changes)
# or
npm start            # production mode
```

**Start the Frontend** (in a new terminal):
```bash
cd client
npm run dev
```

### 6. Open the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/updatedetails` | Update name/email | Yes |
| PUT | `/updatepassword` | Update password | Yes |
| POST | `/forgot-password` | Send password reset email | No |
| POST | `/reset-password/:token` | Reset password with token | No |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all transactions (paginated, filterable) | Yes |
| POST | `/` | Create a transaction | Yes |
| GET | `/stats` | Get transaction statistics | Yes |
| GET | `/export/csv` | Export transactions as CSV | Yes |
| GET | `/:id` | Get single transaction | Yes |
| PUT | `/:id` | Update transaction | Yes |
| DELETE | `/:id` | Delete transaction | Yes |

### Budgets (`/api/budgets`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get budgets (filter by month/year) | Yes |
| POST | `/` | Create a budget | Yes |
| GET | `/summary` | Get budget summary (current month) | Yes |
| POST | `/monthly` | Set monthly overall budget | Yes |
| PUT | `/:id` | Update budget | Yes |
| DELETE | `/:id` | Delete budget | Yes |

### Categories (`/api/categories`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all categories | Yes |
| POST | `/` | Create a category | Yes |
| PUT | `/:id` | Update category | Yes |
| DELETE | `/:id` | Delete category | Yes |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all notifications | Yes |
| PUT | `/:id/read` | Mark notification as read | Yes |
| PUT | `/read-all` | Mark all as read | Yes |

### AI (`/api/ai`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/plan` | Generate AI budget plan | Yes |
| POST | `/chat` | Chat with AI assistant | Yes |
| GET | `/insights` | Get financial insights | Yes |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Get all users | Admin |
| PUT | `/users/:id/block` | Block/unblock user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/stats` | Get platform statistics | Admin |

---

## 🗺️ Frontend Routes

| Path | Component | Description | Access |
|------|-----------|-------------|--------|
| `/login` | Login | Login page | Public |
| `/register` | Register | Registration page | Public |
| `/forgot-password` | ForgotPassword | Password reset request | Public |
| `/reset-password/:token` | ResetPassword | Reset password with token | Public |
| `/dashboard` | Dashboard | Main dashboard with charts | Auth |
| `/transactions` | Transactions | Transaction management | Auth |
| `/budgets` | Budgets | Budget planning & tracking | Auth |
| `/categories` | Categories | Category management | Auth |
| `/reports` | Reports | Financial reports & charts | Auth |
| `/ai` | AIBudgets | AI budget planner & assistant | Auth |
| `/profile` | Profile | User profile & settings | Auth |
| `/notifications` | Notifications | Notification center | Auth |
| `/admin` | AdminDashboard | Admin analytics | Admin |
| `/admin/users` | AdminUsers | User management | Admin |

---

## 🐛 Bug Fixes & Error Handling

### Error Boundary

The application includes a **React Error Boundary** component (`client/src/components/ErrorBoundary.jsx`) that catches JavaScript errors anywhere in the component tree and displays a fallback UI instead of crashing the entire app.

**Features:**
- Catches rendering errors gracefully
- Displays a user-friendly error message
- **"Try Again"** button to re-render the failed component
- **"Go to Dashboard"** button to navigate to safety
- Logs errors to console for debugging

### Fixed: Budgets Component Crash

The `<Budgets>` page had a crash issue where accessing properties on potentially `null` or `undefined` values would throw a TypeError. The following fixes were applied:

1. **Redux Slice (`budgetSlice.js`)** — Added missing Redux reducer handlers:
   - `getBudgetSummary.pending` — sets `loading: true` so the UI shows skeleton loaders
   - `getBudgetSummary.rejected` — sets `loading: false` and captures the error message

2. **Defensive Null Checks (`Budgets.jsx`)**:
   - `(categories ?? []).filter(...)` — Prevents crash if `categories` is `undefined`
   - `(budgets ?? []).map(...)` — Prevents crash if `budgets` is `undefined`
   - Local variables with `?? 0` fallback for `spentAmount` and `plannedAmount`
   - Safe `toLocaleString('en-IN')` calls on guaranteed numbers

3. **Error Boundary Integration (`App.jsx`)**:
   - Wrapped the `<Budgets>` route with `<ErrorBoundary>` for isolated error recovery

### Defensive Patterns Used Throughout

| Pattern | Location | Purpose |
|---------|----------|---------|
| `?? []` | Array operations | Prevents `.map()`, `.filter()` on `null`/`undefined` |
| `?? 0` | Numeric operations | Prevents NaN from `undefined + number` |
| `?? ''` | String operations | Prevents rendering "undefined" text |
| `?.` | Deep property access | Safely access nested object properties |
| `ErrorBoundary` | Route components | Catches and displays rendering errors |

---

## 🚢 Deployment

### Backend (Render / Railway / Fly.io)

1. Push the code to a GitHub repository
2. Create a new **Web Service** on your chosen platform
3. Connect your GitHub repository
4. Set the **Root Directory** to `server`
5. Set the **Build Command** to `npm install`
6. Set the **Start Command** to `npm start`
7. Add all environment variables from your `.env` file
8. Use **MongoDB Atlas** for the database (set `MONGO_URI` to your Atlas connection string)

### Frontend (Vercel / Netlify)

1. Push the code to GitHub
2. Import the project to Vercel/Netlify
3. Set the **Root Directory** to `client`
4. Set the **Build Command** to `npm run build`
5. Set the **Output Directory** to `dist`
6. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

*Note: Test suites are not yet implemented. Contributions welcome!*

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

**Guidelines:**
- Follow existing code style and conventions
- Write clear commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📄 License

This project is **MIT Licensed** — feel free to use it for personal or commercial purposes.

---

## 🙏 Acknowledgments

- **Icons** by [React Icons](https://react-icons.github.io/react-icons/) (Heroicons)
- **Charts** by [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/)
- **Animations** by [Framer Motion](https://www.framer.com/motion/)
- **UI Framework** by [Tailwind CSS](https://tailwindcss.com/)
- **Built with ❤️** using the MERN Stack

---

## 📧 Contact

For questions, suggestions, or bug reports, please open an issue on the GitHub repository.

---

<p align="center">Made with ❤️ using React, Express, MongoDB & Node.js</p>

