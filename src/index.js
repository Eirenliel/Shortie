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
privateApi.get('/set', (req, res, next) => {
    if(req.query.handle) {
        assert.ok(typeof(req.query.handle) === 'string', 'Handle must be a string');
        req.body.handle = decodeURIComponent(req.query.handle);
    }  
    if(req.query.target) {
        assert.ok(typeof(req.query.target) === 'string', 'Target must be a string');
        req.body.target = decodeURIComponent(req.query.target);
    }
    next();
});
privateApi.all('/set', require('./privateHandlers.js').set);
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
