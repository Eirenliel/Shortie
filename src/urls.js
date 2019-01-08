const debug = require('debug')('shortie:urls');
const Url = require('../schema/url.js');
const config = require('../config.js');

const maxIterations = 10000;
const urlCache = Object.create(null);
const characters = config.url.mixedCase ? '0123456789abcdefghijklmnopqrstuvwxyzABCDEFJHIJKLMNOPQRSTUVWXYZ_-' : '0123456789abcdefghijklmnopqrstuvwxyz';

function randomHandle(length) {
    var handle = '';
    for(var i = 0; i < length; i++)
        handle += characters.charAt(Math.floor(Math.random() * characters.length));
    return handle;
}

function findEmptyHandle(length, iteration) {
    if(!length)
        length = config.url.length;
    var handle = randomHandle(length);
    return Url.count({handle: handle}).exec().then(count => {
        if(count == 0)
            return handle;
        if(iteration > maxIterations)
            throw new Error('Too many iterations when trying to find empty handle. Consider changing configuration.');
        return findEmptyHandle(length, iteration + 1);
    });
}

module.exports = {
    getUrl: (handle) => {
        let url = urlCache[handle];
        if(url) {
            return Promise.resolve(url);
        } else {
            return Url.findOne({handle: handle}).exec().then((found) => {
                if(found) {
                    urlCache[url] = found;
                }
                return found;
            });
        }
    },
    setUrl: (handle, target) => {
        delete urlCache[handle];
        return Url.deleteMany({handle: handle}).exec().then(() => {
            let url = new Url({
                handle: handle,
                created: Date.now(),
                target: target
            });
            return url.save().then(document => {
                urlCache[handle] = document;
                debug('New url created: from', document.handle, 'to', document.target);
                return document;
            });
        });
    },
    createUrl: (target) => {
        return findEmptyHandle(config.url.length).then((handle) => {
            let url = new Url({
                handle: handle,
                created: Date.now(),
                target: target
            });
            return url.save().then(document => {
                urlCache[handle] = document;
                debug('New url created: from', document.handle, 'to', document.target);
                return document;
            });
        });
    },
    deleteUrl: (handle) => {
        delete urlCache[handle];
        return Url.deleteMany({handle: handle}).exec();
    },
    findUrl: (find) => {
        return Url.find({target: find}).exec();
    },
    findEmptyHandle: findEmptyHandle,
};
