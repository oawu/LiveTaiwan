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
const pr = Ginkgo.pr;

const FileSystem  = rq('fs');
const Path = rq('path');
const root = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;
const rootDiv = Path.resolve(__dirname, root) + Path.sep;
const cmdDiv = Path.resolve(__dirname, root + 'cmd') + Path.sep;
const gitDiv = Path.resolve(__dirname, root + '.git') + Path.sep;


var mapDir = function(dir, filelist, options) {
  const files = FileSystem.readdirSync(dir);

  filelist = filelist || [];
  files.forEach(function(file) {
    if ([cmdDiv, gitDiv].indexOf(dir + file + Path.sep) !== -1)
      return;

    if (!FileSystem.statSync(dir + file).isDirectory())
      if (
        (!options.includes.length || options.includes.indexOf((dir + file).replace(rootDiv, '')) !== -1) &&
        (!options.formats.length  || options.formats.indexOf('.' + file.split('.').pop().toLowerCase()) !== -1)
      )
        if ((stats = FileSystem.statSync(dir + file)) && (stats.size > 0))
          return filelist.push(dir + file);

    if (FileSystem.statSync(dir + file).isDirectory() && options.recursive)
      filelist = mapDir(dir + file + Path.sep, filelist, options);
  });

  return filelist;
};

var localFilesFunc = function(dirs, closure) {
  let tmps = dirs.map(function(dir) { return mapDir(dir.path, [], dir); }).reduce(function(a, b) { return a.concat(b); });
    
  pr(tmps.length);

  tmps = tmps.map(function(dir) {
    pr();
    return {
      name: dir.replace(rootDiv, ''),
      buffer: FileSystem.readFileSync(dir)
    };
  });

  return pr('') && closure(tmps);
};

module.exports.run = function(dirs, closure) {
  pr(cc('    ➤ ', 'C') + '整理本機內檔案');
  return localFilesFunc(dirs, closure);
};