import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireActiveBlock, requireRole } from '../../middleware/requireRole';
import { adminDashboard, watchmanDashboard } from './dashboard.controller';
export const adminDashboardRoutes = Router(); adminDashboardRoutes.use(authenticate, requireRole('ADMIN')); adminDashboardRoutes.get('/', adminDashboard);
export const watchmanDashboardRoutes = Router(); watchmanDashboardRoutes.use(authenticate, requireRole('WATCHMAN'), requireActiveBlock); watchmanDashboardRoutes.get('/', watchmanDashboard);
