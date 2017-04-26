'use strict';

let through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    _ = require('lodash'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'file-dependencies',
    CSS_HREF_REG = /(?:<!--[\s\S]*?(?:-->|$))|href=["|']([^"']*)["|']/g,
    JS_SRC_REG = /(?:<!--[\s\S]*?(?:-->|$))|src=["|']([^"']*)["|']/g,
    BACKGROUND_RE = /(?:\/\*[\s\S]*?(?:\*\/|$))|\bbackground(?:-image)?:([\s\S]*?)(?:;|}|$)|background-position:([\s\S]*?)(?:;|}|$)|background-repeat:([\s\S]*?)(?:;||}$)|background-size:([\s\S]*?)(?:;|}|$)/gi,
    IMAGE_URL_RE = /url\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|[^)}]+)\s*\)/i;

function htmlDep(file) {
    let fileString = String(file.contents);
    let regGroups;
    let cssUrls = [];
    let jsUrls = [];

    while (regGroups = CSS_HREF_REG.exec(fileString)) {
        if (regGroups[1]) {
            let cssUrl = regGroups[1];
            if (cssUrl.substr(0, 3) === '../' && path.extname(cssUrl) === '.css') {
                cssUrls.push(path.resolve(path.dirname(file.path), cssUrl));
            }
        }
    }

    while (regGroups = JS_SRC_REG.exec(fileString)) {
        if (regGroups[1]) {
            let jsUrl = regGroups[1];
            if (jsUrl.substr(0, 3) === '../' && path.extname(jsUrl) === '.js') {
                jsUrls.push(path.resolve(path.dirname(file.path), jsUrl));
            }
        }
    }

    return {
        path: file.path,
        js: jsUrls,
        css: cssUrls
    };
}

function cssDep(file) {
    let fileString = String(file.contents);
    let regGroups;
    let imgUrls = [];
    while (regGroups = BACKGROUND_RE.exec(fileString)) {
        if (regGroups[1]) {
            let b = regGroups[1].match(IMAGE_URL_RE);
            if (b && b[1]) {
                let imgUrl = b[1].replace(/'/g, '').replace(/"/g, '');
                if (imgUrl.substr(0, 3) === '../') {
                    if (imgUrl.indexOf('?') > 0) {
                        imgUrl = imgUrl.substr(0, imgUrl.indexOf('?'));
                    }
                    imgUrls.push(path.resolve(path.dirname(file.path), imgUrl));
                }
            }
        }
    }
    return imgUrls;
}

function main(htmlPath) {
    let allFiles = [];
    let depFiles = {
        html: {},
        css: {}
    };

    let step1 = function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }
        let ext = path.extname(file.path);
        switch (ext) {
            case '.html':
                depFiles.html[file.path] = htmlDep(file);
                break;
            case '.css':
                depFiles.css[file.path] = cssDep(file);
                break;
        }
        allFiles.push(file);
        cb();
    };

    let step2 = function (cb) {
        let that = this;
        let allEffectiveFilePaths = [];

        for (let key in depFiles.html) {
            if (!(htmlPath && key !== htmlPath)) {
                let element = depFiles.html[key];
                allEffectiveFilePaths.push(element.path);
                allEffectiveFilePaths = _.concat(allEffectiveFilePaths, element.js);
                allEffectiveFilePaths = _.concat(allEffectiveFilePaths, element.css);

                _.each(element.css, (cssPath) => {
                    allEffectiveFilePaths = _.concat(allEffectiveFilePaths, depFiles.css[cssPath]);
                });
            }
        }

        _.each(allFiles, (file) => {
            if (_.includes(allEffectiveFilePaths, file.path)) {
                that.push(file);
            }
        });
        cb();
    };

    return through.obj(step1, step2);
}

module.exports = main;