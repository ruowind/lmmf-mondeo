'use strict';

let through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    conf = require('../lib/config'),
    _ = require('lodash'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'gulp-build-html',
    CSS_CONCAT_REG = /<!--css-concat-->([\s\S]*?)<!--css-concat-end-->/g,
    CSS_HREF_REG = /(?:<!--[\s\S]*?(?:-->|$))|href=["|']([^"']*)["|']/g,
    CSS_PATH_REG = /\/styles\/.*/g,
    JS_CONCAT_REG = /<!--js-concat-->([\s\S]*?)<!--js-concat-end-->/g,
    JS_SRC_REG = /(?:<!--[\s\S]*?(?:-->|$))|src=["|']([^"']*)["|']/g,
    JS_PATH_REG = /\/js\/.*/g;

function main() {
    function concatUrl(fileString, fileType) {
        return fileString.replace(fileType === 'css' ? CSS_CONCAT_REG : JS_CONCAT_REG, function (m, concatContent) {
            let relativePaths = [];
            let regGroups;
            while (regGroups = (fileType === 'css' ? CSS_HREF_REG : JS_SRC_REG).exec(concatContent)) {
                regGroups[1] && relativePaths.push(_.trimStart(regGroups[1].match(fileType === 'css' ? CSS_PATH_REG : JS_PATH_REG)[0], '/'));
            }
            return fileType === 'css' ? '<link rel="stylesheet" href="' + conf.config.cdn.domain + conf.config.cdn.path + relativePaths.join(',') + '">' : '<script src="' + conf.config.cdn.domain + conf.config.cdn.path + relativePaths.join(',') + '"></script>';
        });
    }

    let step1 = function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }
        if (path.extname(file.path) === '.html') {
            file.contents = new Buffer(concatUrl(concatUrl(String(file.contents), 'css'), 'js'));
        }
        this.push(file);
        cb();
    };

    return through.obj(step1);
}

module.exports = main;