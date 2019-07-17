<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

mb_regex_encoding('UTF-8');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Asia/Taipei');

try {
  throw new Exception('錯誤原因 1');
  throw new Exception(json_encode(['錯誤原因 2', '錯誤原因 3']));
  throw new Exception(json_encode(['錯誤原因' => '4', '錯誤原因' => '5']));
} catch (Exception $e) {
  echo $e->getMessage();
  exit(1);
}

exit(0);
