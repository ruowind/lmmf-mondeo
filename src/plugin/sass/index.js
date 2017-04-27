'use strict';
let Sass = require('./sass.sync'),
    through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'sass';

let replaceExt = (npath, ext) => {
    if (typeof npath !== 'string') {
        return npath;
    }

    if (npath.length === 0) {
        return npath;
    }

    let index = npath.lastIndexOf('.');
    return npath.substr(0, index + 1) + ext;
};

function main() {
    let step1 = function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }
        let that = this;
        if (['.sass', '.scss'].indexOf(path.extname(file.path)) > -1) {
            Sass.compile(String(file.contents), function (result) {
                file.contents = new Buffer(result.text);
                file.path = replaceExt(file.path, 'css');
                that.push(file);
                cb();
            });
        } else {
            this.push(file);
            cb();
        }
    };

    return through.obj(step1);
}

module.exports = main;