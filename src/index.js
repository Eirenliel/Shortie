const debug = require('debug')('shortie:index');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const util = require('util');
const assert = require('assert');

const config = require('../config.js');
mongoose.Promise = global.Promise;


const publicApi = express();
publicApi.use(bodyParser.json({limit: '1mb'}));
publicApi.all('/:handle', require('./publicHandlers.js').get);
publicApi.use(errorHandler);

const privateApi = express();
privateApi.use(bodyParser.json({limit: '1mb'}));
privateApi.post('/set', (req, res, next) => {
    if(req.body.handle) {
        assert.ok(typeof(req.body.handle) === 'string', 'Handle must be a string');
    }
    if(req.body.target) {
        assert.ok(typeof(req.body.target) === 'string', 'Target must be a string');
    }
    if(config.privatePassword) {
        assert.ok(typeof(req.query.pwd) === 'string', 'Password must be a string');
        assert.ok(req.body.pwd === config.privatePassword, 'Private API password does not match');
    }
    next();
});
privateApi.post('/set', require('./privateHandlers.js').set);
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
            error: 'ERROR',
            message: err.toString()
        });
    } else {
        next();
    }
}
