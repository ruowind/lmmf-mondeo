"use strict";

const gulp = require('gulp');
const path = require('path');
const cssSprites = require('../plugin/css-sprites/index');
const cssBuild = require('../plugin/build-css');
const fileDep = require('../plugin/file-dependencies');
const buildHtml = require('../plugin/build-html');
const organizeFiles = require('../plugin/organize-files');
const cssInline = require('../plugin/css-inline');
const cssTask = require('./css');
const serverTask = require('./server');
const Common = require('../common');
const cleanFile = require('../plugin/clean-file');

exports.dev = async(projectConfig) => {
    await cssTask.compile(projectConfig);
    let bs = serverTask.startServer(projectConfig);
    return bs;
};

exports.dist = (projectConfig) => {
    return new Promise((resolve) => {
        let htmlPath = null;

        gulp.src(path.join(projectConfig.path, '/**/*.*'))
            .pipe(cssSprites({
                margin: 1,
                layout: 'matrix',
                cssPath: projectConfig.cssPath,
                imgPath: projectConfig.imgPath,
                support2x: projectConfig.support2x
            }))
            .pipe(cssInline())
            .pipe(fileDep(htmlPath))
            .pipe(cssBuild(projectConfig))
            .pipe(buildHtml(projectConfig))
            .pipe(organizeFiles(projectConfig))
            .pipe(gulp.dest(path.join(projectConfig.path, Common.DIST_PATH)))
            .on('end', () => {
                resolve();
            });
    });
};

exports.cleanDist = (projectConfig) => {
    return new Promise((resolve) => {
        gulp.src(path.join(projectConfig.path, '/dist'))
            .pipe(cleanFile())
            .pipe(gulp.dest(path.join(projectConfig.path, '/dist')))
            .on('end', () => {
                resolve();
            });
    });
};