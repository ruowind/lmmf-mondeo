'use strict';

let CssRules = require('./cssRules');

module.exports = (content) => {
    let _arr_css = [],
        _content;
    let reg = /(?:\/\*[\s\S]*?(?:\*\/|$))|([^\{\}\/]*)\{([^\{\}]*)\}/gi;
    _content = content.replace(reg, function (m, selector, css) {
        if (css) {
            let rules = new CssRules(selector.trim(), css.trim());
            if (rules.isSprites()) {
                _arr_css.push(rules);
                css = rules.getCss();
            }
            return selector + '{' + css + '}';
        }
        return m;
    });
    return {
        content: _content,
        map: _arr_css
    };
};