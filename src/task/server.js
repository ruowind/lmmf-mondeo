'use strict';

const path = require('path');
const browserSync = require('browser-sync');
const watchr = require('watchr');
const _ = require('lodash');
const css = require('./css');

let changeHandler = function (event, projectConfig, bs) {
    let fileType = _.trimStart(path.extname(event.path), '.');

    switch (fileType) {
        case 'less':
        case 'scss':
        case 'sass':
        case 'css':
            css.compileOne(event.path, projectConfig, bs);
            break;
        default:
            bs.reload();
            break;
    }
};

exports.startServer = (projectConfig) => {
    const bs = browserSync.create();
    bs.init({
        server: {
            baseDir: projectConfig.path,
            directory: true
        },
        startPath: "/",
        port: 8080,
        reloadDelay: 0,
        timestamps: true
    });

    function listener(changeType, fullPath) {
        switch (changeType) {
            case 'update':
            case 'create':
                console.log('the file', fullPath, 'was ' + changeType + 'ed');
                changeHandler({
                    path: fullPath,
                    type: changeType
                }, projectConfig, bs);
                break;
            case 'delete':
                console.log('the file', fullPath, 'was deleted')
                break;
        }
    }

    function next(err) {
        if (err) return console.log('watch failed on', projectConfig.path, 'with error', err);
        console.log('watch successful on', projectConfig.path);
    }

    let stalker = watchr.open(projectConfig.path, listener, next);
    stalker.setConfig({
        catchupDelay: 10,
        ignoreHiddenFiles: true,
        ignoreCommonPatterns: true
    });

    return bs;
}