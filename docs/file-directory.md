# 目前目錄與資料流

- data/imports/99-problems：正式雙語問題、原方法文件、四個合成案例頁與證據檔。
- data/imports/startup-radar：4,085 筆 catalog、21 份詳情、分類、展示去重及原補充。
- data/imports/capability-store：凍結構想／L3、原 catalog、熱門快照與導覽。
- data/imports/manifest.json：固定來源版本與 SHA-256；匯入檔案由 Git 保留原換行。
- data/references/modules.json：來源位置與本輪範圍。
- 第一輪的樣本範圍見 [第一輪紀錄](round-one.md)，已移除舊樣本檔。
- 既有案例與驗證檔收在 99 Problems 的來源快照中。
- scripts/build_integration.py：離線核對快照，轉成統一版展示資料。
- web/src/engine.js：共用 URL、原分類、OR／AND、先篩後去重及分頁。
- web/src/app.js、styles.css：沿用 v2 外框與分頁，完整模組／領域／詳情閱讀。
- web/scripts/build.mjs：呼叫資料建置並複製前端。
- web/tests：16 項完整性與行為測試。
- web/dist：執行建置時產生，由 Git 忽略。catalog.json 約 0.7 MiB，startups.json 約 3.5 MiB；startup/details、guides、case-pages、evidence 按需讀取。
- docs：目前規格、進度與驗證；round-one／ux-v2 文件保留歷史，不當作目前資料數量。

固定來源快照 → 離線驗證／轉換 → 精簡主目錄＋獨立新創索引／詳情 → 共用 UI。沒有資料庫、自動更新或來源執行程式。
