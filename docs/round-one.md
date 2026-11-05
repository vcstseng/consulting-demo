# 第一輪：統一網站殼

日期：2026-11-05（Asia/Taipei）

## 完成範圍

使用同一個中英文外框與暖白／深綠視覺，呈現 L1 首頁、十個企業領域 L2、三種 L3 模板，以及方案示範架構頁。沒有 iframe 或把主要閱讀強迫導向原站。

首頁說明問題 → Consulting Agents 分析 → 方案的整體概念；分析時參考 Startup Radar 的做法與 Capability Store 的能力。領域頁依問題、外部做法、能力三區展開，可從任何區閱讀。細節頁保留目前領域、位置恢復、跨區跳轉及原站來源。

問題頁保留背景、資料、AI 與人的角色和預期改善；新創頁僅用既有摘要、原文與 tags，不補功能；能力頁沿用既有用途、例子、人工判斷與參考。三種內容並列不是逐題匹配。

## 接入內容

- 99 Problems：S02 雙語原始欄位。commit 95dd4ffb7ee669465b8700ef313fa4761ade7358，data/problems.js 與 en/data/problems.js。未使用該 repo 的 placeholder sample JSON 作正式資料。
- Startup Radar：10x，upstream-10109。commit fe001851befcec4ad8ae12d127a8e477804bee37，catalog records.json 與 details/batch-015.json。原文只有 AI Sales Teams for Dental Practices，不新增其他產品事實。依原銷售 tag 作領域參考，不配對 S02。
- Capability Store：銷售六個能力。凍結 tag capability-store-prototype-v1，commit 26b3d0c8d1d43ce7509770b82f8fa635b2873a11，business-concepts.json 與 sales-details.json。

三個原專案未修改。本輪不導入 99 題、4,085 筆或其餘 54 個能力，不把九個空白領域顯示成沒有來源內容。來源樣本是版本化快照，不會自動跟原模組更新。

## 方案示範與未來產品

方案頁呈現框定問題、評估方向、組合能力、提出驗證方式的交付結構，明示內容待補。安全與治理區分整體方案責任、個別能力限制。沒有假的執行按鈕、個案結果或自動生成方案。

未來可把資料讀取替換成 API 或同步產物，不必重做全部 UI。現在不加資料庫或帳號；matching 與案例留後面，沒有承諾已產品化。

## 驗證

- 7 項 Node 測試通過：資料範圍、十個領域、空白狀態、不跨領域洩漏、ID 與語言、來源與未執行狀態、重複與缺翻譯阻擋。
- JavaScript 語法及建置通過。
- 瀏覽器 20 個中文桌面頁（1280px）、20 個英文手機頁（375px）均正常載入、無橫向溢出、未見 console error。涵蓋首頁、十個領域、八個詳情與方案架構。
- 問題 → 同領域外部做法 → 新創詳情 → 同領域能力 → 能力詳情的路徑已檢查；切換語言保留能力與領域。
- 返回位置與焦點已確認（idea-sales-risk）；對外連結只作來源／參考，不取代主要站內閱讀。原 Startup Radar 詳情 route 已核對為 view=company。
- 圖片與逐頁紀錄：screenshots/round-one-home.jpg、reviews/round-one-browser-qa.json。

發布狀態與本輪 commit 見 docs/progress.md。完成此輪後停止，下一輪按使用者 review 決定。
