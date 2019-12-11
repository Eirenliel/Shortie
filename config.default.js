module.exports = {
    publicApi: {
        port: 80,
        host: '0.0.0.0',
    },
    privateApi: {
        port: 4081,
        host: '127.0.0.1'
    },
    url: {
        length: 4,
        mixedCase: true,
        prefix: 'http://localhost/'
    },
    privatePassword: '',
    mongoDbUrl: 'mongodb://<user>:<password>@<host>:<port>/<database>',
    mongooseOptions: {
        useNewUrlParser: true,
        keepAlive: 300000,
        connectTimeoutMS: 30000
    }
};
