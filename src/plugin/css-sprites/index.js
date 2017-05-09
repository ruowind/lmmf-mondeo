'use strict';

let through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    imgGen = require('./libs/image'),
    path = require('path'),
    cssParser = require('./libs/cssParser'),
    cssbeautify = require('cssbeautify'),
    PLUGIN_NAME = 'css-sprites';

function main(config) {
    let step1 = async function (file, enc, cb) {
        config = config ? config : {};
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }
        if (path.extname(file.path) === '.css') {
            let fileString = String(file.contents);
            // remove sourcemap
            let index = fileString.indexOf('/*# sourceMappingURL=data:application/json;charset=utf8;base64,');
            if (index > 0) {
                fileString = fileString.substr(0, index - 1);
            }

            let res = cssParser(fileString);

            let spritesCss = await imgGen(file, res.map, this, config);
            let allCss = cssbeautify(res.content + spritesCss);
            file.contents = new Buffer(allCss);
        }
        this.push(file);
        cb();
    };

    return through.obj(step1);
}

module.exports = main;