import AuthService from '../auth/auth.service.js';
const { findRefreshToken, updateRefreshToken, setCookie } = AuthService;
import { REFRESH_TOKEN } from '../../constants/cookie-keys.constant.js';
import { verifyExpiredToken } from '../../config/token.js';
import { decryptText, createAccessToken } from '../../utils/utils.js';
import UserService from '../users/user.service.js';
import RefreshToken from './refresh-token.model.js';
const { findUserById } = UserService;

const refreshAccessToken = async (req, res) => {
    let validatedData = req.body;

    let decoded;
    const refreshToken = req.cookies[REFRESH_TOKEN];
    try {
        if (refreshToken && validatedData.accessToken) {
            decoded = verifyExpiredToken(
                validatedData.accessToken,
                process.env.JWT_SECRET
            );
        }
    } catch (error) {
        console.log(error);
    }
    if (!decoded || !refreshToken) {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
    const refreshTokenData = await findRefreshToken(decryptText(refreshToken));

    const user = await findUserById(refreshTokenData.userId);
    if (!user) {
        return res.status(401).json({
            message: 'User has been logged out'
        });
    }

    const newRefreshTokenData = await updateRefreshToken(
        req.cookies[REFRESH_TOKEN],
        res
    );
    if (newRefreshTokenData) {
        setCookie(REFRESH_TOKEN, newRefreshTokenData.refreshToken, res);
        const payload = {
            userName: user.userName,
            id: user._id
        };
        return res.status(200).json({
            message: 'New Access token generated',
            data: {
                accessToken: createAccessToken(payload)
            }
        });
    }
};

const verifyToken = async (req, res) => {
    try {
        let refreshToken = req.cookies['refresh-token-internal'];

        if (!refreshToken) {
            return res
                .status(401)
                .json({ authenticated: false, message: 'No token provided!' });
        }
        refreshToken = decryptText(refreshToken);

        const tokenData = await RefreshToken.findOne({
            refreshToken,
            expireIn: { $gte: new Date() },
            $or: [{ revoke: { $eq: null } }, { revoke: { $exists: false } }]
        });

        if (!tokenData) {
            return res.status(403).json({
                authenticated: false,
                message: 'Invalid or expired token!'
            });
        }

        const userId = tokenData.userId;
        const user = await findUserById(userId);

        return res.status(200).json({
            authenticated: true,
            message: 'Token is valid',
            user: {
                userName: user.userName,
                employeeId: user.employeeId
            }
        });
    } catch (error) {
        console.error('Error in verifyToken:', error);
        res.status(500).json({
            authenticated: false,
            message: 'Internal Server Error'
        });
    }
};
const authController = {
    refreshAccessToken,
    verifyToken
};

export default authController;
