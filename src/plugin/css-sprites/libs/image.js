'use strict';
// let Image = require('images'),
let path = require('path'),
    util = require('./util'),
    // conf = require('../../../lib/config'),
    Packer = require('./pack');
let lwip=require('node-lwip');
// function Generator(cssFile, cssRules, pipeLine, settings) {

//     let default_settings = {
//         'margin': 3,
//         'width_limit': 10240,
//         'height_limit': 10240,
//         'layout': 'linear',
//         'ie_bug_fix': true
//     };

//     util.map(default_settings, function (key, value) {
//         if (settings[key]) {
//             if ((typeof value) === 'number') {
//                 settings[key] = parseFloat(settings[key]);
//             }
//         } else {
//             settings[key] = value;
//         }
//     });

//     //如果layout不支持的类型，默认为linear
//     let layouts = ['matrix', 'linear'];
//     if (layouts.indexOf(settings.layout) === -1) {
//         settings.layout = 'linear';
//     }

//     //设置宽高限制
//     Image.setLimit(settings.width_limit, settings.height_limit);
//     let that = this;
//     this.cssFile = cssFile;
//     this.settings = settings;
//     this.css = '';
//     this.pipeLine = pipeLine;

//     let list_ = {};
//     let scales = {};

//     function getImage(imgUrl) {
//         return path.resolve(path.dirname(cssFile.path), imgUrl);
//     }

//     function insertToObject(o, key, elm) {
//         if (o[key]) {
//             o[key].push(elm);
//         } else {
//             o[key] = [elm];
//         }
//     }

//     util.map(cssRules, function (k, bg) {
//         let image_ = Image(getImage(bg.getImageUrl()));
//         let direct = bg.getDirect();

//         bg.image_ = image_;

//         let scale_ = bg.size[0] / image_.size().width;

//         if (bg.size[0] !== -1 && scale_ !== settings.scale) {
//             scale_ = '' + scale_;
//             //不支持x, y
//             if (direct === 'z') {
//                 if (scales[scale_]) {
//                     insertToObject(scales[scale_], direct, bg);
//                 } else {
//                     scales[scale_] = {};
//                     insertToObject(scales[scale_], direct, bg);
//                 }
//             }
//         } else {
//             insertToObject(list_, direct, bg);
//         }
//     });

//     this.fill(list_['x'], 'x');
//     this.fill(list_['y'], 'y');
//     this.zFill(list_['z'], settings.scale);

//     //background-size
//     util.map(scales, function (s, l) {
//         s = parseFloat(s);
//         that.zFill(l['z'], s);
//     });
// }

// Generator.prototype = {
//     _imageExist: function (images, url) {
//         for (let i = 0, len = images.length; i < len; i++) {
//             if (url === images[i].url) {
//                 return i;
//             }
//         }
//         return false;
//     },
//     after: function (image, arr_selector, direct, scale) {
//         let ext = './sprite_' + direct + '.png';
//         let size = image.size();

//         if (scale) {
//             ext = '_' + scale + '/sprite' + ext;
//         }

//         let image_file = this.cssFile.clone();

//         let imgRelativePath = path.relative(path.resolve(image_file.cwd, conf.config.src.css), image_file.path);
//         let imgPath = path.resolve(path.resolve(image_file.cwd, conf.config.src.img), imgRelativePath);

//         image_file.path = path.resolve(imgPath.substr(0, imgPath.lastIndexOf('.')), ext);
//         image_file.contents = image.encode('png');

//         function unique(arr) {
//             let map = {};
//             return arr.filter(function (item) {
//                 return map.hasOwnProperty(item) ? false : map[item] = true;
//             });
//         }

//         let imageUrl = path.relative(path.dirname(this.cssFile.path), image_file.path).replace(/\\/g, '/');

//         if (this.settings.ie_bug_fix) {
//             let MAX = this.settings.max_selectores || 30; //max 36
//             arr_selector = unique(arr_selector.join(',').split(','));
//             let len = arr_selector.length;
//             let n = Math.ceil(len / MAX);

