# 企業解題探索 / Consulting Demo

整合 99 Problems、Startup Radar、Capability Store 的中英文概念展示。沿用共用頁首、企業領域與三種內容分頁；三個原網站仍獨立存在。

- [開啟網站](https://vcstseng.github.io/consulting-demo/)
- [完整新創探索](https://vcstseng.github.io/consulting-demo/?lang=zh&view=library&tab=startups)
- [本輪整合與限制](docs/full-integration.md) · [進度](docs/progress.md) · [來源版本](data/references/modules.json)

## 已接入內容

| 模組 | 內容 |
| --- | --- |
| 99 Problems | 全部 99 個問題：57 企業工作、35 AI 風險／治理、7 系統性問題；保留雙語原欄位 |
| Startup Radar | 4,085 筆原始紀錄，沿用明確重複群組展示 4,000 筆；三維交叉篩選、每頁 20 筆、詳情按需讀取 |
| Capability Store | 60 個雙語能力詳情、84 個原有資源參考、15 個既有 GitHub 熱門快照 |
| 原有顧問內容 | 方法、顧問框架／治理／路線圖，以及 F03、CS02、CS07、E93 的原合成案例頁與 15 份證據檔 |

十個領域是共同閱讀脈絡，不是全部資料的唯一入口。「完整資料」保留各模組的原分類。新創領域依既有工作大類關聯，部分領域共用較廣分類，不代表已逐題配對。

仍是 prototype：不做自動同步、逐題 matching 或實際能力執行；原有合成案例不是本次整合新增的客戶成果。原文件為靜態閱讀，不重跑原站互動。

## 本機

Node.js 22+、Python 3，無第三方套件安裝。

```text
cd web
npm test
npm run dev
```

npm test 先離線建置再測試；也可單獨 npm run build。預覽 http://127.0.0.1:4176/。

data/imports 保存固定來源快照與 SHA-256；scripts/build_integration.py 產生網站資料；web/src/engine.js 保留導覽、分類、篩選與去重規則；app.js 顯示共用 UI。未從來源原站即時抓取，原站更新不會自動改變本版。

[目錄與資料流](docs/file-directory.md) · [固定快照政策](docs/data-sync.md) · [來源註記](THIRD_PARTY_NOTICES.md)
