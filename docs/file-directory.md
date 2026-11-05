# 目錄與資料流

- web/src/app.js、styles.css：統一外框、內容模板、語言與互動。
- web/src/engine.js：網址、領域取資料、詳情識別與資料驗證，與 UI 分開。
- web/scripts/build.mjs：離線建置，將固定樣本轉為網站資料。
- web/tests：與範圍、導覽及來源相關的測試。
- web/dist：忽略版控的本機／發布產物。
- data/samples/round-one.json：本輪八筆展示內容與十個領域；非完整資料庫。
- data/references/modules.json：原模組 URL／commit／固定標記。
- data/cases：後續案例預留，仍無案例或 matching。
- docs：決策、範圍、來源、同步政策、進度與檢查紀錄。
- .github/workflows：GitHub Pages 建置發布。

顯示資料從 data/samples → build 驗證 → web/dist/data/catalog.json → 共用 UI 讀取。未來可以替換資料接入層，保留外框與穩定 ID；目前不需要後端或第三方套件。