//             for (let i = 0; i < n; i++) {
//                 let step = i * MAX;
//                 this.css += arr_selector.slice(step, step + MAX).join(',') +
//                     '{' +
//                     (scale ? 'background-size: ' + (size.width * scale) + 'px ' + (size.height * scale) + 'px;' : '') +
//                     'background-image: url(' + imageUrl + ')}';
//             }
//         } else {
//             this.css += unique(arr_selector.join(',').split(',')).join(',') +
//                 '{' +
//                 (scale ? 'background-size: ' + (size.width * scale) + 'px ' + (size.height * scale) + 'px;' : '') +
//                 'background-image: url(' + imageUrl + ')}';
//         }

//         this.pipeLine.push(image_file);

//     },
//     z_pack: new Packer(),
//     fill: function (list, direct) {
//         if (!list || list.length === 0) {
//             return;
//         }
//         let max = 0;
//         let images = [];
//         //宽度或者高的和
//         let total = 0;
//         let parsed = [];
//         let i, k, len, count, op_max;

//         for (i = 0, k = -1, len = list.length; i < len; i++) {
//             if (parsed.indexOf(list[i].getImageUrl()) === -1) {
//                 parsed.push(list[i].getImageUrl());
//                 k++;
//                 let img = list[i].image_;
//                 let size = img.size();
//                 images[k] = {
//                     url: list[i].getImageUrl(),
//                     cls: [],
//                     image: img,
//                     width: size.width,
//                     height: size.height
//                 };
//                 images[k].cls.push({
//                     selector: list[i].getId(),
//                     position: list[i].getPosition()
//                 });
//                 //如果是repeat-x的，记录最大宽度；如果是repeat-y的，记录最大高度
//                 op_max = (direct === 'x') ? size.width : size.height;
//                 if (op_max > max) {
//                     max = op_max;
//                 }
//                 //如果是repeat-x的，计算高度和；如果是repeat-y的，计算宽度和
//                 total += (direct === 'x' ? size.height : size.width) + this.settings.margin;
//             } else {
//                 let key = this._imageExist(images, list[i].getImageUrl());
//                 images[key].cls.push({
//                     selector: list[i].getId(),
//                     position: list[i].getPosition()
//                 });
//             }
//         }

//         if (images.length === 0) {
//             return;
//         }

//         //减掉多加的一次margin
//         total -= this.settings.margin;
//         let height = direct === 'x' ? total : max;
//         let width = direct === 'x' ? max : total;
//         let image = Image(width, height);

//         let x = 0,
//             y = 0,
//             cls = [];
//         for (i = 0, len = images.length; i < len; i++) {
//             image.draw(images[i].image, x, y);

//             if (direct === 'y' && images[i].height < max) {
//                 //如果高度小于最大高度，则在Y轴平铺当前图
//                 for (k = 0, count = max / images[i].height; k < count; k++) {
//                     image.draw(images[i].image, x, images[i].height * (k + 1));
//                 }
//             } else if (direct === 'x' && images[i].width < max) {
//                 //如果宽度小于最大宽度，则在X轴方向平铺当前图
//                 for (k = 0, count = max / images[i].width; k < count; k++) {
//                     image.draw(images[i].image, images[i].width * (k + 1), y);
//                 }
//             }
//             for (k = 0, count = images[i].cls.length; k < count; k++) {
//                 this.css += images[i].cls[k].selector + '{background-position:' +
//                     (images[i].cls[k].position[0] + -x) + 'px ' +
//                     (images[i].cls[k].position[1] + -y) + 'px}';
//                 cls.push(images[i].cls[k].selector);
//             }
//             if (direct === 'x') {
//                 y += images[i].height + this.settings.margin;
//             } else {
//                 x += images[i].width + this.settings.margin;
//             }
//         }

//         this.after(image, cls, direct, null);
//     },
//     zFill: function (list, scale) {
//         let y_;
//         if (!list || list.length === 0) {
//             return;
//         }
//         let i, k, k0, length, images = [
//                 [],
//                 []
//             ],
//             parsed = [
//                 [],
//                 []
//             ],
//             max = [0, 0],
//             total = [0, 0];
//         for (i = 0, k = [-1, -1], length = list.length; i < length; i++) {
//             let item = list[i];
//             // 如果默认是linear，type全都设为left
//             if (this.settings.layout === 'linear') {
//                 item.setType('left');
//             }

