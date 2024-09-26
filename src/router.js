import express from 'express';
import userRoutes from './api/users/users.routes.js';
import authRoutes from './api/auth/auth.routes.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hello World'
    });
});

router.use('/api/v1/user', userRoutes);
router.use('/api/v1/auth', authRoutes);

export default router;
