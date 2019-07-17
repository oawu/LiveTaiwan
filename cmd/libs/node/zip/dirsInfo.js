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
const su = Ginkgo.su;
const qq = Ginkgo.qq;

const jsYaml = rq('js-yaml');
const FileSystem  = rq('fs');

const Path = rq('path');
const root = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;
const dirsFilePath = Path.resolve(__dirname, root + 'cmd' + Path.sep + '_dirs.yaml');
const sepRegExp = new RegExp(qq('^' + Path.sep.replace('/', '\/') + '*|' + Path.sep.replace('/', '\/') + '*$'), 'g');
const rootDiv = Path.resolve(__dirname, root) + Path.sep;

var check = function(closure) {
  pp((title = cc('    ➤ ', 'C') + '檢查 ' + cc('_dirs.yaml', 'w2') + ' 是否存在') + cc('… ', 'w0'));

  FileSystem.exists(dirsFilePath, function(exists) {
    return !exists ?
      er(title, ['錯誤原因：' + cc('cmd/_dirs.yaml', 'w2') + ' 不存在！']) :
      su(title) && closure();
  });
};

var read = function(closure) {
  pp((title = cc('    ➤ ', 'C') + '讀取 ' + cc('_dirs.yaml', 'w2') + ' 檔案內容') + cc('… ', 'w0'));
  FileSystem.readFile('_dirs.yaml', 'utf8', function(err, data) {
    return err ?
      er(title, ['錯誤原因：' + cc(err, 'w2')]) :
      su(title) && closure(data);
  });
};

var yaml = function(data, closure) {
  pp((title = cc('    ➤ ', 'C') + '轉換 ' + cc('_dirs.yaml', 'w2') + ' 檔案內容') + cc('… ', 'w0'));

  try {
    data = jsYaml.safeLoad(data);
    data = Array.isArray(data) ? data : [];
    data = data.map(function(t) {
      if (typeof t.path === 'undefined')
        return null;

      t.path = t.path.replace(sepRegExp, '');
      t.path = Path.resolve(__dirname, root + t.path.replace(sepRegExp, '')) + Path.sep;

      if (!FileSystem.existsSync(t.path))
        return null;

      t = Object.assign({formats: [], recursive: false, hidden: false, includes: []}, t);
      t.formats = Array.isArray(t.formats) ? t.formats : [];
      t.includes = Array.isArray(t.includes) ? t.includes : [];
      t.recursive = t.recursive.toLowerCase() === 'yes' ? true: false;
      t.hidden = t.hidden.toLowerCase() === 'yes' ? true: false;
      t.includes = t.includes.map(function(t) { return t.replace(sepRegExp, ''); });
      t.formats = t.formats.map(function(t) { return t.toLowerCase(); });

      return t;
    }).filter(function(t) {
      return t !== null;
    });
    return su(title) && closure(data);
  } catch (err) {
    return er(title, ['錯誤原因：' + cc(err, 'w2')]);
  }
};

module.exports.run = function(closure) {
  return check(function() {
    read(function(data) {
      yaml(data, function(data) {
        return closure(data);
      });
    });
  });
};