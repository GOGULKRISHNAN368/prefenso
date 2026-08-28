import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validateRequest } from '../../middleware/validateRequest';
import { blockSchema, credentialsSchema, resetPasswordSchema, statusSchema, updateBlockSchema } from './block.validation';
import * as controller from './block.controller';

export const blockRoutes = Router();
blockRoutes.use(authenticate, requireRole('ADMIN'));
blockRoutes.get('/', controller.listBlocks);
blockRoutes.post('/', validateRequest(blockSchema), controller.createBlock);
blockRoutes.get('/:blockId', controller.getBlock);
blockRoutes.patch('/:blockId', validateRequest(updateBlockSchema), controller.updateBlock);
blockRoutes.patch('/:blockId/status', validateRequest(statusSchema), controller.setStatus);
blockRoutes.put('/:blockId/credentials', validateRequest(credentialsSchema), controller.configureCredentials);
blockRoutes.put('/:blockId/reset-password', validateRequest(resetPasswordSchema), controller.resetPassword);
