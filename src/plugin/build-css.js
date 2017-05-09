'use strict';

let through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    crypto = require('crypto'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'gulp-build-css',
    IMG_URL_REG = /url\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|[^)}]+)\s*\)/gi;

function md5(content) {
    let md5 = crypto.createHash('md5');
    md5.update(content);
    return md5.digest('hex');
}

function delQuery(url) {
    let index = url.indexOf('?');
    if (index > 0) {
        url = url.substr(0, index);
    }
    return url;
}

function main(config) {
    let cssFiles = [];
    let cssVersions = {};

    let step1 = function (file, enc, cb) {
        config = config ? config : {};
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (path.extname(file.path) === '.css') {
            cssFiles.push(file);
        } else {
            cssVersions[file.path] = md5(file.contents).substr(0, 6);
            this.push(file);
        }

        cb();
    };

    let step2 = function (cb) {
        let that = this;
        cssFiles.forEach(function (cssFile) {
            let fileString = String(cssFile.contents);
            fileString = fileString.replace(IMG_URL_REG, function (m, imgUrl) {
                if (imgUrl.indexOf('//') < 0) {
                    imgUrl = delQuery(imgUrl.replace(/'/g, '').replace(/"/g, ''));
                    let absolutePath = path.resolve(path.dirname(cssFile.path), imgUrl);
                    if (cssVersions[absolutePath]) {
                        imgUrl += '?' + cssVersions[absolutePath];
                    } else {
                        // console.log('build-css-->: file: ' + imgUrl + ' not exits! so has skiped');
                    }
                    let cdn = ['http://pic.lvmama.com'];
                    let IMG_DOMAIN_REG = new RegExp('.*?(' + config.imgPath + '/)');
                    imgUrl = imgUrl.replace(IMG_DOMAIN_REG, function () {
                        let index = Math.floor((Math.random() * cdn.length));
                        return cdn[index] + '/img/' + config.projectPath;
                    });
                }

                return 'url(' + imgUrl + ')';
            });

            // remove sourcemap
            // let index = fileString.indexOf('/*# sourceMappingURL=data:application/json;charset=utf8;base64,');
            // fileString = fileString.substr(0, index - 1);

            cssFile.contents = new Buffer(fileString);
            that.push(cssFile);
        });

        cb();
    };

    return through.obj(step1, step2);
}

module.exports = main;