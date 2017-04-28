'use strict';

let gulp = require('gulp'),
    conf = require('../lib/config'),
    path = require('path'),
    cssSprites = require('../plugin/css-sprites/index'),
    cssBuild = require('../plugin/build-css'),
    fileDep = require('../plugin/file-dependencies'),
    buildHtml = require('../plugin/build-html'),
    organizeFiles = require('../plugin/organize-files'),
    cssInline = require('../plugin/css-inline');

exports.dist = (cb) => {
    let htmlPath = null;

    gulp.src(conf.config.src.dir + '/**/*.*')
        .pipe(cssSprites({
            margin: 1,
            layout: 'matrix'
        }))
        .pipe(cssInline())
        .pipe(fileDep(htmlPath))
        .pipe(cssBuild())
        .pipe(buildHtml())
        .pipe(organizeFiles())
        .pipe(gulp.dest(conf.config.dist.dir))
        .on('end', () => {
            cb();
        });
};

exports.distHtml2Svn = (cb) => {
    gulp.src(conf.config.dist.html + '/**/*.html')
        .pipe(gulp.dest(conf.config.svn.html))
        .on('end', () => {
            cb();
        });
};

exports.distPic2Pic = (cb) => {
    gulp.src(conf.config.dist.pic + '/**/*.*')
        .pipe(gulp.dest(conf.config.svn.pic))
        .on('end', () => {
            cb();
        });
};