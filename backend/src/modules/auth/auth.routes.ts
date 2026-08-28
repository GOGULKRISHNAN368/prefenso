import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validateRequest } from '../../middleware/validateRequest';
import { loginRateLimiter } from '../../middleware/rateLimiter';
import { emptySchema, loginSchema } from './auth.validation';
import { loginController, logoutController, meController, refreshController } from './auth.controller';

export function authRoutes(portal: 'admin' | 'watchman') {
  const router = Router();
  router.post('/login', loginRateLimiter, validateRequest(loginSchema), loginController(portal));
  router.post('/refresh', validateRequest(emptySchema), refreshController(portal));
  router.post('/logout', validateRequest(emptySchema), logoutController(portal));
  router.get('/me', authenticate, meController);
  return router;
}
