const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = mongoose.model('Url', {
    handle: {type: String, index: true},
    created: {type: Date},
    target: {type: String}
});
