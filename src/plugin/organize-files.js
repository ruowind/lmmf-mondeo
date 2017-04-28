'use strict';

let gutil = require('gulp-util'),
    path = require('path'),
    through = require('through2'),
    PluginError = gutil.PluginError,
    PLUGIN_NAME = 'organize-files';

function main(config) {
    let step1 = function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        // if (path.extname(file.path) !== '.html') {
        //     let a = file.cwd;
        //     let b = 1;
        //     // let a = path.relative(path.resolve(file.cwd, conf.config.src.dir), file.path);
        //     // file.path = path.resolve(file.cwd, conf.config.dist.pic, a);
        // }
        let relativePath = path.relative(file.base, file.path);
        switch (path.extname(file.path)) {
            case '.html':
                file.path = path.join(file.base, '/html/', relativePath);
                break;
            case '.css':
                file.path = path.join(file.base, '/static/styles/', config.projectPath + '/', path.relative(config.cssPath, relativePath));
                break;
            case '.js':
                file.path = path.join(file.base, '/static/js/', config.projectPath + '/', path.relative(config.jsPath, relativePath));
                break;
            default:
                file.path = path.join(file.base, '/static/img/', config.projectPath + '/', path.relative(config.imgPath, relativePath));
                break;
        }

        this.push(file);
        cb();
    };

    return through.obj(step1);
}

module.exports = main;