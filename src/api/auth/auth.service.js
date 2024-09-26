import { v4 as uuidv4 } from 'uuid';
import { REFRESH_TOKEN } from '../../constants/cookie-keys.constant.js';
import RefreshTokenModel from './refresh-token.model.js';
import UserModel from '../users/users.model.js';
import {
    getIp,
    getBrowserInfo,
    getCountry,
    encryptText,
    decryptText
} from '../../utils/utils.js';
import { DOMAINS } from '../../constants/cookie-domains.constant.js';

const REFRESH_TOKEN_EXPIRATION_MS =
    parseInt(process.env.REFRESH_TOKEN_EXPIRATION_MIN || 1080) * 60 * 1000;

const createRefreshToken = async (req, userId) => {
    const refreshTokenData = await RefreshTokenModel.findOne({
        $and: [
            { userId },
            { expireIn: { $gte: new Date() } },
            { $or: [{ revoke: { $eq: null } }, { revoke: { $exists: false } }] }
        ]
    });
    if (refreshTokenData) {
        refreshTokenData.expireIn = new Date(
            Date.now() + REFRESH_TOKEN_EXPIRATION_MS
        );
        await refreshTokenData.save();
        return refreshTokenData.refreshToken;
    } else {
        const refreshToken = new RefreshTokenModel({
            userId,
            refreshToken: uuidv4(),
            ip: getIp(req),
            browser: getBrowserInfo(req),
            country: getCountry(req),
            expireIn: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS)
        });
        await refreshToken.save();
        return refreshToken.refreshToken;
    }
};

const findRefreshToken = async (token) => {
    return await RefreshTokenModel.findOne({ refreshToken: token });
};

const updateRefreshToken = async (refreshToken) => {
    const refreshTokenData = await RefreshTokenModel.findOne({
        revoke: null,
        refreshToken: decryptText(refreshToken)
    });
    if (refreshTokenData) {
        refreshTokenData.expireIn = new Date(
            Date.now() + REFRESH_TOKEN_EXPIRATION_MS
        );
        return await refreshTokenData.save();
    }
};

const revokeRefreshToken = async (req) => {
    const refreshToken = req.cookies[REFRESH_TOKEN];
    if (refreshToken) {
        const refreshTokenData = await RefreshTokenModel.findOne({
            refreshToken: decryptText(refreshToken)
        });
        if (refreshTokenData) {
            refreshTokenData.revoke = new Date();
            refreshTokenData.revokeIp = getIp(req);
            await refreshTokenData.save();
        }
    }
};

const setCookie = (cookieName, token, res) => {
    const domains = DOMAINS;
    const cookieOptions = {
        httpOnly: true,
        sameSite: 'None',
        expires: new Date(Number(Date.now()) + REFRESH_TOKEN_EXPIRATION_MS),
        secure: true
    };

    domains.forEach((domain) => {
        cookieOptions.domain = domain;
        res.cookie(cookieName, encryptText(token), cookieOptions);
    });
};

const destroyCookie = (cookieName, res) => {
    res.cookie(cookieName, { expires: new Date() });
};

const getUserNameFromRefreshToken = async (refreshToken) => {
    const refreshTokenData = await RefreshTokenModel.findOne({
        refreshToken: decryptText(refreshToken)
    });
    if (refreshTokenData && refreshTokenData.userId) {
        const userId = refreshTokenData.userId;
        const user = await UserModel.findById(userId);
        return user.userName;
    }
};

const AuthService = {
    createRefreshToken,
    setCookie,
    findRefreshToken,
    updateRefreshToken,
    revokeRefreshToken,
    destroyCookie,
    getUserNameFromRefreshToken
};

export default AuthService;
