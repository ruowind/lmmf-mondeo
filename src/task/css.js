'use strict';

let gulp = require('gulp'),
    sourceMaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    // browserSync = require('./server').browserSync,
    // runSequence = require('../lib/run-sequence'),
    sass = require('../plugin/sass'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

let compileLess = exports.compileLess = (projectPath) => {
    return new Promise((resolve) => {
        gulp.src(path.join(projectPath, './less/**/*.less'))
            .pipe(sourceMaps.init())
            .pipe(less().on('error', (e) => {
                console.error(e.message);
                this.emit('end');
            }))
            .pipe(sourceMaps.write())
            .pipe(gulp.dest(path.join(projectPath, './css')))
            .on('end', () => {
                resolve();
            });
    })
};

let compileSass = exports.compileSass = (projectPath) => {
    return new Promise((resolve) => {
        gulp.src(path.join(projectPath, './sass/**/*.?(scss|sass)'))
            .pipe(sourceMaps.init())
            .pipe(sass().on('error', (e) => {
                console.error(e.message);
                this.emit('end');
            }))
            .pipe(sourceMaps.write())
            .pipe(gulp.dest(path.join(projectPath, './css')))
            .on('end', () => {
                resolve();
            });
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