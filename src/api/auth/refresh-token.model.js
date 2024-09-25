import { Schema as _Schema, model } from 'mongoose';
import UserModel from '../users/users.model.js';
const Schema = _Schema;

const refreshTokenSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: UserModel,
            required: true
        },
        refreshToken: {
            type: String,
            required: true
        },
        ip: {
            type: String,
            required: true
        },
        browser: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        expireIn: {
            type: Date,
            required: true
        },
        revoke: {
            type: Date,
            required: false
        },
        revokeIp: {
            type: String,
            required: false
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);
const RefreshToken = model('refresh-token', refreshTokenSchema);

export default RefreshToken;
