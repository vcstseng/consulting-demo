# 固定快照政策

目前只做 prototype 整合，不自動同步。三個原站更新不會立即改變此網站。

data/imports 為本輪固定快照；data/imports/manifest.json 保存來源 commit 與 71 份檔案 SHA-256。data/references/modules.json 登記來源與用途。原問題、紀錄、能力 ID 保留，不靠名稱合併。

建置只在本機／此 repo 的 CI 離線讀取快照，不連線抓原站，不執行來源 JS 或第三方 repo。99 Problems 的 JS 只取 JSON 陣列，不 eval。原 HTML 只保留被允許的靜態元素。

若之後要更新，依使用者指示替換固定快照、調整明確的完整性檢查、檢查差異後再發布。凍結版不默默追蹤 main。自動同步、排程、共用資料庫及 API 留後續。
