/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

module.exports.s3Info = function() {
  const Path = require('path');

  return {
    bucket: null,
    access: null,
    secret: null,
    folder: Path.resolve(__dirname, '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..').split(Path.sep).pop(),
    domain: null,
  };
};
