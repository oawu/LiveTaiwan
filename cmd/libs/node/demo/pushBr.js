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

function pushBr(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '推送分支 ' + cc(_v.cho.goal, 'w2') + ' 至 ' + cc('origin remote', 'w2')) + cc('… ', 'w0'));
  
  Exec('git push origin ' + _v.cho.goal + ' --force', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, ['執行指令 ' + cc('git push origin ' + _v.cho.goal + ' --force', 'w2') + ' 失敗！']);

    return su(title) && closure(_v.cho.goal);
  });
}

function commitBr(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '變更紀錄提交 ' + cc(_v.cho.goal, 'w2') + ' 分支') + cc('… ', 'w0'));
  
  Exec('git commit --message "上傳前壓縮紀錄。" --quiet', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, ['執行指令 ' + cc('git commit --message "上傳前壓縮紀錄。" --quiet', 'w2') + ' 失敗！']);

    su(title);

    return pushBr(_v, closure);
    // _v.cho.goal == 'aws-s3' ?
    //   rq('./putS3').run(_v, function() { return pushBr(_v, closure); }) :
    //   pushBr(_v, closure);
  });
}

function addAllBr(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '添加變更檔案 ' + cc(_v.cho.goal, 'w2') + ' 分支') + cc('… ', 'w0'));
  
  Exec('git add --all', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    if (stdout.length)
      return er(title, ['執行指令 ' + cc('git add --all', 'w2') + ' 失敗！']);

    return su(title) && commitBr(_v, closure);
  });
}

module.exports.run = function(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '檢查是否變更') + cc('… ', 'w0'));

  Exec('git status --porcelain', function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]);

    su(title);

    if (stdout.length)
      return addAllBr(_v, closure);

    return pushBr(_v, closure);
  });
};