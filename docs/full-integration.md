# 完整 prototype 內容整合 — 2026-11-05

## 授權與界線

使用者要求把之前三個 prototype 真正整合到已確認的 Consulting Demo UI，完成後同步 GitHub、docs 及部署。本輪固定來源版本，不建立自動同步、資料庫、matching 引擎或執行管線。原三個專案不修改。

## 內容完整性

99 Problems 全部 99 個問題保留原 ID 與中英文欄位。57 個屬企業工作，35 個屬 AI 風險與治理，7 個屬系統性影響；完整入口不受十個企業領域限制。不使用 categories.sample.json 或 problems.sample.json 的佔位內容代替正式資料。

Startup Radar 保留 4,085 原始紀錄、21 份詳情、分類／缺漏狀態、原文與 notes、網址、原人工補充及明確重複群組。只合併既有規則確認的群組，展示 4,000 筆，不宣稱已識別所有唯一公司。同名但不符合原規則者不合併。

Capability Store 保留 60 個構想與全部 L3，逐欄核對原凍結版；另外保留 84 個資源、32 個原能力主題／原導覽分類、15 個週榜快照。資源與構想分開，不把 repo 當成已驗證可執行能力。

原有顧問內容亦接入：雙語方法、解題實踐／顧問框架及治理／路線圖。四個原合成案例 F03、CS02、CS07、E93 保留雙語原案例文件及全部 15 份資料／驗證檔。這些是原 prototype 的既有記錄，不是三模組新 matching，也不是新客戶成果。文件只作靜態閱讀，移除 script／表單／執行控制，原站互動不在此重跑。

## 探索方式

- 首頁可由十個領域開始，也可直接進三個完整模組入口。
- 沿用已確認的三分頁，一次只呈現一種內容。列表每頁 20 筆，進詳情後可回原分頁、篩選、頁次與位置。
- 問題完整入口保留企業／AI／系統性範圍與原分類。
- 新創完整入口保留 25 個產業／客群、22 個工作、28 個解法大類及未知桶；同維 OR、跨維 AND。必須先篩選原始紀錄，再合併展示，不能跨重複紀錄拼 tags。候選筆數忽略本欄、保留其餘欄條件，用於 OR 擴選；列表總數才是完整交集的去重結果。
- 新創索引約 3.5 MiB，進入新創分頁才載入；21 份詳情只在打開紀錄時讀取。首頁／問題／能力不預載四千筆原文。英文列表用原文節錄，完整原文在詳情；原中文細 tags／notes 明示保留。
- 合併展示的詳情可以回查群組內每筆原摘要、細 tags、notes 與 ID。原有任一 ID 的直接連結可用。
- 能力完整入口可切換構想、資源參考、熱門快照；資源可依原主題與原導覽分類探索。
- 方案架構頁保留未來跨模組示範的位置，並提供既有框架／文件的站內閱讀入口。

## 領域與 Startup Radar 的關係

這是可回查的分類導覽，不是逐題能力 matching。僅沿用原工作維度大類；沒有依公司名稱、產業或原文臆測新功能。

| 企業領域 | 原問題／工作大類 |
| --- | --- |
| 銷售、行銷 | sales-marketing（兩者共用原大類） |
| 財務 | finance-accounting |
| 人資 | people-workforce |
| 採購、供應鏈 | supplychain-procurement（共用） |
| 營運 | operations-planning、production-quality、facilities-maintenance |
| 客服 | customer-service |
| 法務／合規 | legal-compliance |
| 管理 | operations-planning |

同一紀錄可能出現在多個領域，領域筆數不可相加；沒有對應者仍可在完整新創入口探索。分類較廣的限制在領域頁說明，不冒充精細對應。

## 固定來源與重現

來源 99 Problems commit 95dd4ffb7ee669465b8700ef313fa4761ade7358；Startup Radar commit fe001851befcec4ad8ae12d127a8e477804bee37；Capability Store 凍結 tag capability-store-prototype-v1／commit 26b3d0c8d1d43ce7509770b82f8fa635b2873a11。

data/imports/manifest.json 記錄 71 份匯入快照的 SHA-256；每次離線 build 先核對雜湊與固定數量，再產生 UI 資料。來源快照約 8.9 MiB，不納入原始未篩選 21,348 筆、未審閱候選池或原站執行程式。Git attributes 保留匯入檔案的既有位元組，避免跨平台換行讓驗證失效。

## 驗證

- 16 項 Node 測試：全量數量／原 ID／雙語欄位、60 能力逐欄一致、全部新創詳情、去重假交集防護、OR／AND、分類未知桶、非企業問題可達性、分類依據、URL 狀態、200 頁邊界、原文件安全靜態呈現、15 份原證據及全部來源雜湊。
- 瀏覽器確認十個領域的 30 個桌面分頁，以及 19 條英文手機完整列表／詳情路徑；無橫向溢出或 console error。
- 醫療＋語音交集為 24 筆，進詳情／切英文／返回保留兩個條件；第 2 頁返回保留頁次與焦點。
- Flyr 群組顯示一次，詳情可讀兩筆原始紀錄；直接連結重整可用。
- 顧問框架文件在站內可讀且不包含 script；合成案例證據保留。
- 本輪機器報告見 reviews/full-integration-data-report.json；UI 紀錄見 reviews/full-integration-browser-qa.json。

## 完成後

先交付整合 prototype 供使用者 review，不自行開始 matching、同步或產品化。公開發布結果記在 docs/progress.md。
