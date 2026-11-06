# 極簡核心一字多義單字圖

張老師的學生學習網站，收錄 **88 個核心單字與 1 張 mind vs. heart 比較圖**。學生可依 A–Z 索引或搜尋找字，播放英文發音，開啟並放大 4:3 教學圖。網站使用靜態 HTML、CSS、JavaScript，可直接部署到 GitHub Pages。

[開啟學生學習網站](https://t508-ksvs.github.io/minimal-core-polysemy-wordmaps/)

教學概念參考：[《超圖解秒懂核心英單》](https://isbn.ncl.edu.tw/FCKEDITOR_UploadFiles/1591341900.pdf)，田中茂範、中村俊佑著；劉芳英譯；語研學院，2020。

## 預覽

在本資料夾執行 `python -m http.server 8765`，再開啟 <http://localhost:8765/>。網站不需安裝前端套件，也不依賴外部字型或服務；發音使用瀏覽器與裝置提供的英文語音。

## 日後更新一個單字

1. 將定稿 PNG 放在原始素材資料夾，檔名採 `Codex_單字_43.png`。原始 PNG 不放進此網站。
2. 在 `data.js` 加入或修改該單字的一筆資料。索引、字母捷徑與前後導航會自動更新。
3. 執行 `python scripts/prepare_images.py --source "原始素材資料夾" 單字`，產生網站用 WebP。圖中文字須在手機放大後檢查。
4. 執行 `node scripts/check_content.js` 核對清單與圖片，再用本機預覽檢查索引、發音、字圖和手機版；確認後再推送至 GitHub Pages。

比較圖的檔名可使用 `mind_vs_heart` 這類底線名稱，並在 `data.js` 的 `comparisons` 中登錄。`scripts/prepare_images.py` 會維持原圖的像素尺寸，輸出高品質 WebP。

若一次新增多張圖，可先更新正式字圖索引，再執行 `node scripts/sync_catalog.js "正式字圖索引.md" "原始素材資料夾"`。這會依清單重建 A–Z 資料並保留已填的核心概念；新增單字的概念欄須經教師核對後再補。

## 素材與發音

- 網站只放高品質 WebP 副本；原始 PNG 由作者另行保存。
- `conduct` 等不同詞性可能有不同讀音；網站提供搭配詞的語音按鈕，實際語音仍需在學生裝置核聽。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 網站結構 |
| `styles.css` | 版面與手機樣式 |
| `data.js` | 單字及比較圖清單，日後更新的主要入口 |
| `app.js` | 索引、導覽、語音與放大功能 |
| `assets/` | 網站用高品質 WebP 字圖 |
| `scripts/prepare_images.py` | 原圖轉 WebP 並核對尺寸 |
| `scripts/check_content.js` | 核對單字資料、圖片及比較圖連結 |
| `scripts/sync_catalog.js` | 由正式字圖索引批次同步 A–Z 資料 |
