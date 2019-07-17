/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const rq = require;
const Ginkgo = rq('../Ginkgo');
const qq = Ginkgo.qq;
const pp = Ginkgo.pp;
const cc = Ginkgo.cc;
const ln = Ginkgo.ln;
const pr = Ginkgo.pr;
const wp = Ginkgo.wp;

const Path = rq('path');
const root = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;
const FileSystem  = rq('fs');
const rootDiv = Path.resolve(__dirname, root) + Path.sep;
const cmdDiv = Path.resolve(__dirname, root + 'cmd') + Path.sep;
const gitDiv = Path.resolve(__dirname, root + '.git') + Path.sep;
const md5File = rq('md5-file');
const S3 = rq('aws-sdk/clients/s3');
const sepRegExp = new RegExp(qq('^' + Path.sep.replace('/', '\/') + '*|' + Path.sep.replace('/', '\/') + '*$'), 'g');
const exts = { jpg: ['image/jpeg', 'image/pjpeg'], gif: ['image/gif'], png: ['image/png', 'image/x-png'], pdf: ['application/pdf', 'application/x-download'], gz: ['application/x-gzip'], zip: ['application/x-zip', 'application/zip', 'application/x-zip-compressed'], swf: ['application/x-shockwave-flash'], tar: ['application/x-tar'], bz: ['application/x-bzip'], bz2: ['application/x-bzip2'], txt: ['text/plain'], html: ['text/html'], htm: ['text/html'], ico: ['image/x-icon'], css: ['text/css'], js: ['application/x-javascript'], xml: ['text/xml'], ogg: ['application/ogg'], wav: ['audio/x-wav', 'audio/wave', 'audio/wav'], avi: ['video/x-msvideo'], mpg: ['video/mpeg'], mov: ['video/quicktime'], mp3: ['audio/mpeg', 'audio/mpg', 'audio/mpeg3', 'audio/mp3'], mpeg: ['video/mpeg'], flv: ['video/x-flv'], php: ['application/x-httpd-php'], bin: ['application/macbinary'], psd: ['application/x-photoshop'], ai: ['application/postscript'], ppt: ['application/powerpoint', 'application/vnd.ms-powerpoint'], wbxml: ['application/wbxml'], tgz: ['application/x-tar', 'application/x-gzip-compressed'], jpeg: ['image/jpeg', 'image/pjpeg'], jpe: ['image/jpeg', 'image/pjpeg'], bmp: ['image/bmp', 'image/x-windows-bmp'], shtml: ['text/html'], text: ['text/plain'], doc: ['application/msword'], docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'], xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'], word: ['application/msword', 'application/octet-stream'], json: ['application/json', 'text/json'], svg: ['image/svg+xml'], mp2: ['audio/mpeg'], exe: ['application/octet-stream', 'application/x-msdownload'], tif: ['image/tiff'], tiff: ['image/tiff'], asc: ['text/plain'], xsl: ['text/xml'], hqx: ['application/mac-binhex40'], cpt: ['application/mac-compactpro'], csv: ['text/x-comma-separated-values', 'text/comma-separated-values', 'application/octet-stream', 'application/vnd.ms-excel', 'application/x-csv', 'text/x-csv', 'text/csv', 'application/csv', 'application/excel', 'application/vnd.msexcel'], dms: ['application/octet-stream'], lha: ['application/octet-stream'], lzh: ['application/octet-stream'], class: ['application/octet-stream'], so: ['application/octet-stream'], sea: ['application/octet-stream'], dll: ['application/octet-stream'], oda: ['application/oda'], eps: ['application/postscript'], ps: ['application/postscript'], smi: ['application/smil'], smil: ['application/smil'], mif: ['application/vnd.mif'], xls: ['application/excel', 'application/vnd.ms-excel', 'application/msexcel'], wmlc: ['application/wmlc'], dcr: ['application/x-director'], dir: ['application/x-director'], dxr: ['application/x-director'], dvi: ['application/x-dvi'], gtar: ['application/x-gtar'], php4: ['application/x-httpd-php'], php3: ['application/x-httpd-php'], phtml: ['application/x-httpd-php'], phps: ['application/x-httpd-php-source'], sit: ['application/x-stuffit'], xhtml: ['application/xhtml+xml'], xht: ['application/xhtml+xml'], mid: ['audio/midi'], midi: ['audio/midi'], mpga: ['audio/mpeg'], aif: ['audio/x-aiff'], aiff: ['audio/x-aiff'], aifc: ['audio/x-aiff'], ram: ['audio/x-pn-realaudio'], rm: ['audio/x-pn-realaudio'], rpm: ['audio/x-pn-realaudio-plugin'], ra: ['audio/x-realaudio'], rv: ['video/vnd.rn-realvideo'], log: ['text/plain', 'text/x-log'], rtx: ['text/richtext'], rtf: ['text/rtf'], mpe: ['video/mpeg'], qt: ['video/quicktime'], movie: ['video/x-sgi-movie'], xl: ['application/excel'], eml: ['message/rfc822']};

