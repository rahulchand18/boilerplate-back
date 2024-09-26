import express from 'express';
import authController from '../auth/auth.controller.js';

const router = express.Router();

router.get('/verify-token', authController.verifyToken);

const authRoutes = router;

export default authRoutes;
