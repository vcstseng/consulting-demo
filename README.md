# 企業解題探索 / Consulting Demo

從企業問題出發，把 99 Problems、Startup Radar 與 Capability Store 放在同一個領域脈絡裡探索。三個原模組仍可獨立閱讀。

目前 UI v2：領域頁用企業問題／新創參考／能力構想三個分頁，一次顯示一種內容，返回保留位置。[修訂說明](docs/ux-revision-v2.md)。

第一輪是概念網站殼：首頁 → 十個領域整合頁 → 問題／新創／能力三種詳情，另有方案示範架構頁。中英文、暖白與深綠風格。先接入銷售的 1 個問題、1 家新創及 6 個能力；其餘九領域清楚標示內容待接入，不表示原資料庫沒有資料。

這不是已實作的顧問服務：沒有逐題 matching、自動分析、能力執行或已驗證方案。能力與例子保持原構想／虛構示例標示。

- 本機： http://127.0.0.1:4176/
- 公開網站：https://vcstseng.github.io/consulting-demo/ （發布結果見 docs/progress.md）
- GitHub：https://github.com/vcstseng/consulting-demo
- [第一輪範圍與驗證](docs/round-one.md) · [進度](docs/progress.md)
- [目錄與資料流](docs/file-directory.md) · [未來同步方式](docs/data-sync.md)

## 本機執行

Node.js 22+、Python 3，沒有第三方套件安裝需求。

```text
cd web
npm test
npm run build
npm run dev
```

資料來自 data/samples/round-one.json，來源版本記於 data/references/modules.json。web/src/engine.js 處理路由與資料驗證；app.js 呈現 UI；build.mjs 輸出 dist。來源更新不會自動改變此展示，需明確同步、檢查及重新發布。
