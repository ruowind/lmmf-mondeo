'use strict';

let gutil = require('gulp-util'),
    path = require('path'),
    through = require('through2'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'organize-files',
    conf = require('../lib/config');

function main() {
    let step1 = function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (path.extname(file.path) !== '.html') {
            let a = path.relative(path.resolve(file.cwd, conf.config.src.dir), file.path);
            file.path = path.resolve(file.cwd, conf.config.dist.pic, a);
        }

        this.push(file);
        cb();
    };

    return through.obj(step1);
}

module.exports = main;