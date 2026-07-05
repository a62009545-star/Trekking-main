import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import packageRoutes from './routes/packages.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import galleryRoutes from './routes/gallery.js';
import faqRoutes from './routes/faq.js';
import { seedAdmin } from './controllers/adminController.js';
import cookieParser from 'cookie-parser';

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');

const app = express();

const setStaticHeaders = (res, filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.js' || extension === '.mjs' || extension === '.jsx') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (extension === '.css') {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  } else if (extension === '.json') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  } else if (extension === '.svg') {
    res.setHeader('Content-Type', 'image/svg+xml');
  }
};

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/faq', faqRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Trek Booking API is running' });
});

app.get('/', (req, res) => {
  if (fs.existsSync(frontendDistPath)) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }

  return res.json({ message: 'Trek Booking API is running' });
});

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath, {
    index: false,
    setHeaders: (res, filePath) => setStaticHeaders(res, filePath),
  }));
}

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }

  if (fs.existsSync(frontendDistPath)) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }

  return next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trek_booking')
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin(); // creates default admin if none exists
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });