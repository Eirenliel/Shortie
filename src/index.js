const debug = require('debug')('shortie:index');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const util = require('util');

const config = require('../config.js');
mongoose.Promise = global.Promise;


const publicApi = express();
publicApi.use(bodyParser.json({limit: '1mb'}));
publicApi.use(errorHandler);

const privateApi = express();
privateApi.use(bodyParser.json({limit: '1mb'}));
privateApi.use(errorHandler);

mongoose.connect(config.mongoDbUrl, config.mongooseOptions).then(() => {
    debug('Connected to MongoDb');
    return Promise.all([
        util.promisify(publicApi.listen).call(publicApi, config.publicApi),
        util.promisify(privateApi.listen).call(privateApi, config.privateApi),
    ]);
}).then(() => {
    debug('Shortie started serving on', config.publicApi, 'and', config.privateApi);
}).catch(err => {
    debug(err.toString());
});

function errorHandler(err, req, res, next) {
    if (err) {
        debug('ERROR', err.toString());
        res.json({
            error: true,
            message: err.toString()
        });
    } else {
        next();
    }
}
