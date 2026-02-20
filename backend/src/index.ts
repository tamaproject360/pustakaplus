import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './utils/errors';

// Routes
import authRoutes from './routes/auth.routes';
import collectionsRoutes from './routes/collections.routes';
import borrowingsRoutes from './routes/borrowings.routes';
import reservationsRoutes from './routes/reservations.routes';
import knowledgesRoutes from './routes/knowledges.routes';
import guestBookRoutes from './routes/guestBook.routes';
import usersRoutes from './routes/users.routes';
import notificationsRoutes from './routes/notifications.routes';
import auditLogsRoutes from './routes/auditLogs.routes';
import settingsRoutes from './routes/settings.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/borrowings', borrowingsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/knowledges', knowledgesRoutes);
app.use('/api/guest-book', guestBookRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'PustakaPlus API is running.', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`PustakaPlus API running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
