import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { isTokenValid } from '../middleware/auth.middleware';
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', isTokenValid, authController.me);

export default router;
