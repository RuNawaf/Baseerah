import { Router } from 'express';
import { health } from '../controllers/healthController.js';

export function healthRoutes() {
  const router = Router();
  router.get('/', health);
  return router;
}
