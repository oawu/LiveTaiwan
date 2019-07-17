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
const qu = Ginkgo.qu;
const Path = rq('path');

let ask = false;
let reask = false;

const titles = {
  bucket: 'Bucket Name：',
  access: 'Access Key ：',
  secret: 'Secret Key ：',
  folder: 'Folder Name：',
  domain: 'Domain Url ：',
};

function askS3(title, d4, closure, space) {
  if (reask === false && d4 !== null) {
    pp(cc('    ➤ ', 'C') + title + cc(d4, 'w2') + ln);
    return closure(d4);
  }

  ask = true;

  const readline = rq('readline').createInterface;
  const rl = readline({ input: process.stdin, output: process.stdout });

  rl.question(cc('    ➤ ', 'C') + title, function(input) {
    rl.close();
    input = input.trim();
    return space || input.length ? closure(input) : askS3(title, d4, closure, space);
  });

  if (d4 !== null)
    rl.write(d4);
  else if (title == titles.folder)
   rl.write(Path.resolve(__dirname, '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep).split(Path.sep).pop());
 else;
}

function check(_v, closure) {
  pp(ln + cc(' 【以上是否正確】', 'y') + ln);
  pp(cc('  ', 'g1') + cc('  1. 是的，資訊沒錯', undefined) + cc(' - Yes, the information is correct',  'w0') + ln);
  pp(cc('  ', 'g1') + cc('  2. 不對，我要重寫', undefined) + cc(' - No, the information should be rewritten',  'w0') + ln);
  pp(ln);

  qu(['1', '2'], function(cho) {
    return cho == '2' && (reask = true) ?
      info(_v, closure) :
      closure();
  });
}

var info = function(_v, closure) {
  if (reask)
    pp(ln + cc(' 【請重新輸入 S3 設定】', 'y') + ln);

  askS3(titles.bucket, _v.s3Info.bucket, function(input) {
    _v.s3Info.bucket = input;

    askS3(titles.access, _v.s3Info.access, function(input) {
      _v.s3Info.access = input;

      askS3(titles.secret, _v.s3Info.secret, function(input) {
        _v.s3Info.secret = input;
          
        askS3(titles.folder, _v.s3Info.folder, function(input) {
          _v.s3Info.folder = input;
            
          askS3(titles.domain, _v.s3Info.domain, function(input) {
            _v.s3Info.domain = input;

            ask ? check(_v, closure) : closure();

          }, false);
        }, true);
      }, false);
    }, false);
  }, false);
};

module.exports = {
  run: info
};