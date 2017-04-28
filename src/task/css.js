'use strict';

let gulp = require('gulp'),
    sourceMaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    sass = require('../plugin/sass'),
    _ = require('lodash'),
    path = require('path');

let compileLess = exports.compileLess = (projectConfig) => {
    return new Promise((resolve) => {
        gulp.src(path.join(projectConfig.path, projectConfig.lessPath, '/**/*.less'))
            .pipe(sourceMaps.init())
            .pipe(less().on('error', (e) => {
                console.error(e.message);
                this.emit('end');
            }))
            .pipe(sourceMaps.write())
            .pipe(gulp.dest(path.join(projectConfig.path, projectConfig.cssPath)))
            .on('end', () => {
                resolve();
            });
    });
};

let compileSass = exports.compileSass = (projectConfig) => {
    return new Promise((resolve) => {
        gulp.src(path.join(projectConfig.path, projectConfig.sassPath, '/**/*.?(scss|sass)'))
            .pipe(sourceMaps.init())
            .pipe(sass().on('error', (e) => {
                console.error(e.message);
                this.emit('end');
            }))
            .pipe(sourceMaps.write())
            .pipe(gulp.dest(path.join(projectConfig.path, projectConfig.cssPath)))
            .on('end', () => {
                resolve();
            });
    });
};

exports.compile = async(projectConfig) => {
    await compileLess(projectConfig);
    await compileSass(projectConfig);
};

exports.compileOne = (src, projectConfig, bs) => {
    let fileType = _.trimStart(path.extname(src), '.');
    switch (fileType) {
        case 'css':
            gulp.src(src)
                .pipe(bs.stream());
            break;
        case 'less':
            gulp.src(src)
                .pipe(sourceMaps.init())
                .pipe(less().on('error', (e) => {
                    console.error(e.message);
                    this.emit('end');
                }))
                .pipe(sourceMaps.write())
                .pipe(gulp.dest(path.join(projectConfig.path, projectConfig.cssPath)))
            break;
        case 'scss':
        case 'sass':
            gulp.src(src)
                .pipe(sourceMaps.init())
                .pipe(sass().on('error', (e) => {
                    console.error(e.message);
                    this.emit('end');
                }))
                .pipe(sourceMaps.write())
                .pipe(gulp.dest(path.join(projectConfig.path, projectConfig.cssPath)))
            break;
    }
};