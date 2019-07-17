# Ginkgo in Windows

## 安裝 Git
* 若電腦已安裝，則可以跳過此步驟
* git 主要是在專案部屬到 demo 才會需要的指令，可視需求開發
* 首先至[官網下載](https://git-scm.com/download/win)
* 一樣無腦的下一步，不過其中有一步驟是選擇 git 編輯器，你可以選擇 other，然後再從資料目錄去選擇 sublime text

## 安裝 Node.js
* 無腦安裝，直接去 [官網](https://nodejs.org/en/) 下載，通常我們會選擇比較多人安裝的下載(上面會寫`Recommended For Most Users`)。
* 下載完後點兩下，無腦的下一步下一步的按下去，安裝過程中，若跳出防火牆是否同意，請記得按 `同意`。

## 安裝 compass
* [官網](http://compass-style.org/)
* 主要是參考此篇: [https://blog.wu-boy.com/2011/10/install-compass-css-authoring-framework-on-windows/](https://blog.wu-boy.com/2011/10/install-compass-css-authoring-framework-on-windows/)

#### 1. 先安裝 Ruby
* 其實在 [Ruby 下載官網](http://www.ruby-lang.org/zh_TW/downloads/) 有製作好懶人包了，我們只要下載 [RubyInstaller](http://rubyinstaller.org/) 網站別人包好的執行檔即可。
* 這邊我選擇 Ruby 2.3.3 版本下載安裝。
* 下載過程稍微注意一下 `安裝路徑` 位置。
* 然後就一樣無腦安裝，一步一步步的下一步。

#### 2. 開始安裝 Compass
* 安裝好上述執行檔，你會發現在 C 槽多了 `Ruby23` 目錄(會依據你安裝不同版本名稱不同)。

* 接著 `Windows`，輸入 `cmd` 然後 `Enter`
* 進入你剛剛安裝時所選的路徑，輸入指令：`cd C:\\Ruby23\bin`
* 更新 Gem 套件，輸入指令：`gem update --system`
* 使用 Gem 安裝 Compass，輸入指令：`gem install compass`

#### 3. 修改環境變數
* `我的電腦` > `右鍵` > `內容` > 左邊的`進階系統設定` > `環境變數`
* `點擊兩下` 變數名稱為`PATH` 的 `值`，在原本的設定值後面加上 `;C:\\Ruby23\bin`
* 然後按 `確定`，即可完成囉!

> 注意喔! C 前面有個分號!!!
> 記得，安裝完以上步驟後，若要使用 compass 的話，記得重開 Compass