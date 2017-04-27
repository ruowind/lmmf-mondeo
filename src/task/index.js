"use strict";

const cssTask = require('./css');
const serverTask = require('./server');

exports.dev = async(projectConfig) => {
    await cssTask.compile(projectConfig);
    let bs = serverTask.startServer(projectConfig);
    return bs;
};