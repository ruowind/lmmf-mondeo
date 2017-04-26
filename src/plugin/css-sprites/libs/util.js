'use strict';

/**
 * get the string surrounded by single or double quotes
 * @param {String} str target srting.
 * @return {Object}
 */
exports.stringQuote = (str) => {
    let info = {
        origin: str,
        rest: str = str.trim(),
        quote: ''
    };
    if (str) {
        let quotes = '\'"';
        let strLen = str.length - 1;
        for (let i = 0, len = quotes.length; i < len; i++) {
            let c = quotes[i];
            if (str[0] === c && str[strLen] === c) {
                info.quote = c;
                info.rest = str.substring(1, strLen);
                break;
            }
        }
    }
    return info;
};

/**
 * path处理，提取path中rest部分(?之前)、query部分(?#之间)、hash部分(#之后)
 * @param  {String} str 待处理的url
 * @return {Object}
 */
exports.queryUrl = (str) => {
    let rest = str,
        pos = rest.indexOf('#'),
        hash = '',
        query = '';
    if (pos > -1) {
        hash = rest.substring(pos);
        rest = rest.substring(0, pos);
    }
    pos = rest.indexOf('?');
    if (pos > -1) {
        query = rest.substring(pos);
        rest = rest.substring(0, pos);
    }
    rest = rest.replace(/\\/g, '/');
    if (rest !== '/') {
        // 排除由于.造成路径查找时因filename为""而产生bug，以及隐藏文件问题
        rest = rest.replace(/\/\.?$/, '');
    }
    return {
        origin: str,
        rest: rest,
        hash: hash,
        query: query
    };
};

/**
 * 对象枚举元素遍历，若merge为true则进行_.assign(obj, callback)，若为false则回调元素的key value index
 * @param  {Object}   obj      源对象
 * @param  {Function|Object} callback 回调函数|目标对象
 */
exports.map = (obj, callback) => {
    let index = 0;
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (callback(key, obj[key], index++)) {
                break;
            }
        }
    }
};