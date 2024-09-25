import { getClientIp } from 'request-ip';
import Cryptr from 'cryptr';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

const cryptr = new Cryptr(
    process.env.ENCRYPT_JWT_SECRET || '1191J@Vr@HrM$y$teMNew*1221'
);

export const getBrowserInfo = (req) => {
    return req.headers['user-agent'] || 'XX';
};

export const getCountry = (req) => {
    return req.headers['cf-ipcountry'] ? req.headers['cf-ipcountry'] : 'XX';
};

export const getIp = (req) => {
    return getClientIp(req);
};

export const encryptText = (text) => {
    return cryptr.encrypt(text);
};

export const createAccessToken = (user) => {
    const accessToken = sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });
    return encryptText(accessToken);
};

export const decryptText = (encryptedString) => {
    const decryptedText = cryptr.decrypt(encryptedString);
    return decryptedText;
};

export const dynamicSort = (property) => {
    let sortOrder = 1;
    if (property[0] === '-') {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        const result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * sortOrder;
    };
};
