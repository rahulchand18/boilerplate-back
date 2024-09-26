import { connect as _connect } from 'mongoose';

const connect = async () => {
    try {
        const result = await _connect(process.env.DOCKER_MONGODB_URI, {
            auth: {
                username: process.env.MONGO_USERNAME,
                password: process.env.MONGO_PASSWORD
            },
            authSource: 'admin'
        });
        console.log('Connected to database..');
        return result;
    } catch (error) {
        console.log('Error while connecting to database\n', error);
        setTimeout(() => {
            console.log('Trying reconnecting to database..');
            connect();
        }, 3000);
    }
};

export default connect;
