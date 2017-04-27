'use strict';

module.exports = (tasks) => {
    let that = this;
    let length = tasks.length;
    let doneCb = () => {
    };
    if (length === 0) {
        return;
    }
    let index = -1;
    let cb = () => {
        if (index < length - 1) {
            index++;
            let exe = tasks[index];
            exe.call(that, cb);
        } else {
            doneCb.call(that);
        }
    };
    cb();
    return {
        done: (cb) => {
            cb && (doneCb = cb);
        }
    };
};