/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const rq = require;

const Path = rq('path');
const Exec = rq('child_process').exec;
const FileSystem  = rq('fs');

const ln = '\n';

let notifierEnable = true;
let sprintf = null;

const ij = function(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};
const wp = function(str) {
  return str.replace(/\\/g, "/");
};

const qq = function(str) {
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

const cc = function(str, fontColor, backgroundColor, options) {
  if (str === '')
    return '';

  const colors = { n: '30', r: '31', g: '32', y: '33', b: '34', p: '35', c: '36', w: '37' };
  const styles = { underline: '4', blink: '5', reverse: '7', hidden: '8', u: '4', b: '5', r: '7', h: '8' };

  let tmps = [];

  if (typeof options === 'undefined')
    options = [];

  if (typeof options === 'string')
    options = options.split(',').map(Function.prototype.call, String.prototype.trim);
  
  if (Array.isArray(options) && (options = options.map(Function.prototype.call, String.prototype.toLowerCase)).length)
    for(let i = 0; i < options.length; i++)
      if (typeof styles[options[i]] !== 'undefined')
        tmps.push(['\033[' + styles[options[i]] + 'm', '\033[0m']);

  if (typeof backgroundColor !== 'undefined') {
    let c = backgroundColor[0].toLowerCase();
    if (typeof colors[c] !== 'undefined')
      tmps.push(['\033[' + (parseInt(colors[c], 10) + 10) + 'm', '\033[0m']);
  }

  if (typeof fontColor !== 'undefined') {
    if (fontColor.length < 2)
      fontColor += '_';

    let c = fontColor[0], w = fontColor[1];

    w = w === '_' ? c === c.toUpperCase() ? '2' : w : w;
    c = c.toLowerCase();

    if (!['0', '1', '2'].includes(w))
      w = '1';

    w = w !== '0' ? w === '1' ? '0' : '1' : '2';

    if (typeof colors[c] !== 'undefined')
    tmps.push(['\033[' + w + ';' + colors[c] + 'm', '\033[0m']);
  }

  for(let i = 0; i < tmps.length; i++)
    str = tmps[i][0] + str + tmps[i][1];

  return str;
};

const er = function(title, details) {
  let str = title + cc(' ─ ', 'w0') + cc('失敗', 'r') + ln;
  
  details = details.filter(function(detail) {
    return typeof detail === 'string' || Array.isArray(detail) ? detail.length : true;
  });

  for (var i in details) {
    if (Array.isArray(details[i]))
      for (var j in details[i])
        str += cc('        ➜ ', 'g2') + details[i][j].replace(/\n.*$/, '') + ln;
    else if (typeof details[i] === 'object')
      for (var k in details[i])
        str += cc('        ➜ ', 'g2') + cc(k + '：', 'w2') + details[i][k].replace(/\n.*$/, '') + ln;
    else if (typeof details[i] === 'string')
      str += cc('      ◎ ', 'p2') + details[i].replace(/\n.*$/, '') + ln;
    else;
  }

  return pp(str + ln);
};

const pp = function(str) {
  process.stdout.write('\r' + str);
  return true;
};

const su = function(title) {
  return pp(title + cc(' ─ ', 'w0') + cc('成功', 'g') + ln);
};

const ctrlC = function() {
  return '過程中若要關閉請直接按鍵盤上的 ' + cc('control', 'W') + cc(' + ', 'w0') + cc('c', 'W') + ln + ' '.repeat(37) + cc('^^^^^^^^^^^', 'c1');
};

const init = function(header, closure) {
  process.stdout.write('\x1b[2J');
  process.stdout.write('\x1b[0f');

  const tmp = function() {
    rq('livereload');
    rq('node-notifier');
    rq('chokidar');
    rq('command-exists');
    rq('uglify-js');
    rq('html-minifier');
    rq('js-yaml');
    rq('md5-file');
    rq('sprintf-js');
    sprintf = rq("sprintf-js").sprintf;
    return true;
  };

  const errMsg = function(err) {
    return ln + cc(' '.repeat(30), 'w', 'r') + ln + cc('  發生錯誤', 'y2', 'r') + cc('，以下為錯誤原因', 'w2', 'r') + cc('：  ', 'w', 'r') + ln + cc(' '.repeat(30), 'w', 'r') + ln + cc('─'.repeat(30), 'w0') + ln + err + ln + cc('─'.repeat(30), 'w0') + ln + ln;
  };

  try {
    return tmp() && pp(ln + cc(' ' + '【' + header + '】', 'r2') + ln) && closure(true);
  } catch(e) {
    if (!(e + '').match(/^Error: Cannot find module/))
      return pp(errMsg(e)) && process.exit(1);
  
    pp(ln + cc(' ' + '【' + header + '】', 'r2') + ln);
    pp(cc('    ➤ ', 'C') + '首次使用，所以建立初始化環境！' + ln + cc('    ➤ ', 'C') + '注意喔，過程中請勿隨意結束！' + ln + ln + cc(' 【建立環境】', 'y') + ln);
    pp((title = cc('    ➤ ', 'C') + '執行 ' + cc('npm install .', 'w2') + ' 指令') + cc('… ', 'w0'));

    Exec('npm install .', function(err, stdout, stderr) {
      try {
        return su(title) && tmp() && pp(ln + cc(' ' + '【開始' + header + '】', 'y') + ln) && closure(false);
      } catch(e) {
        if (!(e + '').match(/^Error: Cannot find module/))
          return pp(errMsg(e)) && process.exit(1);
        
        pp(title + cc(' ─ ', 'w0') + cc('失敗', 'r') + ln + cc('      ◎ ', 'p2') + cc('cmd 目錄', 'w2') + '無法寫入' + ln);
        pp((title = cc('    ➤ ', 'C') + '改用最高權限執行 ' + cc('sudo npm install .', 'w2') + ' 指令') + cc('… ', 'w0'));
        
        Exec('sudo npm install .', function(err, stdout, stderr) {
          try {
            return su(title) && tmp() && pp(ln + cc(' ' + '【開始' + header + '】', 'y') + ln) && closure(false);
          } catch(e) {
            if (!(e + '').match(/^Error: Cannot find module/))
              return pp(errMsg(e)) && process.exit(1);

            pp(title + cc(' ─ ', 'w0') + cc('失敗', 'r') + ln + cc('      ◎ ', 'p2') + cc('cmd 目錄', 'w2') + '無法寫入' + ln);
            pp(ln + cc(' '.repeat(50), 'r', 'r') + ln + cc('  錯誤！', 'y2', 'r') + cc('執行', 'n', 'r') + cc(' npm install . ', 'w2', 'r') + cc('失敗', 'n', 'r') + cc(' '.repeat(19), 'r', 'r') + ln + cc(' '.repeat(8), 'y2', 'r') + cc('請在終端機手動輸入指令', 'n1', 'r') + cc(' npm install . ', 'w2', 'r') + cc('吧！ ', 'n1', 'r') + ln + cc(' '.repeat(31), 'r', 'r') + cc('^^^^^^^^^^^^^', 'y2', 'r') + cc(' '.repeat(6), 'r', 'r') + ln + ln);
          }
        });
      }
    });
  }
};

const qu = function(items, closure) {
  const readline = rq('readline').createInterface;
  const rl = readline({ input: process.stdin, output: process.stdout });

  rl.question(cc(' ➜', 'r2') + ' 請輸入您的選項：', function(answer) {
    rl.close();

    cho = answer.toLowerCase().trim();

    if (items.indexOf(cho) === -1)
      return qu(items, closure);

    closure(cho);
  });
};


const nt = function(title, subtitle, message) {
  let Notifier = rq('node-notifier').NotificationCenter;

  notifierEnable && new Notifier().notify({
    title: title,
    subtitle: subtitle,
    message: message,
    sound: true,
    wait: false,
    timeout: 5,
    closeLabel: '關閉',
    actions: ['不再顯示'],
    dropdownLabel: '其他',
  }, function(e, r, m) {
    if (r == 'activate' && m.activationValue == '不再顯示')
      notifierEnable = false;
  });

  return true;
};

const progressInfo = {
  title: null,
  total: 0,
  index: 0,
  present: 0,
};

var pr = function(total, err) {
  if (typeof total === 'string') {
    if (total === '')
      return pp(progressInfo.title + cc('(' + progressInfo.total + '/' + progressInfo.total + ')', 'w0') + cc(' ─ ', 'w0') + '100%' + cc(' ─ ', 'w0') + cc("完成", 'g') + ln);
    else if (total === '_')
      return pp(progressInfo.title + cc('(' + progressInfo.index + '/' + progressInfo.total + ')', 'w0') + cc(' ─ ', 'w0') + sprintf('%3d%%', progressInfo.present) + cc(' ─ ', 'w0') + cc("失敗", 'r') + ln + (err ? err.map(function(t) {
        return cc('      ◎ ', 'p2') + t + ln;
      }).join('') : '') + ln);
    else
      return pp((progressInfo.title = total) + cc('… ', 'w0'));
  }

  if (!isNaN(total)) {
    progressInfo.total = total;
    progressInfo.index = -1;
  }

  progressInfo.present = progressInfo.total ? Math.ceil((progressInfo.index + 1) * 100) / progressInfo.total : 100;
  progressInfo.present = progressInfo.present <= 100 ? progressInfo.present >= 0 ? progressInfo.present : 0 : 100;

  return pp(progressInfo.title + cc('(' + (++progressInfo.index) + '/' + progressInfo.total + ')', 'w0') + cc(' ─ ', 'w0') + sprintf('%3d%%', progressInfo.present));
};

module.exports = {
  ln: ln,
  cc: cc,
  pp: pp,
  er: er,
  qu: qu,
  nt: nt,
  su: su,
  pr: pr,
  qq: qq,
  wp: wp,
  ij: ij,
  init: init,
  ctrlC: ctrlC,
};