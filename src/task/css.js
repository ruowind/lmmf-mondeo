'use strict';

let gulp = require('gulp'),
    conf = require('../lib/config'),
    sourceMaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    sass = require('gulp-sass'),
    browserSync = require('./server').browserSync,
    runSequence = require('../lib/run-sequence'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

let compileLess = () => {
    return new Promise((resolve) => {
        gulp.src(conf.config.src.pic + '/**/*.less')
            .pipe(sourceMaps.init())
            .pipe(less().on('error', (e) => {
                console.error(e.message);
                this.emit('end');
            }))
            .pipe(sourceMaps.write())
            .pipe(gulp.dest(conf.config.src.pic))
            .on('end', () => {
                resolve();
            });
    });
};

let compileSass = (cb) => {
    gulp.src(conf.config.pic + '/**/*.?(scss|sass)')
        .pipe(sourceMaps.init())
        .pipe(sass().on('error', (e) => {
            console.error(e.message);
            this.emit('end');
        }))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(conf.config.src.pic))
        .on('end', () => {
            cb();
        });
};

exports.compile = (cb) => {
    runSequence([compileLess, compileSass]).done(() => {
        cb();
    });
};

exports.compileOne = (src, dest) => {
    let fileType = _.trimStart(path.extname(src), '.');
    switch (fileType) {
        case 'css':
            let cssPathNoExt = _.trimEnd(path.resolve(conf.cwd, src), 'css');
            if (!fs.existsSync(cssPathNoExt + 'less') && !fs.existsSync(cssPathNoExt + 'scss')) {
                gulp.src(src)
                    .pipe(gulp.dest(dest))
                    .pipe(browserSync.stream());
            }
            break;
        case 'less':
            gulp.src(src)
                .pipe(sourceMaps.init())
                .pipe(less().on('error', (e) => {
                    console.error(e.message);
                    this.emit('end');
                }))
                .pipe(sourceMaps.write())
                .pipe(gulp.dest(dest))
                .pipe(browserSync.stream());
            break;
        case 'scss':
            gulp.src(src)
                .pipe(sourceMaps.init())
                .pipe(sass().on('error', (e) => {
                    console.error(e.message);
                    this.emit('end');
                }))
                .pipe(sourceMaps.write())
                .pipe(gulp.dest(dest))
                .pipe(browserSync.stream());
            break;
    }
};