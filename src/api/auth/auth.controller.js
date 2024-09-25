import AuthService from '../auth/auth.service.js';
const { findRefreshToken, updateRefreshToken, setCookie } = AuthService;
import { REFRESH_TOKEN } from '../../constants/cookie-keys.constant.js';
import { verifyExpiredToken } from '../../config/token.js';
import { decryptText, createAccessToken } from '../../utils/utils.js';
import UserService from '../users/user.service.js';
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

    // const user = await UserService.findUserById(userId.userId);
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
const authController = {
    refreshAccessToken
};

export default authController;
