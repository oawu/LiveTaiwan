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

const Exec = rq('child_process').exec;

module.exports.run = function(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '分支切換回 ' + cc(_v.gitOri.branch, 'w2') + ' 分支') + cc('… ', 'w0'));

  Exec('git checkout ' + _v.gitOri.branch + ' --quiet', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, ['執行指令 ' + cc('git checkout ' + _v.gitOri.branch + ' --quiet', 'w2') + ' 失敗！']);

    return su(title) && closure();
  });
};