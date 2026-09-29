import express from 'express'; // triggered restart
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import dns from 'node:dns';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import zoomRoutes from './routes/zoomRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import cartRoutes from './routes/cartRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminPaymentRoutes from './routes/adminPaymentRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';


// Configure DNS fallback for SRV record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('DNS setServers failed:', err.message);
}

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }
});

// Save socket instance globally
app.set('io', io);

// Socket.io handler
io.on('connection', (socket) => {
  console.log(`Socket node connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket node disconnected: ${socket.id}`);
  });
});

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false // disable CSP locally to allow raw pdf downloads and previews easily
}));

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Development Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

import correlationMiddleware from './middlewares/correlationMiddleware.js';

// Security & Correlation Middlewares
app.use(correlationMiddleware);

// Health & Readiness Probes
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), correlationId: req.correlationId });
});

app.get('/readyz', (req, res) => {
  res.status(200).json({ ready: true, service: 'notepediax-api', environment: process.env.NODE_ENV || 'development' });
});

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Notepediax Production API Gateway', correlationId: req.correlationId });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/zoom', zoomRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Register Custom UPI Payment gateway and Cart routes
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/chatbot', chatbotRoutes);


// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