//             if (item.getType() === 'left') {
//                 k0 = 0;
//             } else {
//                 k0 = 1;
//             }
//             if (parsed[k0].indexOf(item.getImageUrl()) === -1) {
//                 parsed[k0].push(item.getImageUrl());
//                 let img = item.image_;
//                 let size = img.size();
//                 if (item.getType() === 'left') {
//                     //计算最大宽度
//                     if (size.width > max[k0]) {
//                         max[k0] = size.width;
//                     }
//                     total[k0] += size.height + this.settings.margin;
//                 }
//                 k[k0]++;
//                 images[k0][k[k0]] = {
//                     url: item.getImageUrl(),
//                     cls: [],
//                     image: img,
//                     w: size.width + this.settings.margin,
//                     h: size.height + this.settings.margin
//                 };
//                 if (k0 === 0) {
//                     //left合并为一竖行，不需要在宽度上加margin
//                     images[k0][k[k0]].w -= this.settings.margin;
//                 }
//                 images[k0][k[k0]].cls.push({
//                     selector: list[i].getId(),
//                     position: list[i].getPosition()
//                 });
//             } else {
//                 let key = this._imageExist(images[k0], item.getImageUrl());
//                 images[k0][key].cls.push({
//                     selector: list[i].getId(),
//                     position: list[i].getPosition()
//                 });
//             }
//         }

//         let left = 0,
//             zero = 1;
//         if (images[zero].length === 0 &&
//             images[left].length === 0) {
//             return;
//         }
//         if (images[zero]) {
//             let zero_root;
//             //高度从大到小排序
//             images[zero].sort(function (a, b) {
//                 return -(a.h - b.h);
//             });
//             this.z_pack.fit(images[zero]);
//             zero_root = this.z_pack.getRoot();
//             max[zero] = zero_root.w;
//             total[zero] = zero_root.h;
//         }
//         let height = 0;
//         for (i = 0, length = total.length; i < length; i++) {
//             if (total[i] > height) {
//                 height = total[i];
//             }
//         }

//         //减掉多加了一次的margin
//         height = height - this.settings.margin;
//         //left, zero
//         //zero | left
//         let image = Image(max[left] + max[zero], height),
//             x = 0,
//             y = 0,
//             j = 0,
//             cls = [],
//             count = 0,
//             current;
//         if (images[zero]) {
//             for (i = 0, length = images[zero].length; i < length; i++) {
//                 current = images[zero][i];
//                 x = current.fit.x;
//                 y = current.fit.y;

//                 image.draw(Image(current.image), x, y);
//                 for (j = 0, count = current.cls.length; j < count; j++) {
//                     let x_ = current.cls[j].position[0] + -x;
//                     let y_ = current.cls[j].position[1] + -y;
//                     if (scale) {
//                         x_ = x_ * scale;
//                         y_ = y_ * scale;
//                     }

//                     this.css += current.cls[j].selector + '{background-position:' +
//                         x_ + 'px ' +
//                         y_ + 'px}';
//                     cls.push(current.cls[j].selector);
//                 }
//             }
//         }

//         if (images[left]) {
//             y = 0;
//             for (i = 0, length = images[left].length; i < length; i++) {
//                 current = images[left][i];
//                 x = max[zero] + max[left] - current.w;
//                 image.draw(Image(current.image), x, y);
//                 for (j = 0, count = current.cls.length; j < count; j++) {
//                     let x_;
//                     y_ = (current.cls[j].position[1] + -y) + 'px';
//                     if (scale) {
//                         y_ = ((current.cls[j].position[1] + -y) * scale) + 'px';
//                     }

//                     if (current.cls[j].position[0] === 'right') {
//                         x_ = 'right ';
//                     } else {
//                         x_ = -x + current.cls[j].position[0];
//                         if (scale) {
//                             x_ = x_ * scale;
//                         }
//                         x_ = x_ + 'px ';
//                     }

//                     this.css += current.cls[j].selector + '{background-position:' +
//                         x_ +
//                         y_ + '}';
//                     cls.push(current.cls[j].selector);
//                 }
//                 y += current.h;
//             }
//         }
//         this.after(image, cls, 'z', scale);
//     }
// };

// module.exports = function (cssFile, cssRules, pipeLine, settings) {
//     let gen = new Generator(cssFile, cssRules, pipeLine, settings);
//     return gen.css;
// };