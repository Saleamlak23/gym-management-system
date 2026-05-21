// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Express Server — Entry Point
//  File: backend/src/index.js
//
//  Startup order:
//    1. Load environment variables
//    2. Initialise Express app
//    3. Register global middleware (CORS, body parser, logger)
//    4. Mount all API route files under /api
//    5. Register 404 handler  (after routes)
//    6. Register error handler (last of all)
//    7. Start listening on PORT
// =============================================================

// require('dotenv').config();
import 'dotenv/config';


import express, { json, urlencoded } from 'express';
import cors from 'cors';

// Middleware
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Route files — uncomment each one as you build it
import authRoutes from './routes/auth.routes.js';
import memberRoutes from './routes/member.routes.js';
import staffRoutes from './routes/staff.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import classRoutes from './routes/class.routes.js';
import trainingRoutes from './routes/training.routes.js';
import equipmentRoutes from './routes/equipment.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// -------------------------------------------------------------
//  App initialisation
// -------------------------------------------------------------
const app  = express();
const PORT = process.env.PORT || 5000;

// -------------------------------------------------------------
//  Global middleware
// -------------------------------------------------------------

// CORS — only allow requests from the frontend origin defined in .env
app.use(
  cors({
    origin:      process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,                   // allow cookies if needed later
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse incoming JSON request bodies
app.use(json());

// Parse URL-encoded form data (just in case)
app.use(urlencoded({ extended: true }));

// Simple request logger — logs method, URL, and timestamp in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}]  ${req.method}  ${req.originalUrl}`);
    next();
  });
}

// -------------------------------------------------------------
//  Health check — public, no auth required
//  GET /
//  Returns: { status: 'API running', environment, timestamp }
// -------------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    status:      'API running',
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
  });
});

// -------------------------------------------------------------
//  API routes
//  All routes are prefixed with /api to distinguish them from
//  any static assets or frontend routes served in production.
// -------------------------------------------------------------
app.use('/api/auth',       authRoutes);
app.use('/api/members',    memberRoutes);
app.use('/api/staff',      staffRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/classes',    classRoutes);
app.use('/api/training',   trainingRoutes);
app.use('/api/equipment',  equipmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics',  analyticsRoutes);

// -------------------------------------------------------------
//  404 handler — catches any request that did not match a route
//  Must come AFTER all app.use(routes) calls
// -------------------------------------------------------------
app.use(notFound);

// -------------------------------------------------------------
//  Global error handler — catches everything forwarded by next(err)
//  Must be the LAST middleware registered
// -------------------------------------------------------------
app.use(errorHandler);

// -------------------------------------------------------------
//  Start server
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log(`🏋️   Gym Management API`);
  console.log(`🚀  Server   : http://localhost:${PORT}`);
  console.log(`🌍  Env      : ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡  Frontend : ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log('═══════════════════════════════════════════');
});

export default app; // exported for testing (TASK-32)