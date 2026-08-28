import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireActiveBlock, requireRole } from '../../middleware/requireRole';
import { validateRequest } from '../../middleware/validateRequest';
import { checkInSchema, checkoutSchema } from './visitor.validation';
import * as controller from './visitor.controller';

export const watchmanVisitorRoutes = Router();
watchmanVisitorRoutes.use(authenticate, requireRole('WATCHMAN'), requireActiveBlock);
watchmanVisitorRoutes.post('/check-in', validateRequest(checkInSchema), controller.checkIn);
watchmanVisitorRoutes.get('/inside', controller.watchmanInside);
watchmanVisitorRoutes.get('/history', controller.watchmanHistory);
watchmanVisitorRoutes.get('/:visitorId', controller.visitorDetail);
watchmanVisitorRoutes.patch('/:visitorId/check-out', validateRequest(checkoutSchema), controller.checkOut);

export const adminVisitorRoutes = Router();
adminVisitorRoutes.use(authenticate, requireRole('ADMIN'));
adminVisitorRoutes.get('/', controller.adminVisitors);
adminVisitorRoutes.get('/inside', controller.adminInside);
adminVisitorRoutes.get('/:visitorId', controller.adminDetail);
