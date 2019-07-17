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
const qq = Ginkgo.qq;

const Exec = rq('child_process').exec;
const FileSystem  = rq('fs');
const Path = rq('path');
const root = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;
const cmdDiv = Path.resolve(__dirname, root + 'cmd') + Path.sep;

var mapDir = function(dir, filelist) {
  const files = FileSystem.readdirSync(dir);

  filelist = filelist || [];
  files.forEach(function(file) {
    if (!FileSystem.statSync(dir + file).isDirectory())
      return filelist.push(dir + file);

    if (!(dir + file + Path.sep).match(qq(cmdDiv)))
      filelist = mapDir(dir + file + Path.sep, filelist);
  });
  return filelist;
};

function minifyCSS(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '壓縮 ' + cc('.css', 'w2') + '  檔案') + cc('… ', 'w0'));
  const files = mapDir(Path.resolve(__dirname, root + Path.sep + 'css') + Path.sep).filter(function(file) { return file.match(/\.css$/g); });
  
  if (!files.length)
    return su(title) && closure(_v.cho);

  let i = 0;

  try {
    for (; i < files.length; i++)
      FileSystem.writeFileSync(files[i], FileSystem.readFileSync(files[i], 'utf8').replace(/\n*/g, ''), 'utf8');
  } catch(e) {
    let message = cc(e.message, 'w2');
    
    er(title, [
      '錯誤發生在：' + cc(files[i].replace(Path.resolve(__dirname, root) + Path.sep, ''), 'w2'),
      '以下可能是錯誤原因：' + ln + ln + cc('─'.repeat(30), 'w0') + ln + ln + message + ln + ln + cc('─'.repeat(30), 'w0')]);

    return rq('./rollback').run(_v);
  }

  return su(title) && closure(_v.cho);
}

function minifyHTML(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '壓縮 ' + cc('.html', 'w2') + ' 檔案') + cc('… ', 'w0'));

  const files = mapDir(Path.resolve(__dirname, root) + Path.sep).filter(function(file) { return file.match(/\.html$/g); });
  
  if (!files.length)
    return su(title) && minifyCSS(_v, closure);

  const minify = rq('html-minifier').minify;
  
  let i = 0;
  try {
    for (; i < files.length; i++)
      FileSystem.writeFileSync(files[i], minify(FileSystem.readFileSync(files[i], 'utf8'), {collapseWhitespace: true}), 'utf8');
  } catch(e) {
    let message = cc(e.message, 'w2');

    if (e.message.match(/^Parse Error:/g)) {
      message = e.message.split(/^Parse Error:/gi).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t.length; }).join('');
      message = message.length > 100 ? cc(message.slice(0, 100), 'w2') + cc('…', 'w0') : cc(message, 'w2');
    }

    er(title, [
      '錯誤發生在：' + cc(files[i].replace(Path.resolve(__dirname, root) + Path.sep, ''), 'w2'),
      '以下可能是錯誤原因：' + ln + ln + cc('─'.repeat(30), 'w0') + ln + ln + message + ln + ln + cc('─'.repeat(30), 'w0')]);

    return rq('./rollback').run(_v);
  }

  return su(title) && minifyCSS(_v, closure);
}

function uglifyJS(_v, closure) {
  pp((title = cc('    ➤ ', 'C') + '壓縮 ' + cc('.js', 'w2') + '   檔案') + cc('… ', 'w0'));

  const files = mapDir(Path.resolve(__dirname, root + 'js') + Path.sep).filter(function(file) { return file.match(/\.js$/g); });
  
  if (!files.length)
    return su(title) && minifyHTML(_v, closure);

  const UglifyJS = rq('uglify-js');

  let i = 0;
  try {
    for (; i < files.length; i++) {
      let code = FileSystem.readFileSync(files[i], 'utf8');
      const result = UglifyJS.minify(code, { mangle: { toplevel: true } });
      
      if (result.error)
        throw result.error;

      FileSystem.writeFileSync(files[i], result.code, 'utf8');
    }
  } catch(e) {
    let message = cc(e.message, 'w2');

    er(title, [
      '錯誤發生在：' + cc(files[i].replace(Path.resolve(__dirname, root) + Path.sep, ''), 'w2'),
      '以下可能是錯誤原因：' + ln + ln + cc('─'.repeat(30), 'w0') + ln + ln + message + ln + ln + cc('─'.repeat(30), 'w0')]);

    return rq('./rollback').run(_v);
  }

  return su(title) && minifyHTML(_v, closure);
}

module.exports.run = function(_v, closure) {
  return uglifyJS(_v, closure);
};