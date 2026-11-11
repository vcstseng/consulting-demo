# 固定快照政策

99 Problems、Startup Radar 與 Capability Store 以固定快照整合。更新這三個模組的站內資料時，需要替換來源快照並重新建置。

data/imports 為本輪固定快照；data/imports/manifest.json 保存來源 commit 與 71 份檔案 SHA-256。data/references/modules.json 登記來源與用途。原問題、紀錄、能力 ID 保留，不靠名稱合併。

建置只在本機／此 repo 的 CI 離線讀取快照，不連線抓原站，不執行來源 JS 或第三方 repo。99 Problems 的 JS 只取 JSON 陣列，不 eval。原 HTML 只保留被允許的靜態元素。

若之後要更新，依使用者指示替換固定快照、調整明確的完整性檢查、檢查差異後再發布。凍結版不默默追蹤 main。自動同步、排程、共用資料庫及 API 留後續。

## AI 方法庫連結

Consulting Demo 的領域頁、完整研究庫與既有方法庫網址共用同一份站內索引。CS02 另有部署情境重驗參考。完整方法正文與來源由原站維護。

## 方法庫站內索引

web/data/methodology.json 保存方法庫來源 commit、六個主題、35 題的中英文標題及簡介、原站網址與方法 ID。建置檢查數量、引用、主題歸屬和雙語欄位後輸出；方法分頁按需讀取。英文題目與簡介由 Portal 整理，完整方法仍以原站為準。此索引目前按發布版本更新。

方法詳情外殼只讀取既有方法名稱與原站網址。中文方法名稱在英文介面保留原文並標示，站內正文待後續整理。
