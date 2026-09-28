import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/authRoutes.js';
import usersRoutes from './modules/users/usersRoutes.js';
import clientRoutes from './modules/client/clientRoutes.js';
import freelancerRoutes from './modules/freelancer/freelancerRoutes.js';
import projectsRoutes from './modules/projects/projectsRoutes.js';
import proposalsRoutes from './modules/proposals/proposalsRoutes.js';
import specialtiesRoutes, {
  adminSpecialtiesRouter,
} from './modules/freelancer/specialties/specialtiesRoutes.js';
import servicesRoutes from './modules/freelancer/services/servicesRoutes.js';
import contractsRoutes from './modules/workspace/contracts/contractsRoutes.js';
import chatRoutes from './modules/workspace/chat/chatRoutes.js';
import tasksRoutes from './modules/workspace/tasks/tasksRoutes.js';
import scopeChangesRoutes from './modules/workspace/scope-changes/scopeChangesRoutes.js';
import walletRoutes from './modules/wallet/walletRoutes.js';
import subscriptionsRoutes from './modules/subscriptions/subscriptionsRoutes.js';
import disputesRoutes from './modules/disputes/disputesRoutes.js';
import notificationsRoutes from './modules/notifications/notificationsRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';
import aiRoutes from './modules/ai/aiRoutes.js';
import contactRoutes from './modules/contact/contactRoutes.js';
import { publicAdvertisementsRouter } from './modules/freelancer/advertisements/advertisementsRoutes.js';

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(
  '/api/health',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Hub Freelance API is running',
      timestamp: new Date().toISOString(),
    });
  }),
);

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/specialties', specialtiesRoutes);
app.use('/api/admin/specialties', adminSpecialtiesRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/scope-changes', scopeChangesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/advertisements', publicAdvertisementsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
