<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

final class S3Request {
  private $s3 = null,
          $verb,
          $bucket,
          $uri,
          $resource = '',
          $parameters = [],
          $amzHeaders = [],
          $headers    = [
            'Host' => '',
            'Date' => '',
            'Content-MD5' => '',
            'Content-Type' => ''
          ];

  public $fp = null,
         $data = null,
         $size = 0,
         $response = null;

  public function __construct($verb, $s3, $bucket = '', $uri = '') {
    $this->s3 = $s3;
    $this->verb = strtoupper($verb);
    $this->bucket = strtolower($bucket);
    $this->uri = $uri ? '/' . str_replace('%2F', '/', rawurlencode($uri)) : '/';
    $this->resource = ($this->bucket ? '/' . $this->bucket : '') . $this->uri;
    $this->headers['Host'] = ($this->bucket ? $this->bucket . '.' : '') . 's3.amazonaws.com';
    $this->headers['Date'] = gmdate('D, d M Y H:i:s T');
    $this->response = new STDClass;
    $this->response->error = null;
    $this->response->body = '';
    $this->response->code = null;
  }

  public function setParameter($key, $value) {
    $value && $this->parameters[$key] = $value;
    return $this;
  }

  public function setHeaders($arr) {
    foreach ($arr as $key => $value)
      $this->setHeader($key, $value);
    return $this;
  }

  public function setHeader($key, $value) {
    $value && $this->headers[$key] = $value;
    return $this;
  }

  public function setAmzHeaders($arr) {
    foreach ($arr as $key => $value)
      $this->setAmzHeader($key, $value);
    return $this;
  }

  public function setAmzHeader($key, $value) {
    $value && $this->amzHeaders[preg_match('/^x-amz-.*$/', $key) ? $key : 'x-amz-meta-' . $key] = $value;
    return $this;
  }

  public function setData($data) {
    $this->data = $data;
    $this->setSize(strlen($data));
    return $this;
  }

  public function setFile($file, $mode = 'rb', $autoSetSize = true) {
    $this->fp = @fopen($file, $mode);
    $autoSetSize && $this->setSize(filesize($file));
    return $this;
  }

  public function setSize($size) {
    $this->size = $size;
    return $this;
  }

  public function getSize() {
    return $this->size;
  }

  public function getFile() {
    return $this->fp;
  }

  public function isSuccessResponse(&$response, $codes = [200]) {
    $response = $this->getResponse();
    return $response->error === null && in_array($response->code, $codes);
  }

  public function isFailResponse(&$response, $codes = [200]) {
    return !$this->isSuccessResponse($response, $codes);
  }

  public static function create($verb, $s3, $bucket = '', $uri = '') {
    return new S3Request($verb, $s3, $bucket, $uri);
  }

  private function makeAmz() {
    $amz = [];
    foreach ($this->amzHeaders as $header => $value)
      $value && array_push($amz, strtolower($header) . ':' . $value);

    if (!$amz)
      return '';

    sort($amz);

    return "\n" . implode("\n", $amz);
  }

  private function makeHeader() {
    $headers = [];
    foreach ($this->amzHeaders as $header => $value)
      $value && array_push($headers, $header . ': ' . $value);

    foreach ($this->headers as $header => $value)
      $value && array_push($headers, $header . ': ' . $value);

    array_push($headers, 'Authorization: ' . $this->s3->getSignature($this->headers['Host'] == 'cloudfront.amazonaws.com' ? $this->headers['Date'] : $this->verb . "\n" . $this->headers['Content-MD5'] . "\n" . $this->headers['Content-Type'] . "\n" . $this->headers['Date'] . $this->makeAmz() . "\n" . $this->resource));

    return $headers;
  }

  private function responseWriteCallback(&$curl, &$data) {
    if ($this->response->code == 200 && $this->fp !== null)
      return fwrite($this->fp, $data);

    $this->response->body .= $data;

    return strlen($data);
  }

  private function responseHeaderCallback(&$curl, &$data) {
    if (($strlen = strlen($data)) <= 2)
      return $strlen;

    if (substr($data, 0, 4) == 'HTTP') {
      $this->response->code = (int)substr($data, 9, 3);
    } else {
      list($header, $value) = explode(': ', trim($data), 2);
      $header == 'Last-Modified'  && $this->response->headers['time'] = strtotime($value);
      $header == 'Content-Length' && $this->response->headers['size'] = (int)$value;
      $header == 'Content-Type'   && $this->response->headers['type'] = $value;
      $header == 'ETag'           && $this->response->headers['hash'] = $value{0} == '"' ? substr($value, 1, -1) : $value;
      preg_match('/^x-amz-meta-.*$/', $header) && $this->response->headers[$header] = is_numeric($value) ? (int)$value : $value;
    } return $strlen;
  }

