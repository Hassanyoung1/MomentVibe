import express from 'express';
import AuthController from '../controllers/AuthController.mjs';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/request-password-reset', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);
router.get('/confirm-email', AuthController.confirmEmail);

export default router;