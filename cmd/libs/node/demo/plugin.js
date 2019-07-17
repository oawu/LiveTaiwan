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
const ij = Ginkgo.ij;

const FileSystem  = rq('fs');
const Path = rq('path');
const root = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;

const CmdExists = rq('command-exists');
const Exec = rq('child_process').exec;
let cmds = [];

var check = function(_v, closure) {
  closure(_v.plugins.map(function(plugin) {
    plugin.file = Path.resolve(__dirname, root + 'cmd' + Path.sep + 'libs' + Path.sep + 'plugin' + Path.sep + plugin.file);
    return plugin;
  }).filter(function(plugin) {
    return FileSystem.existsSync(plugin.file);
  }));
};

var exec = function(_v, i, closure) {
  pp((title = cc('    ➤ ', 'C') + '執行 ' + cc(_v.plugins[i].title, 'w2') + ' 指令') + cc('… ', 'w0'));

  Exec(_v.plugins[i].cmd + ' ' + _v.plugins[i].file + ' ' + _v.plugins[i].argv, function(err, stdout, stderr) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2'), ij(stdout) ? JSON.parse(stdout) : ('錯誤原因：' + cc(stdout, 'w2'))]) && rq('./rollback').run(_v);

    return su(title) && runPlugin(_v, i + 1, closure);
  });
};

var runPlugin = function(_v, i, closure) {
  if (i >= _v.plugins.length)
    return closure();

  pp((title = cc('    ➤ ', 'C') + '確認是否可以執行 ' + cc(_v.plugins[i].cmd, 'w2') + ' 指令') + cc('… ', 'w0'));

  if (cmds.indexOf(_v.plugins[i].cmd) !== -1)
    return su(title) && exec(_v, i, closure);

  return CmdExists(_v.plugins[i].cmd, function(err, exists) {
    if (err)
      return er(title, ['錯誤原因：' + cc(err, 'w2')]) && rq('./rollback').run(_v);

    if(!exists)
      return er(title, [
        '無法執行 ' + cc(_v.plugins[i].cmd, 'w2') + ' 指令。',
        '請確認終端機是否可以執行 ' + _v.plugins[i].cmd + ' 指令。']) && rq('./rollback').run(_v);
    
    cmds.push(_v.plugins[i].cmd);

    return su(title) && exec(_v, i, closure);
  });
};

module.exports.run = function(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '檢驗外掛') + cc('… ', 'w0'));

  return check(_v, function(plugin) {
    return su(title) && runPlugin(_v, 0, closure);
  });
};