  public function getResponse() {
    $query = '';
    if ($this->parameters) {
      $query = substr($this->uri, -1) !== '?' ? '?' : '&';
      foreach ($this->parameters as $var => $value)
        $query .= ($value == null) || ($value == '') ? $var . '&' : $var . '=' . rawurlencode($value) . '&';

      $this->uri .= $query = substr($query, 0, -1);

      if (isset($this->parameters['acl']) || isset($this->parameters['location']) || isset($this->parameters['torrent']) || isset($this->parameters['logging']))
        $this->resource .= $query;
    }

    $url = ($this->s3->isUseSsl() && extension_loaded('openssl') ? 'https://' : 'http://') . $this->headers['Host'] . $this->uri;

    $curlSetopts = [
      CURLOPT_URL => $url,
      CURLOPT_USERAGENT => 'S3/php',
      CURLOPT_HTTPHEADER => $this->makeHeader(),
      CURLOPT_HEADER => false,
      CURLOPT_RETURNTRANSFER => false,
      CURLOPT_WRITEFUNCTION => [&$this, 'responseWriteCallback'],
      CURLOPT_HEADERFUNCTION => [&$this, 'responseHeaderCallback'],
      CURLOPT_FOLLOWLOCATION => true
    ];

    $this->s3->isUseSsl() && $curlSetopts[CURLOPT_SSL_VERIFYHOST] = 1;
    $this->s3->isUseSsl() && $curlSetopts[CURLOPT_SSL_VERIFYPEER] = $this->s3->isVerifyPeer() ? 1 : FALSE;

    switch ($this->verb) {
      case 'PUT': case 'POST':
        if ($this->fp !== null) {
          $curlSetopts[CURLOPT_PUT] = true;
          $curlSetopts[CURLOPT_INFILE] = $this->fp;
          $this->size && $curlSetopts[CURLOPT_INFILESIZE] = $this->size;
          break;
        }

        $curlSetopts[CURLOPT_CUSTOMREQUEST] = $this->verb;
        
        if ($this->data !== null) {
          $curlSetopts[CURLOPT_POSTFIELDS] = $this->data;
          $this->size && $curlSetopts[CURLOPT_BUFFERSIZE] = $this->size;
        }
        break;

      case 'HEAD':
        $curlSetopts[CURLOPT_CUSTOMREQUEST] = 'HEAD';
        $curlSetopts[CURLOPT_NOBODY] = true;
        break;

      case 'DELETE':
        $curlSetopts[CURLOPT_CUSTOMREQUEST] = 'DELETE';
        break;

      case 'GET': default: break;
    }

    $curl = curl_init();
    curl_setopt_array($curl, $curlSetopts);

    if (curl_exec($curl))
      $this->response->code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    else
      $this->response->error = [
        'code' => curl_errno($curl),
        'message' => curl_error($curl),
        'resource' => $this->resource
      ];

    curl_close($curl);

    if ($this->response->error === null && isset($this->response->headers['type']) && $this->response->headers['type'] == 'application/xml' && isset($this->response->body) && ($this->response->body = simplexml_load_string($this->response->body)))
      if (!in_array($this->response->code, [200, 204]) && isset($this->response->body->Code, $this->response->body->Message))
        $this->response->error = [
          'code' => (string)$this->response->body->Code,
          'message' => (string)$this->response->body->Message,
          'resource' => isset($this->response->body->Resource) ? (string)$this->response->body->Resource : null
        ];

    $this->fp !== null && is_resource($this->fp) && fclose($this->fp);

    return $this->response;
  }
}

class S3 {
  const ACL_PRIVATE = 'private',
        ACL_PUBLIC_READ = 'public-read',
        ACL_PUBLIC_READ_WRITE = 'public-read-write',
        ACL_AUTHENTICATED_READ = 'authenticated-read';

  private $accessKey = null,
          $secretKey = null,
          $isUseSsl = false,
          $isVerifyPeer = true;

