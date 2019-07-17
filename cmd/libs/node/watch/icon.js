/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const rq = require;
const Ginkgo = rq('../Ginkgo');
const cc = Ginkgo.cc;
const ln = Ginkgo.ln;
const pp = Ginkgo.pp;
const er = Ginkgo.er;
const nt = Ginkgo.nt;
const su = Ginkgo.su;
const wp = Ginkgo.wp;

const Chokidar  = rq('chokidar');
const FileSystem  = rq('fs');
const Path = rq('path');

function parseData(name, data) {
  data = data.match(/\.icon-[a-zA-Z_\-0-9]*:before\s?\{\s*content:\s*"[\\A-Za-z0-9]*";(\s*color:\s*#[A-Za-z0-9]*;)?\s*}/g);
  data = Array.isArray(data) ? data.map(function(v) { return v.replace(/^\.icon-/g, '.icon-' + (name ? name + '-' : '')).replace(/\n/g, ' ').replace(/\{\s*/g, '{ '); }) : [];
  data = '//\n// @author      OA Wu <comdan66@gmail.com>\n// @copyright   Copyright (c) 2015 - 2019, Ginkgo\n// @license     http://opensource.org/licenses/MIT  MIT License\n// @link        https://www.ioa.tw/\n//\n\n' + (data.length ? '@import "compass/css3/font-face";\n\n@include font-face("icon' + (name ? '-' + name : '') + '", font-files(\n  "' + (name ? name : 'icomoon') + '/fonts/icomoon.eot",\n  "' + (name ? name : 'icomoon') + '/fonts/icomoon.woff",\n  "' + (name ? name : 'icomoon') + '/fonts/icomoon.ttf",\n  "' + (name ? name : 'icomoon') + '/fonts/icomoon.svg"));\n\n*[class^="icon' + (name ? '-' + name : '') +'-"]:before, *[class*=" icon' + (name ? '-' + name : '') +'-"]:before {\n  font-family: "icon' + (name ? '-' + name : '') + '";\n\n  speak: none;\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n}\n\n' + data.join(ln) : '@import "compass/css3/font-face";');
  return data;
}

function build(_v, event, path, dir) {
  const name = dir === 'icomoon' ? false : dir;
  const title = cc('    ➤ ', 'c2') + cc('[Icon Fonts] ', 'P') + cc(event, 'w') + ' ' + cc(dir, 'w2') + ' 目錄';

  if (event == '刪除') {
    return FileSystem.exists(path = Path.resolve(__dirname, _v.divs.scss + 'icon' + (name ? '-' + name : '') + '.scss'), function(exists) {
      if (!exists)
        return _v.font.isReady &&
        su(title);

      FileSystem.unlink(path, function(err) {
        if (err)
          return _v.font.isReady &&
            nt('[Icon Fonts] 錯誤！', '檔案無法刪除', '請至終端機確認錯誤原因！') &&
            er(title, ['錯誤原因：' + cc(err, 'w2')]);
                 
        return _v.font.isReady &&
          su(title);
      });
    });
  }
  
  FileSystem.readFile(path, 'utf8', function(err, data) {
    if (err)
      return _v.font.isReady &&
        nt('[Icon Fonts] 錯誤！', '檔案無法讀取', '請至終端機確認錯誤原因！') &&
        er(title, ['錯誤原因：' + cc(err, 'w2')]);

    FileSystem.writeFile(Path.resolve(__dirname, _v.divs.scss + 'icon' + (name ? '-' + name : '') + '.scss'), parseData(name,data), function(err) {
      if (err)
        return _v.font.isReady &&
          nt('[Icon Fonts] 錯誤！', '檔案無法寫入', '請至終端機確認錯誤原因！') &&
          er(title, ['錯誤原因：' + cc(err, 'w2')]);

      return _v.font.isReady &&
        su(title);
    });
  });
}
module.exports.run = function(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '監控 Font 目錄') + cc('… ', 'w0'));

  Chokidar.watch(wp(_v.divs.font))
    .on('change', function(path) {
      const token = path.replace(_v.divs.font, '').split(Path.sep).map(Function.prototype.call, String.prototype.trim).filter(function(v) { return v.length; });
      return token.length == 2 && token[1] == 'style.css' && build(_v, '修改', path, token[0]);
    })
    .on('add', function(path) {
      const token = path.replace(_v.divs.font, '').split(Path.sep).map(Function.prototype.call, String.prototype.trim).filter(function(v) { return v.length; });
      return token.length == 2 && token[1] == 'style.css' && build(_v, '新增', path, token[0]);
    })
    .on('unlink', function(path) {
      const token = path.replace(_v.divs.font, '').split(Path.sep).map(Function.prototype.call, String.prototype.trim).filter(function(v) { return v.length; });
      return token.length == 2 && token[1] == 'style.css' && build(_v, '刪除', path, token[0]);
    })
    .on('error', function(err) {
      return nt('[監控 Font 目錄] 警告！', '監控 Font 目錄發生錯誤', '請至終端機確認錯誤原因！') &&
        er(title, ['錯誤原因：' + cc('err', 'w2')]) &&
        closure();
    })
    .on('ready', function() {
      _v.font.isListen = true;
      setTimeout(function() { _v.font.isReady = true; }, _v.font.timer);
      return su(title) &&
        closure();
    });
};