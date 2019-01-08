const assert = require('assert');
const urls = require('./urls.js');

module.exports = {
    get: (req, res, next) => {
        Promise.resolve().then(() => {
            assert(req.params.handle, 'Handle should be defined');
            assert.ok(typeof(req.params.handle) === 'string', 'Handle must be a string');
            return true;
        }).then(() => {
            urls.getUrl(req.params.handle).then(url => {
                if(!url) {
                    res.status(404).send({error: 'Requested url not found'});
                } else {
                    res.redirect(url.target);
                }
            });
        }).catch(next);
    }
};
