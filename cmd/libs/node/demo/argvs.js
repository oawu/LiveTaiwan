/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

module.exports.run = function(argv, _v) {
  const argvs = argv.slice(2);

  for(let i = 0; i < argvs.length; i++) {
    if (['-g', '--goal'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-' && ['aws-s3', 'gh-pages'].indexOf(argvs[i + 1].toLowerCase()) !== -1)
      _v.cho.goal = argvs[i + 1];

    if (['-m', '--minify'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-' && ['0', '1', 'true', 'false'].indexOf(argvs[i + 1].toLowerCase()) !== -1)
        _v.cho.minify = argvs[i + 1] === '0' || argvs[i + 1] === 'false' ? false : true;
    
    if (['-b', '--bucket'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.bucket = argvs[i + 1];

    if (['-a', '--access'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.access = argvs[i + 1];

    if (['-s', '--secret'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.secret = argvs[i + 1];

    if (['-f', '--folder'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.folder = argvs[i + 1];

    if (['-d', '--domain'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.domain = argvs[i + 1];
  }
};