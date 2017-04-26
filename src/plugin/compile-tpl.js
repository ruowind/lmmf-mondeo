'use strict';

let through = require('through2'),
    gutil = require('gulp-util'),
    path = require('path'),
    html2js = require('html2js'),
    PluginError = gutil.PluginError;

let PLUGIN_NAME = 'gulp-build-tpl';

function getModuleName(file, base) {
    let basePath = path.resolve(file.cwd, base);
    let moduleName = path.relative(basePath, file.path);
    let index = moduleName.lastIndexOf('.');
    return moduleName.substr(0, index).replace(/\\/g, '/') + '-tpl';
}

function main(config) {
    config = config ? config : {};
    config.base || (config.base = __dirname);

    let step1 = function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }
        let fileString = String(file.contents);

        let tpl = html2js(fileString, {
            mode: 'format',
            wrap: false
        });

        let moduleName = getModuleName(file, config.base);
        fileString = 'lmmf.add(\'' + moduleName + '\',function(){return ' + tpl + '});';

        let index = file.path.lastIndexOf('.');
        file.path = file.path.substr(0, index) + '-tpl.js';
        file.contents = new Buffer(fileString);

        this.push(file);
        cb();
    };

    return through.obj(step1);
}

module.exports = main;