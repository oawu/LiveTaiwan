# 歡迎來到 Ginkgo
金黃色的秋意

---

## 初步安裝
使用之前需要安裝 [Node.js](https://nodejs.org/) 與 [Compass](http://compass-style.org/)，以下依據作業系統介紹做初步安裝：

* [Window7](cmd/doc/WindowInstall.md)
* MacOS

## 說明
* 這是一套 [OA Wu](https://www.ioa.tw/) 所製作的個人網頁前端框架！
* 主功能是快速編寫網頁，主要語言為 [HTML](https://zh.wikipedia.org/zh-tw/HTML)、[SCSS](https://sass-lang.com/guide)、[JsvaScript](https://zh.wikipedia.org/wiki/JavaScript) 的框架。
* 在 `cmd` 目錄內有 `Node.js` 檔案可以協助開發。



## 如何使用
### 開發
終端機進入專案目錄下的 `cmd 目錄`，在 cmd 目錄下執行指令 `node watch`。

> `node watch` 會開啟 `Livereload`、`Icon Fonts`、`Scss Files` 三種監聽。
> 
> * [Livereload](http://livereload.com/) - 當目錄 `js`、`css`、`img` 內的檔案與專案內的 `.html` 更新時，即會重新整理網頁。
> * [Icon Fonts](https://icomoon.io/) - 將 `font` 目錄內的 `style.css` 轉換成 `.scss` 格式。
> * [Scss Files](http://compass-style.org/) - 將 `.scss` 編譯成 `.css` 檔案。


### 部署
終端機進入專案目錄下的 `cmd 目錄`，在 cmd 目錄下執行指令 `node demo`，依據步驟完成輸入即可。

> 若是部署至 `AWS S3`，則會依據 `cmd/_dirs.yaml` 的設定，上傳。  
> 若是部署至 `AWS S3`，可以再 `cmd/libs/node/demo` 參考 `_config.js` 新增檔案 `config.js` 設定上傳的設定。


### 打包
終端機進入專案目錄下的 `cmd 目錄`，在 cmd 目錄下執行指令 `node zip`，會依據 `cmd/_dirs.yaml` 的設定，將指定的檔案做 zip 壓縮。
