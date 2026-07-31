const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { seedCategories } = require('./utils/seedCategories');
const errorHandler = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize express app
const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware
app.use(helmet());

// Flexible CORS setup
const allowedOrigin = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or matching allowedOrigin
      if (!origin || origin.replace(/\/$/, '') === allowedOrigin || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Allow origin in production to prevent unexpected CORS blocks while connecting client/server
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint (checks MongoDB connection)
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    dbConnected,
    dbStatus: dbConnected ? 'Connected' : 'Disconnected',
    message: dbConnected ? 'Finance Tracker API is running' : 'Database connection unavailable',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Tracker API Running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

// Start server after DB connection is established
// Render assigns process.env.PORT automatically (usually 10000), never hardcode it
const PORT = process.env.PORT || 5001;
let server;

const startServer = async () => {
  try {
    // Configure Cloudinary (if credentials provided)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
      configureCloudinary();
    }

    // Connect to MongoDB
    await connectDB();

    // Seed default categories
    await seedCategories();

    server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║     Personal Finance Tracker API             ║
║     Running on port ${PORT}                    ║
║     Environment: ${process.env.NODE_ENV || 'development'}               ║
║     Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}   ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('⚠️ Server starting with DB error. Listening anyway for diagnostics...');
    server = app.listen(PORT, () => {
      console.log(`API running on port ${PORT} (DB Connection Pending/Failed)`);
    });
  }
};

startServer();

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app;


