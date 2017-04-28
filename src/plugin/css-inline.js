'use strict';

let through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'css-inline',
    base64Img = require('base64-img'),
    IMG_URL_REG = /url\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|[^)}]+)\s*\)/gi;

function replaceInlineImg(file) {
    let fileString = String(file.contents);
    fileString = fileString.replace(IMG_URL_REG, function (m, imgUrl) {
        if (imgUrl.indexOf('//') < 0) {
            imgUrl = imgUrl.replace(/'/g, '').replace(/"/g, '');
            let arry = imgUrl.split('?');
            if (arry[1] && arry[1] === '__inline') {
                let url = arry[0];
                let imgPath = path.resolve(path.dirname(file.path), url);
                imgUrl = base64Img.base64Sync(imgPath);
            }
        }
        return 'url(' + imgUrl + ')';
    });
    file.contents = new Buffer(fileString);
    return file;
}

function main() {
    let step1 = function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (path.extname(file.path) === '.css') {
            file = replaceInlineImg(file);
        }
        this.push(file);

        cb();
    };

    return through.obj(step1);
}

module.exports = main;