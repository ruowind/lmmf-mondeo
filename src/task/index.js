"use strict";

let cssTask = require('./css');

exports.dev = async(projectPath, cb) => {
    await cssTask.compileLess(projectPath, cb);
    await cssTask.compileSass(projectPath, cb);
};