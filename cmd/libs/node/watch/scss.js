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

const Exec = rq('child_process').exec;
const CmdExists = rq('command-exists');;
const Chokidar  = rq('chokidar');
const FileSystem  = rq('fs');
const Path = rq('path');

function compileScss(_v, event, path) {
  const css = path.replace(_v.divs.scss, _v.divs.css).replace(/\.scss$/, '.css');
  let title = cc('    ➤ ', 'c2') + cc('[Scss Files] ', 'b2') + cc(event, 'w') + ' ';

  if (event == '刪除')
    return FileSystem.exists(css, function(exists) {

      if (!exists)
        return _v.scss.isReady &&
          su(title);

      FileSystem.unlink(css, function(err) {
        if (err)
          return _v.scss.isReady &&
            notifier('[Scss Files] 錯誤！', '檔案無法刪除', '請至終端機確認錯誤原因！') &&
            er(title, ['錯誤原因：' + cc(err, 'w2')]);

        return _v.scss.isReady &&
          su(title);
      });
    });

  Exec('compass compile', function(err, stdout, stderr) {
    stdout = stdout.replace(/\x1b[[][^A-Za-z]*[A-Za-z]/g, '').split(/\s/).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t !== ''; });

    if (!stdout.length)
      return;

    const action = stdout.shift();
    const file   = stdout.shift();

    if (action == 'write')
      return _v.scss.isReady &&
        su(title + cc(file.replace(/\//g, Path.sep).replace(_v.divs.css, ''), 'w2'));
    
    if (action == 'error') {

      stdout = /\(Line\s*(\d+):\s*(.*)\)/g.exec(stdout.join(' '));
      title = title + cc(file.replace(/\//g, Path.sep).replace(_v.divs.scss, ''), 'w2') + cc(' ─ ', 'w0') + cc('失敗', 'r');

      if (!Array.isArray(stdout))
        return _v.scss.isReady &&
          nt('[Scss Files] 錯誤！', '編譯 SCSS 檔案發生錯誤', '請至終端機確認錯誤原因！') &&
          er(title, ['錯誤原因：' + cc(stdout.join(' '), 'w2')]);

      title += stdout.length >= 2 ? cc(' ─ ', 'w0') + '在第 ' + cc(stdout[1], 'y2') + ' 行左右' : '';
      title += stdout.length >= 3 ? '\n     ' + cc(' ◎ ', 'p2') + '錯誤原因：' + cc(stdout[2], 'w2') + ln : '';

      return _v.scss.isReady &&
        nt('[Scss Files] 錯誤！', '編譯 SCSS 檔案發生錯誤', '請至終端機確認錯誤原因！') &&
        pp(title + ln);
    }
    
    if (action == 'delete')
      return;
  });
}

module.exports.run = function(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '監控 Scss 檔案') + cc('… ', 'w0'));

  CmdExists('compass', function(err, exists) {
    if (err)
      return nt('[監控 Scss 檔案] 錯誤！', '偵測不到 Compass 指令', '請至終端機確認錯誤原因！') &&
        er(title, ['錯誤原因：' + cc(err, 'w2')]) &&
        closure();

    if(!exists)
      return nt('[監控 Scss 檔案] 警告！', '不存在 Compass 指令', '請至終端機確認錯誤原因！') &&
        er(title, ['無法執行 ' + cc('compass', 'w2') + ' 指令。', '請確認終端機是否可以執行 compass 指令。']) &&
        closure();

    let timer = null;

    Chokidar.watch(wp(_v.divs.scss + '**' + Path.sep + '*.scss'))
      .on('change', function(path) { clearTimeout(timer); timer = setTimeout(compileScss.bind(null, _v, '修改', path), 250); })
      .on('add',    function(path) { clearTimeout(timer); timer = setTimeout(compileScss.bind(null, _v, '新增', path), 250); })
      .on('unlink', function(path) { setTimeout(compileScss.bind(null, _v, '刪除', path), 250); })
      .on('error', function(err) {
        return nt('[監控 Scss 檔案] 警告！', '監控 Scss 檔案發生錯誤', '請至終端機確認錯誤原因！') &&
          er(title, ['錯誤原因：' + cc('err', 'w2')]) &&
          closure();
      })
      .on('ready', function() {
        _v.scss.isListen = true;
        setTimeout(function() { _v.scss.isReady = true; }, _v.scss.timer);
        return su(title) &&
          closure();
      });
  });
};