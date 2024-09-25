import express from 'express';
import userController from './users.controller.js';
import authController from '../auth/auth.controller.js';

const router = express.Router();

router.post('/createUser', userController.createNewUser);
router.post('/importUsers', userController.importEmployee);

router.post('/refresh-access-token', authController.refreshAccessToken);

router.post('/login', userController.login);

const userRoutes = router;

export default userRoutes;
