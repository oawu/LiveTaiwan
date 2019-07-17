require 'compass/import-once/activate'

# 預設編碼
Encoding.default_external = "utf-8"

# 網域(domain)後面的目錄
http_path = "/Ginkgo"

# 字體目錄與網址下的字體目錄
fonts_dir = "font"
fonts_path = "../font"

# 圖片目錄與網址下的圖片目錄
images_dir = "img"
images_path = "../img"

# css 目錄與 scss 目錄
css_dir = "../css"
sass_dir = "../scss"

# js 目錄與網址下的 js 目錄，目前沒發現在哪邊用到..
javascripts_dir = "js"
javascripts_path = "../js"

# 其他要匯入的資源
  # add_import_path = "./libs"
additional_import_paths = ["./libs/scss"]

# 選擇輸出的 css 類型，:expanded or :nested or :compact or :compressed
  # nested     有縮排 沒壓縮，會有 @charset "UTF-8";
  # expanded   沒縮排 沒壓縮，會有 @charset "UTF-8";
  # compact    有換行 有壓縮(半壓縮)，會有 @charset "UTF-8";
  # compressed 沒縮排 有壓縮(全壓縮)，沒有 @charset "UTF-8";
output_style = :compact

# 在 css 中加入註解相對應於 scss 的第幾行，false、true
  # false     不需加入註解
  # true      需要加入註解
line_comments = false

# 是否使用相對位置，若是仰賴 http_path 則設為 false
  # relative_assets = false
relative_assets = true