  public static $extensions = ['jpg' => ['image/jpeg', 'image/pjpeg'], 'gif' => ['image/gif'], 'png' => ['image/png', 'image/x-png'], 'pdf' => ['application/pdf', 'application/x-download'], 'gz' => ['application/x-gzip'], 'zip' => ['application/x-zip', 'application/zip', 'application/x-zip-compressed'], 'swf' => ['application/x-shockwave-flash'], 'tar' => ['application/x-tar'], 'bz' => ['application/x-bzip'], 'bz2' => ['application/x-bzip2'], 'txt' => ['text/plain'], 'html' => ['text/html'], 'htm' => ['text/html'], 'ico' => ['image/x-icon'], 'css' => ['text/css'], 'js' => ['application/x-javascript'], 'xml' => ['text/xml'], 'ogg' => ['application/ogg'], 'wav' => ['audio/x-wav', 'audio/wave', 'audio/wav'], 'avi' => ['video/x-msvideo'], 'mpg' => ['video/mpeg'], 'mov' => ['video/quicktime'], 'mp3' => ['audio/mpeg', 'audio/mpg', 'audio/mpeg3', 'audio/mp3'], 'mpeg' => ['video/mpeg'], 'flv' => ['video/x-flv'], 'php' => ['application/x-httpd-php'], 'bin' => ['application/macbinary'], 'psd' => ['application/x-photoshop'], 'ai' => ['application/postscript'], 'ppt' => ['application/powerpoint', 'application/vnd.ms-powerpoint'], 'wbxml' => ['application/wbxml'], 'tgz' => ['application/x-tar', 'application/x-gzip-compressed'], 'jpeg' => ['image/jpeg', 'image/pjpeg'], 'jpe' => ['image/jpeg', 'image/pjpeg'], 'bmp' => ['image/bmp', 'image/x-windows-bmp'], 'shtml' => ['text/html'], 'text' => ['text/plain'], 'doc' => ['application/msword'], 'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'], 'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'], 'word' => ['application/msword', 'application/octet-stream'], 'json' => ['application/json', 'text/json'], 'svg' => ['image/svg+xml'], 'mp2' => ['audio/mpeg'], 'exe' => ['application/octet-stream', 'application/x-msdownload'], 'tif' => ['image/tiff'], 'tiff' => ['image/tiff'], 'asc' => ['text/plain'], 'xsl' => ['text/xml'], 'hqx' => ['application/mac-binhex40'], 'cpt' => ['application/mac-compactpro'], 'csv' => ['text/x-comma-separated-values', 'text/comma-separated-values', 'application/octet-stream', 'application/vnd.ms-excel', 'application/x-csv', 'text/x-csv', 'text/csv', 'application/csv', 'application/excel', 'application/vnd.msexcel'], 'dms' => ['application/octet-stream'], 'lha' => ['application/octet-stream'], 'lzh' => ['application/octet-stream'], 'class' => ['application/octet-stream'], 'so' => ['application/octet-stream'], 'sea' => ['application/octet-stream'], 'dll' => ['application/octet-stream'], 'oda' => ['application/oda'], 'eps' => ['application/postscript'], 'ps' => ['application/postscript'], 'smi' => ['application/smil'], 'smil' => ['application/smil'], 'mif' => ['application/vnd.mif'], 'xls' => ['application/excel', 'application/vnd.ms-excel', 'application/msexcel'], 'wmlc' => ['application/wmlc'], 'dcr' => ['application/x-director'], 'dir' => ['application/x-director'], 'dxr' => ['application/x-director'], 'dvi' => ['application/x-dvi'], 'gtar' => ['application/x-gtar'], 'php4' => ['application/x-httpd-php'], 'php3' => ['application/x-httpd-php'], 'phtml' => ['application/x-httpd-php'], 'phps' => ['application/x-httpd-php-source'], 'sit' => ['application/x-stuffit'], 'xhtml' => ['application/xhtml+xml'], 'xht' => ['application/xhtml+xml'], 'mid' => ['audio/midi'], 'midi' => ['audio/midi'], 'mpga' => ['audio/mpeg'], 'aif' => ['audio/x-aiff'], 'aiff' => ['audio/x-aiff'], 'aifc' => ['audio/x-aiff'], 'ram' => ['audio/x-pn-realaudio'], 'rm' => ['audio/x-pn-realaudio'], 'rpm' => ['audio/x-pn-realaudio-plugin'], 'ra' => ['audio/x-realaudio'], 'rv' => ['video/vnd.rn-realvideo'], 'log' => ['text/plain', 'text/x-log'], 'rtx' => ['text/richtext'], 'rtf' => ['text/rtf'], 'mpe' => ['video/mpeg'], 'qt' => ['video/quicktime'], 'movie' => ['video/x-sgi-movie'], 'xl' => ['application/excel'], 'eml' => ['message/rfc822']];

  public function __construct($accessKey, $secretKey, $isUseSsl = false, $isVerifyPeer = true) {
    $this->accessKey = $accessKey;
    $this->secretKey = $secretKey;
    $this->isUseSsl = $isUseSsl;
    $this->isVerifyPeer = $isVerifyPeer;
  }

  public function getSignature($string) {
    return 'AWS ' . $this->accessKey . ':' . $this->getHash($string);
  }

  private function getHash($string) {
    return base64_encode(extension_loaded('hash') ? hash_hmac('sha1', $string, $this->secretKey, true) : pack('H*', sha1((str_pad($this->secretKey, 64, chr(0x00)) ^ (str_repeat(chr(0x5c), 64))) . pack('H*', sha1((str_pad($this->secretKey, 64, chr(0x00)) ^ (str_repeat(chr(0x36), 64))) . $string)))));
  }

  public function isUseSsl() {
    return $this->isUseSsl;
  }

  public function isVerifyPeer() {
    return $this->isVerifyPeer;
  }

  public function test() {
    return S3Request::create('GET', $this)->isSuccessResponse($rest);
  }

  public static function fileMD5($filePath) {
    return base64_encode(md5_file($filePath, true));
  }

  public function deleteObject($bucket, $uri) {
    return $rest = S3Request::create('DELETE', $this, $bucket, $uri)->isSuccessResponse($rest, [200, 204]) ? true : false;
  }

  public function bucket($bucket, $prefix = null, $marker = null, $maxKeys = null, $delimiter = null, $returnCommonPrefixes = false) {
    if (S3Request::create('GET', $this, $bucket)->setParameter('prefix', $prefix)->setParameter('marker', $marker)->setParameter('max-keys', $maxKeys)->setParameter('delimiter', $delimiter)->isFailResponse($rest))
      return false;
    
    $nextMarker = null;
    $results = [];
    
    if (isset($rest->body, $rest->body->Contents))
      foreach ($rest->body->Contents as $content)
        $results[$nextMarker = (string)$content->Key] = [
          'name' => (string)$content->Key,
          'time' => date('Y-m-d H:i:s', strtotime((string)$content->LastModified)),
          'size' => (int)$content->Size,
          'hash' => substr((string)$content->ETag, 1, -1)
        ];
    if ($returnCommonPrefixes && isset($rest->body, $rest->body->CommonPrefixes))
      foreach ($rest->body->CommonPrefixes as $content)
        $results[(string)$content->Prefix] = ['prefix' => (string)$content->Prefix];

    if (isset($rest->body, $rest->body->IsTruncated) && (((string)$rest->body->IsTruncated) == 'false'))
      return $results;

    if (isset($rest->body, $rest->body->NextMarker))
      $nextMarker = (string)$rest->body->NextMarker;

    if ($maxKeys || !$nextMarker || (((string)$rest->body->IsTruncated) != 'true'))
      return $results;

    do {
      if (S3Request::create('GET', $this, $bucket)->setParameter('marker', $nextMarker)->setParameter('prefix', $prefix)->setParameter('delimiter', $delimiter)->isFailResponse($rest))
        break;

      if (isset($rest->body, $rest->body->Contents))
        foreach ($rest->body->Contents as $content)
          $results[$nextMarker = (string)$content->Key] = [
            'name' => (string)$content->Key,
            'time' => date('Y-m-d H:i:s', strtotime((string)$content->LastModified)),
            'size' => (int)$content->Size,
            'hash' => substr((string)$content->ETag, 1, -1)
          ];

      if ($returnCommonPrefixes && isset($rest->body, $rest->body->CommonPrefixes))
        foreach ($rest->body->CommonPrefixes as $content)
          $results[(string)$content->Prefix] = ['prefix' => (string)$content->Prefix];

      if (isset($rest->body, $rest->body->NextMarker))
        $nextMarker = (string)$rest->body->NextMarker;

    } while (($rest !== false) && (((string)$rest->body->IsTruncated) == 'true'));

    return $results;
  }

  private static function getMimeByExtension($file) {
    $extension = strtolower(substr(strrchr($file, '.'), 1));
    $mime = isset(S3::$extensions[$extension][0]) ? S3::$extensions[$extension][0] : null;

    return $extensions[$extension] = $mime !== null ? $mime : 'text/plain';
  }
  
  public function putObject($filePath, $bucket, $s3Path, $acl = self::ACL_PUBLIC_READ, $amzHeaders = [], $headers = []) {
    if (!(is_file($filePath) && is_readable($filePath)))
      return false;
    
    $request = S3Request::create('PUT', $this, $bucket, $s3Path)->setHeaders(array_merge(['Content-Type' => self::getMimeByExtension($filePath), 'Content-MD5' => self::fileMD5($filePath)], $headers))->setAmzHeaders(array_merge(['x-amz-acl' => $acl], $amzHeaders))->setFile($filePath);
    
    if ($request->getSize() < 0 || $request->getFile() === null)
      return false;

    return $request->isSuccessResponse($rest) ? true : false;
  }
}