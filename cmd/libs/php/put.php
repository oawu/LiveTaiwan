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

define('PATH_CMD_LIB_PHP', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('PATH_CMD_LIB', dirname(PATH_CMD_LIB_PHP) . DIRECTORY_SEPARATOR);
define('PATH_CMD', dirname(PATH_CMD_LIB) . DIRECTORY_SEPARATOR);
define('PATH', dirname(PATH_CMD) . DIRECTORY_SEPARATOR);
define('DIRNAME', basename(PATH));

define('METHOD', php_sapi_name () === 'cli' ? 'cli' : 'post');

if (!function_exists('arrayFlatten')) { function arrayFlatten($arr) { $new = []; foreach ($arr as $key => $value) if (is_array($value)) $new = array_merge($new, $value); else array_push($new, $value); return $new; } }

$steps = [];

try {
  array_push($steps, '讀取 config.php');
  $dirs = is_readable($dirs = PATH_CMD . 'libs' . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR . 'config.php') ? include_once($dirs) : ['bucket' => null, 'access' => null, 'secret' => null, 'folder' => null, 'domain' => null];

  array_push($steps, '分析參數');
  switch (METHOD) {
    case 'get':  $key = '_GET';
    case 'post': isset($key) || $key = '_POST';
      isset($$key['bucket']) && ($$key['bucket'] = trim($$key['bucket'])) && $dirs['bucket'] = $$key['bucket'];
      isset($$key['access']) && ($$key['access'] = trim($$key['access'])) && $dirs['access'] = $$key['access'];
      isset($$key['secret']) && ($$key['secret'] = trim($$key['secret'])) && $dirs['secret'] = $$key['secret'];
      isset($$key['folder']) && $dirs['folder'] = trim($$key['folder']);
      isset($$key['domain']) && $dirs['domain'] = trim($$key['domain']);
      break;

    case 'cli':
      if (!function_exists('params')) { function params($params, $keys) { $ks = $return = $result = []; if (!($params && $keys)) return $return; foreach ($keys as $key) if (is_array($key)) foreach ($key as $k) array_push($ks, $k); else array_push($ks, $key); $key = null; foreach ($params as $param) if (in_array($param, $ks)) if (!isset($result[$key = $param])) $result[$key] = []; else ; else if (isset($result[$key])) array_push($result[$key], $param); else ; foreach ($keys as $key) if (is_array($key)) foreach ($key as $k) if (isset($result[$k])) $return[$key[0]] = isset($return[$key[0]]) ? array_merge($return[$key[0]], $result[$k]) : $result[$k]; else; else if (isset($result[$key])) $return[$key] = isset($return[$key]) ? array_merge($return[$key], $result[$key]) : $result[$key]; else ; return $return; } }
      $file = array_shift($argv);
      $file = params($argv, [['-b', '--bucket'], ['-a', '--access'], ['-s', '--secret'], ['-f', '--folder'], ['-d', '--domain']]);

      isset($file['-b'][0]) && $dirs['bucket'] = $file['-b'][0];
      isset($file['-a'][0]) && $dirs['access'] = $file['-a'][0];
      isset($file['-s'][0]) && $dirs['secret'] = $file['-s'][0];
      isset($file['-f'])    && $dirs['folder'] = isset($file['-f'][0]) ? $file['-f'][0] : '';
      isset($file['-d'][0]) && $dirs['domain'] = $file['-d'][0];
      break;
    
    default:
      break;
  }

  array_push($steps, '定義參數');
  define('BUCKET', $dirs['bucket']);
  define('ACCESS', $dirs['access']);
  define('SECRET', $dirs['secret']);
  define('FOLDER', $dirs['folder'] !== null ? trim($dirs['folder'], '/') : DIRNAME);
  define('DOMAIN', $dirs['domain'] !== null ? $dirs['domain'] : BUCKET);

  array_push($steps, '檢查參數');
  if (BUCKET === null || ACCESS === null || SECRET === null)
    throw new Exception('缺少必填參數！');

  array_push($steps, '載入 S3');
  if (!is_readable($dirs = PATH_CMD . 'libs' . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR . 'S3.php'))
    throw new Exception('找不到 cmd/libs/php 目錄內的 S3.php 檔案！');

  include_once $dirs;

  array_push($steps, '載入 Spyc');
  if (!is_readable($dirs = PATH_CMD . 'libs' . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR . 'Spyc.php'))
    throw new Exception('找不到 cmd/libs/php 目錄內的 Spyc.php 檔案！');
  
  include_once $dirs;

  array_push($steps, '載入 _dirs.yaml');
  if (!is_readable($dirs = PATH_CMD . '_dirs.yaml'))
    throw new Exception('找不到 cmd 目錄內的 _dirs.yaml 檔案！');

  array_push($steps, '解譯 _dirs.yaml');
  $dirs = array_map(function($dir) {
    $dir = array_merge(['formats' => [], 'recursive' => false, 'hidden' => false, 'includes' => []], $dir);
    is_array($dir['formats']) || $dir['formats'] = [];
    is_array($dir['includes']) || $dir['includes'] = [];
    $dir['recursive'] = boolval($dir['recursive']);
    $dir['hidden'] = boolval($dir['hidden']);
    $dir['includes'] = array_map(function($include) { return trim($include, DIRECTORY_SEPARATOR); }, $dir['includes']);
    
    $dir['path'] = trim($dir['path'], DIRECTORY_SEPARATOR);
    $dir['path'] = PATH . ($dir['path'] ? $dir['path'] . DIRECTORY_SEPARATOR : $dir['path']);
    return $dir;
  }, array_filter(Spyc::YAMLLoad($dirs), function($dir) { return isset($dir['path']) && is_string($dir['path']); }));

  array_push($steps, '定義函式');
  function mapDir($path, $options) {
    $files = @scandir($path);
    $files !== false || $files = [];
    return arrayFlatten(array_filter(array_map(function($file) use ($path, $options) {
      $path = $path . $file;
      if ($file === '.') return null;
      if ($file === '..') return null;
      if ($path === PATH . '.git') return null;
      if ($path === PATH . 'cmd') return null;

      if (is_dir($path)) return $options['recursive'] ? mapDir($path . DIRECTORY_SEPARATOR, $options) : null;

      if (is_file($path))
        return
          filesize($path) &&
          ($options['hidden']    || $file[0] !== '.') &&
          (!$options['includes'] || in_array(preg_replace('/^(' . preg_replace('/\//', '\/', PATH) . ')/', '', $path), $options['includes'])) &&
          (!$options['formats']  || in_array('.' . pathinfo($file, PATHINFO_EXTENSION), $options['formats']))
          ? $path : null;

      return null;
    }, $files), function($file) {
      return $file !== null;
    }));
  }

  $localFilesFunc = function($dirs) {
    return array_map(function($dir) {
      return [
        'name' => (FOLDER ? FOLDER . '/' : '') . preg_replace('/^(' . preg_replace('/\//', '\/', PATH) . ')/', '', $dir),
        'hash' => md5_file($dir),
        'path' => $dir,
      ];
    }, arrayFlatten(array_map(function($dir) { return mapDir($dir['path'], $dir); }, $dirs)));
  };

  $s3FilesFunc = function(&$s3) {
    $s3 = new S3(ACCESS, SECRET);

    if (!$s3->test())
      return 'S3 測試失敗！';

    $files = $s3->bucket(BUCKET, FOLDER === '' ? null : FOLDER);

    if ($files === false)
      return 'S3 取得 Bucket 資料失敗！';

    return array_values(array_map(function($file) {
      unset($file['time'], $file['size']);
      return $file;
    }, $files));
  };

  $filterLocalFilesFunc = function(array $localFiles, array $s3Files) {
    return array_filter($localFiles, function($localFile) use ($s3Files) {
      foreach ($s3Files as $s3File)
        if ($s3File['name'] == $localFile['name'] && $s3File['hash'] == $localFile['hash'])
          return false;
      return true;
    });
  };

  $uploadFilesFunc = function($uploadFiles, $s3) {
    return array_filter(array_map(function($uploadFile) use ($s3) {
      return !$s3->putObject($uploadFile['path'], BUCKET, $uploadFile['name']);
    }, $uploadFiles));
  };

  $filterS3FilesFunc = function(array $s3Files, array $localFiles) {
    return array_filter($s3Files, function($s3File) use ($localFiles) {
      foreach ($localFiles as $localFile)
        if ($localFile['name'] == $s3File['name'])
          return false;
      return true;
    });
  };

  $deleteFilesFunc = function(array $deleteFiles, $s3) {
    return array_filter(array_map(function($deleteFile) use ($s3) {
      return !$s3->deleteObject(BUCKET, $deleteFile['name']);
    }, $deleteFiles));
  };


  array_push($steps, '整理本機內檔案');
  $localFiles = $localFilesFunc($dirs);
  unset($localFilesFunc);

  array_push($steps, '取得 S3 上檔案');
  if (is_string($s3Files = $s3FilesFunc($s3)))
    throw new Exception($s3Files);
  unset($s3FilesFunc);

  array_push($steps, '過濾上傳的檔案');
  $uploadFiles = $filterLocalFilesFunc($localFiles, $s3Files);
  unset($filterLocalFilesFunc);

  array_push($steps, '上傳檔案至 S3');
  if ($uploadFilesFunc($uploadFiles, $s3))
    throw new Exception('S3 上傳失敗！');
  unset($uploadFilesFunc);

  array_push($steps, '過濾刪除的檔案');
  $deleteFiles = $filterS3FilesFunc($s3Files, $localFiles);
  unset($filterS3FilesFunc);

  array_push($steps, '刪除 S3 的檔案');
  if ($deleteFilesFunc($deleteFiles, $s3))
    throw new Exception('S3 刪除失敗！');
  unset($deleteFilesFunc);

  array_push($steps, '完成');
  @header('Content-Type: application/json; charset=UTF-8', true);
  echo json_encode(['status' => true, 'steps' => $steps]);
} catch (Exception $e) {
  @header('Content-Type: application/json; charset=UTF-8', true);
  echo json_encode(['status' => false, 'steps' => $steps, 'error' => $e->getMessage()]);
}
