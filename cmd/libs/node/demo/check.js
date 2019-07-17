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

const CmdExists = rq('command-exists');
const Exec = rq('child_process').exec;

function checkPhpCmd(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '檢查專案是否有 ' + cc('PHP', 'w2') + ' 指令') + cc('… ', 'w0'));

  CmdExists('php', function(err, exists) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if(!exists)
      return er(title, [
        '無法執行 ' + cc('PHP', 'w2') + ' 指令。',
        '請確認終端機是否可以執行 PHP 指令。']);

    return su(title) && closure(_v.cho);
  });
}

function setGitOriUrl(_v, stdout) {
  _v.gitOri.url = [];
  if (stdout.match(/^git@github\.com:(.*)\/(.*)\.git/gi)) {
    stdout = stdout.split(/^git@github\.com:(.*)\/(.*)\.git/g).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t !== ''; })
    if (stdout.length == 2)
      _v.gitOri.url = stdout;
  } else if (stdout.match(/^https:\/\/github\.com\/.*\/.*\.git/gi)) {
    stdout = stdout.split(/^https:\/\/github\.com\/(.*)\/(.*)\.git/g).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t !== ''; })
    if (stdout.length == 2)
      _v.gitOri.url = stdout;
  }

  return !_v.gitOri.url.length;
}
function checkRemoteOriginUrl(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '檢查專案是否為 ' + cc('GitHub', 'w2') + ' 的專案') + cc('… ', 'w0'));
  
  Exec('git remote get-url origin', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (!stdout.length)
      return er(title, ['執行指令 ' + cc('git remote get-url origin', 'w2') + ' 失敗！']);

    if (setGitOriUrl(_v, stdout))
      return er(title, [
        '找不到你的 ' + cc('origin remote url', 'w2'),
        '請確認專案內有 ' + cc('origin', 'w2') + ' remote',
        '以及其 url 為 ' + cc('git@github.com', 'w2') + ' 或 ' + cc('https://github.com/', 'w2') + ' 開頭！']);

    return su(title) && closure(_v.cho);
  });
}

function checkGitStatus(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '檢查專案狀態是否已經 ' + cc('Commit', 'w2')) + cc('… ', 'w0'));

  Exec('git status --porcelain', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, [
        '此專案尚未做 Git Commit。',
        '請檢查哪些檔案有變更但尚未紀錄。',
        '建議先執行以下指令：', [
          '紀錄變更，指令：' + cc('git add --all', 'w2'),
          '再做提交，指令：' + cc('git commit --message "你的訊息"', 'w2')]]);

    su(title);

    return _v.cho.goal == 'gh-pages' ?
      checkRemoteOriginUrl(_v, closure) :
      su(title) && closure(_v.cho);
  });
}

module.exports.run = function(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '檢查專案是否有 ' + cc('Git', 'w2') + ' 指令') + cc('… ', 'w0'));

  CmdExists('git', function(err, exists) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if(!exists)
      return er(title, [
        '無法執行 ' + cc('Git', 'w2') + ' 指令。',
        '請確認終端機是否可以執行 git 指令。']);

    return su(title) &&
           checkGitStatus(_v, closure);
  });
};