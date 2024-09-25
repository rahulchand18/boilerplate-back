import pkg from 'jsonwebtoken';
const { verify } = pkg;
import Cryptr from 'cryptr';
import { decryptText } from '../utils/utils.js';
const cryptr = new Cryptr(
    process.env.ENCRYPT_JWT_SECRET || '1191J@Vr@HrM$y$teMNew*1221'
);

export const authenticateToken = (req, res, next) => {
    let token = null;
    if (req.header('x-token')) {
        token = req.get('x-token');
    } else if (req.headers.authorization) {
        token = req.headers.authorization
            .replace('Bearer ', '')
            .replace(' ', '');
    } else if (req.body.token) {
        token = req.body.token.replace(' ', '');
    }
    if (req.query.token) {
        token = req.body.token.replace(' ', '');
    }
    if (token) {
        try {
            token = cryptr.decrypt(token);
            req.headers.authorization = 'Bearer ' + token;
        } catch (err) {
            res.status(404).json({ message: 'Invalid token ', err });
        }
    }
    next();
};

export const verifyExpiredToken = (encryptedToken, secretKey) => {
    if (encryptedToken) {
        const token = decryptText(encryptedToken);
        return verify(token, secretKey, { ignoreExpiration: false });
    } else {
        return false;
    }
};
