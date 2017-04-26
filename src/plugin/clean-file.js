'use strict';

let rimraf = require('rimraf'),
    through2 = require('through2'),
    gutil = require('gulp-util'),
    path = require('path');

module.exports = function (options) {
    return through2.obj(function (file, enc, cb) {
        // Paths are resolved by gulp
        let filepath = file.path;
        let cwd = file.cwd;
        let relative = path.relative(cwd, filepath);

        // Prevent mistakes with paths
        if (!(relative.substr(0, 2) === '..') && relative !== '' || (options ? (options.force && typeof options.force === 'boolean') : false)) {
            rimraf(filepath, function (error) {
                if (error) {
                    this.emit('error', new gutil.PluginError('clean-file', 'Unable to delete "' + filepath + '" file (' + error.message + ').'));
                }
                cb();
            }.bind(this));
        } else if (relative === '') {
            let msgCurrent = 'Cannot delete current working directory. (' + filepath + '). Use option force.';
            gutil.log('clean-file: ' + msgCurrent);
            this.emit('error', new gutil.PluginError('clean-file', msgCurrent));
            cb();
        } else {
            let msgOutside = 'Cannot delete files outside the current working directory. (' + filepath + '). Use option force.';
            gutil.log('clean-file: ' + msgOutside);
            this.emit('error', new gutil.PluginError('clean-file', msgOutside));
            cb();
        }
    });
};