let s3 = null;

var mapDir = function(dir, filelist, options) {
  const files = FileSystem.readdirSync(dir);

  filelist = filelist || [];
  files.forEach(function(file) {
    const path = dir + file;
    if ([cmdDiv, gitDiv].indexOf(path + Path.sep) !== -1)
      return;

    if (!FileSystem.statSync(path).isDirectory())
      
      if (
        (options.hidden || file[0] !== '.') &&
        (!options.includes.length || options.includes.indexOf((path).replace(rootDiv, '')) !== -1) &&
        (!options.formats.length  || options.formats.indexOf('.' + file.split('.').pop().toLowerCase()) !== -1)
      )
        if ((stats = FileSystem.statSync(path)) && (stats.size > 0))
          return filelist.push(path);

    if (FileSystem.statSync(path).isDirectory() && options.recursive)
      filelist = mapDir(path + Path.sep, filelist, options);
  });

  return filelist;
};


var localFilesFunc = function(_v, closure) {

  let tmps = _v.dirs.map(function(dir) { return mapDir(dir.path, [], dir); }).reduce(function(a, b) { return a.concat(b); });

  pr(tmps.length);

  tmps = tmps.map(function(dir) {
    return pr() && {
      name: (_v.s3Info.folder.length ? _v.s3Info.folder + '/' : '') + wp(dir.replace(rootDiv, '')),
      hash: md5File.sync(dir),
      path: dir,
    };
  });

  return pr('') && closure(tmps);
};

