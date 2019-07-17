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
const qu = Ginkgo.qu;

function minify(_v, closure) {
  pp(ln + cc(' 【是否壓縮】', 'y') + ln);
  pp(cc(_v.cho.minify === true  ? ' ➜' : '  ', 'g1') + cc('  1. 要！我要將一切壓縮', _v.cho.minify === true  ? 'g2' : undefined) + cc(' - Yes, compress them',      _v.cho.minify === true  ? 'g0' : 'w0') + ln);
  pp(cc(_v.cho.minify === false ? ' ➜' : '  ', 'g1') + cc('  2. 不要，我要保持原樣', _v.cho.minify === false ? 'g2' : undefined) + cc(' - No, keep them original',  _v.cho.minify === false ? 'g0' : 'w0') + ln);

  const switcher = function(c) {
    _v.cho.minify = c == '1' ? true : false;
    return closure(_v.cho);
  };

  if (_v.cho.minify === true || _v.cho.minify === false) {
    switcher(_v.cho.minify ? '1' : '2');
  } else {
    pp(ln);
    qu(['1', '2'], switcher);
  }
}

module.exports.run = function(_v, closure) {
  pp(ln + cc(' 【選擇目標】', 'y') + ln);
  pp(cc(_v.cho.goal == 'gh-pages' ? ' ➜' : '  ', 'g1') + cc('  1. GitHub Pages', _v.cho.goal == 'gh-pages' ? 'g2' : undefined) + cc(' - ' + 'gh-pages branch',        _v.cho.goal == 'gh-pages' ? 'g0' : 'w0') + ln);
  pp(cc(_v.cho.goal == 'aws-s3'   ? ' ➜' : '  ', 'g1') + cc('  2. Amazon S3   ', _v.cho.goal == 'aws-s3'   ? 'g2' : undefined) + cc(' - ' + 'Simple Storage Service', _v.cho.goal == 'aws-s3'   ? 'g0' : 'w0') + ln);

  const switcher = function(c) {
    _v.cho.goal = c == '1' ? 'gh-pages' : 'aws-s3';
    return minify(_v, closure);
  };

  if (['gh-pages', 'aws-s3'].indexOf(_v.cho.goal) !== -1) {
    switcher(_v.cho.goal == 'gh-pages' ? '1' : '2');
  } else {
    pp(ln);
    qu(['1', '2'], switcher);
  }
};