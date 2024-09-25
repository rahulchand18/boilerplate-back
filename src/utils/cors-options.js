const whitelist = [
    'http://10.99.99.165:4300',
    'https://ams.javra.com',
    'http://localhost:4300',
    'http://10.0.3.192:4300',
    'http://10.0.3.110:4300',
    'https://amstest.javra.com'
];
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
module.exports = corsOptions;
