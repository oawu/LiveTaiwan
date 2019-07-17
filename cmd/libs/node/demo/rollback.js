/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const rq = require;
const Ginkgo = require('../Ginkgo');
const cc = Ginkgo.cc;
const ln = Ginkgo.ln;
const pp = Ginkgo.pp;
const er = Ginkgo.er;
const su = Ginkgo.su;

const Exec = require('child_process').exec;

function checkout(_v) {
  pp((title = cc('    ➤ ', 'r2') + '分支切換回 ' + cc(_v.gitOri.branch, 'w2') + ' 分支') + cc('… ', 'w0'));

  Exec('git checkout ' + _v.gitOri.branch + ' --quiet', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, ['執行指令 ' + cc('git checkout ' + _v.gitOri.branch + ' --quiet', 'w2') + ' 失敗！']);

    return su(title) &&
      pp(ln +
        cc(' '.repeat(54), 'w0', 'r') + ln +
        cc('  上傳失敗！', 'y2', 'r') + cc('請先檢查以上步驟的錯誤原因，再重新執行！  ', 'w2', 'r') + ln +
        cc(' '.repeat(54), 'w0', 'r') + ln + ln) && process.exit(1);
  });
}

function gitClear(_v) {
  pp((title = cc('    ➤ ', 'r2') + '清除恢復修改') + cc('… ', 'w0'));

  Exec('git checkout .. --quiet', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, ['執行指令 ' + cc('git checkout .. --quiet', 'w2') + ' 失敗！']);

    return su(title) && checkout(_v);
  });
}

module.exports.run = function(_v) {
  return pp(cc(' 【退回原本分支】', 'R') + ln) && gitClear(_v);
};