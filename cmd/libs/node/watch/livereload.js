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
const qq = Ginkgo.qq;
const wp = Ginkgo.wp;
const Path = rq('path');

const port = 35729;

function openLivereload(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '開啟 LiveReload') + cc('… ', 'w0'));

  const server = rq('livereload').createServer({
    applyCSSLive: false,
    applyImgLive: false,
  });
  const sendAllClients = server.sendAllClients;
  const pattern = new RegExp(qq(_v.divs._));

  server.sendAllClients = function(data) {
    sendAllClients.bind(server)(data);

    return _v.font.isReady &&
      _v.scss.isReady &&
      _v.live.isReady &&
      su(cc('    ➤ ', 'c2') + cc('[Livereload] ', 'y2') + cc('刷新', 'w') + ' ' + cc(JSON.parse(data).path.replace(/\//g, Path.sep).replace(pattern, ''), 'w2'));
  };

  server.watch(_v.live.divs.map(wp));
  
  _v.live.isReady = true;
  _v.live.isListen = true;
  return su(title)
    && closure();
}

function isPortUsed(port, closure) {
  const tester = rq('net').createServer();

  tester.once('error', function(err) {
    return err.code != 'EADDRINUSE' ?
      closure(err) :
      closure(null, true);
  }).once('listening', function() {
    return tester.once('close', function() {
      closure(null, false);
    }).close();
  }).listen(port);
}

module.exports.run = function(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '檢查是否可以啟用') + cc('… ', 'w0'));

  isPortUsed(port, function(err, used) {
    if (err)
      return nt('[開啟 LiveReload] 警告！', '啟動 LiveReload 時發生錯誤', '無法執行 LiveReload，不明原因錯誤！\n錯誤原因：' + err) &&
        er(title, ['錯誤原因：' + cc(err, 'w2'), '未啟動 LiveReload ' + cc('不會影響', 'w2') + '其他功能！']) &&
        closure();

    if (used)
      return nt('[開啟 LiveReload] 警告！', '啟動 LiveReload 時發生錯誤', '您有其他正在執行 LiveReload 的專案。\n本專案無法執行 LiveReload，但不影響其他功能。') &&
        er(title, ['有別的專案開啟了 ' + cc('LiveReload', 'w2') + '！', '未啟動 LiveReload ' + cc('不會影響', 'w2') + '其他功能！']) &&
        closure();

    return su(title) &&
      openLivereload(_v, closure);
  });
};