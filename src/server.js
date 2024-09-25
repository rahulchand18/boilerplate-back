import dotenv from 'dotenv';
dotenv.config();
import connect from './config/db.js';
import { Server } from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import passport from 'passport';
import routes from './router.js';

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in .env file');
    process.exit(1);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
    expressSession({
        secret: process.env.JWT_SECRET,
        resave: true,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

const server = Server(app);

console.log('Connecting to database...');
connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log('Server started at', PORT);
        });
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });

app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