var listObjects = function(_v, closure, opts, items) {
  s3.listObjectsV2(opts, function(err, data) {
    if (err)
      return pr('_', ['錯誤原因：' + cc(err.message, 'w2')]) && rq('./rollback').run(_v);
    
    items = items.concat(data.Contents.map(function(t) {
      return {
        name: t.Key,
        hash: t.ETag.replace(/^('|")(.*)\1/g, '$2'),
      };
    }));

    if (!data.IsTruncated)
      return pr(items.length) && pr('') && closure(items);

    opts.ContinuationToken = data.NextContinuationToken;
    return listObjects(_v, closure, opts, items);
  });
};

var s3FilesFunc = function(_v, closure) {
  if (!s3)
    s3 = new S3({ accessKeyId: _v.s3Info.access, secretAccessKey: _v.s3Info.secret });

  if (!s3)
    return pr('_', ['錯誤原因：' + cc('初始 S3 物件失敗！', 'w2')]) && rq('./rollback').run(_v);

  return listObjects(_v, closure, {
    Bucket: _v.s3Info.bucket,
    Prefix: _v.s3Info.folder,
  }, []);
};

var filterLocalFilesFunc = function(localFiles, s3Files, closure) {
  pr(localFiles.length);

  const tmps = localFiles.filter(function(localFile) {
    pr();
  
    for (let i = 0; i < s3Files.length; i++)
      if (s3Files[i].name == localFile.name && s3Files[i].hash == localFile.hash)
        return false;
  
    return true;
  });

  return pr('') && closure(tmps);
};

var uploadFilesFunc = function(_v, uploadFiles, closure) {
  pr(uploadFiles.length);
  
  if (!s3)
    s3 = new S3({ accessKeyId: _v.s3Info.access, secretAccessKey: _v.s3Info.secret });

  if (!s3)
    return pr('_', ['錯誤原因：' + cc('初始 S3 物件失敗！', 'w2')]) && rq('./rollback').run(_v);
  
  Promise.all(uploadFiles.map(function(uploadFile) {
    return new Promise(function(resolve, reject) {
      s3.putObject({
        Bucket: _v.s3Info.bucket,
        Key: uploadFile.name,
        Body: FileSystem.readFileSync(uploadFile.path),
        ACL: 'public-read',
        ContentType: extensions(uploadFile.path),
        // ContentMD5: Buffer.from(uploadFile.hash).toString('base64'),
        // CacheControl: 'max-age=5'
      }, function(err, data) {
        if (err) reject(err);
        else pr() && resolve(data);
      });
    });
  })).then(function() {
    return pr('') && closure(true);
  }).catch(function(err) {
    return pr('_', ['錯誤原因：' + cc(err.message, 'w2')]) && rq('./rollback').run(_v);
  });
};

var filterS3FilesFunc = function(s3Files, localFiles, closure) {
  pr(s3Files.length);

  const tmps = s3Files.filter(function(s3File) {
    pr();
  
    for (let i = 0; i < localFiles.length; i++)
      if (localFiles[i].name == s3File.name)
        return false;
    
    return true;
  });

  return pr('') && closure(tmps);
};

var deleteFilesFunc = function(_v, deleteFiles, closure) {
  pr(deleteFiles.length);
  
  if (!s3)
    s3 = new S3({ accessKeyId: _v.s3Info.access, secretAccessKey: _v.s3Info.secret });

  if (!s3)
    return pr('_', ['錯誤原因：' + cc('初始 S3 物件失敗！', 'w2')]) && rq('./rollback').run(_v);

  Promise.all(deleteFiles.map(function(deleteFile) {
    return new Promise(function(resolve, reject) {
      s3.deleteObject({
        Bucket: _v.s3Info.bucket,
        Key: deleteFile.name,
      }, function(err, data) {
        if (err) reject(err);
        else pr() && resolve(data);
      });
    });
  })).then(function() {
    return pr('') && closure(true);
  }).catch(function(err) {
    return pr('_', ['錯誤原因：' + cc(err.message, 'w2')]) && rq('./rollback').run(_v);
  });
};

var extensions = function(name) {
  return typeof exts[name.split('.').pop().toLowerCase()] === 'undefined' ? 'text/plain' : exts[name.split('.').pop().toLowerCase()][0];
};

var start = function(_v, closure) {
  pr(cc('    ➤ ', 'C') + '整理本機內檔案');
  localFilesFunc(_v, function(localFiles) {
    
    pr(cc('    ➤ ', 'C') + '取得 S3 上檔案');
    s3FilesFunc(_v, function(s3Files) {
      
      pr(cc('    ➤ ', 'C') + '過濾上傳的檔案');
      filterLocalFilesFunc(localFiles, s3Files, function(uploadFiles) {
        
        pr(cc('    ➤ ', 'C') + '上傳檔案至 S3 ');
        uploadFilesFunc(_v, uploadFiles, function(ok) {
          
          pr(cc('    ➤ ', 'C') + '過濾刪除的檔案');
          filterS3FilesFunc(s3Files, localFiles, function(deleteFiles) {
            
            pr(cc('    ➤ ', 'C') + '刪除 S3 的檔案');
            deleteFilesFunc(_v, deleteFiles, closure);
          });
        });
      });
    });
  });
};

module.exports.run = function(_v, closure) {
  pp(ln + cc(' 【讀取設定檔案】', 'y') + ln);

  rq('./dirsInfo').run(_v, function(dirs) {
    pp(ln + cc(' 【上傳至 AWS S3】', 'y') + ln);
    return start(_v, closure);
  });
};
