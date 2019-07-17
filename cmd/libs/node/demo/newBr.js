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

function checkoutBr(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '分支切換至 ' + cc(_v.cho.goal, 'w2') + ' 分支') + cc('… ', 'w0'));

  Exec('git checkout ' + _v.cho.goal + ' --quiet', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, ['執行指令 ' + cc('git checkout ' + _v.cho.goal + ' --quiet', 'w2') + ' 失敗！']);

    return su(title) && closure(_v.cho);
  });
}

function createBr(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '新增本地端 ' + cc(_v.cho.goal, 'w2') + ' 分支') + cc('… ', 'w0'));
  
  Exec('git branch --verbose ' + _v.cho.goal, function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, ['執行指令 ' + cc('git branch --verbose ' + _v.cho.goal, 'w2') + ' 失敗！']);

    return su(title) && checkoutBr(_v, closure);
  });
}

function deleteBr(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '刪除本地端 ' + cc(_v.cho.goal, 'w2') + ' 分支') + cc('… ', 'w0'));

  Exec('git branch --delete --force ' + _v.cho.goal, function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (!stdout.length)
      return er(title, ['執行指令 ' + cc('git branch --delete --force ' + _v.cho.goal, 'w2') + ' 失敗！']);

    return su(title) && createBr(_v, closure);
  });
}

function setGitOriBr(branches, _v, stdout) {
  _v.gitOri.branch = branches.filter(function(t) { return t.match(/^\*\s+/g); });

  if (!_v.gitOri.branch.length)
    return true;

  _v.gitOri.branch = _v.gitOri.branch.shift().replace(/^\*\s+/g, '');
  
  return !_v.gitOri.branch.length;
}

module.exports.run = function(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '檢查本地端 ' + cc(_v.cho.goal, 'w2') + ' 分支') + cc('… ', 'w0'));

  Exec('git branch --list', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (!stdout.length)
      return er(title, ['執行指令 ' + cc('git branch --list', 'w2') + ' 失敗！']);

    const branches = stdout.split(ln).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t !== ''; });
    
    if (setGitOriBr(branches, _v, stdout))
      return er(title, ['錯誤原因：' + cc('取不到目前的分支名稱', 'w2')]);

    su(title);

    return branches.indexOf(_v.cho.goal) === -1 ?
      createBr(_v, closure) :
      deleteBr(_v, closure);
  });
}