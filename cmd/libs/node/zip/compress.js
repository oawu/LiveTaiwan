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
const AdmZip = rq('adm-zip');

module.exports.run = function(path, dirs, closure) {
  pr(cc('    ➤ ', 'C') + '壓縮檔案');
    
  const zip = new AdmZip();

  dirs.forEach(function(dir) {
    return pr() && zip.addFile(dir.name, dir.buffer);
  });

  zip.writeZip(path);
  return pr('') && closure(path);
};