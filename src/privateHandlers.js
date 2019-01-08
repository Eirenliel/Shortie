const assert = require('assert');
const urls = require('./urls.js');
const config = require('../config.js');

const prefix = config.url.prefix;

module.exports = {
    set: (req, res, next) => {
        Promise.resolve().then(() => {
            if(req.body.handle)
                assert.ok(typeof(req.body.handle) === 'string', 'Handle must be a string');
            assert(req.body.target, 'Target should be defined');
            assert.ok(typeof(req.body.target) === 'string', 'Target must be a string');
            return true;
        }).then(() => {
            if(req.body.handle)
                return urls.setUrl(req.body.handle, req.body.target);
            else
                return urls.createUrl(req.body.target);
        }).then((url) => {
            res.json({message: 'OK', handle: url.handle, url: prefix + url.handle, target: url.target});
        }).catch(next);
    }
};
