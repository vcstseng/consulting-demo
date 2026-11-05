# 完整整合 prototype

Node.js 22+、Python 3，無第三方依賴。npm test 先建置，再跑完整性測試；npm run dev 預覽 http://127.0.0.1:4176/。

L1：?lang=zh。領域 L2：?lang=zh&view=domain&domain=business-finance&tab=problems。完整模組 L2：?lang=zh&view=library&tab=startups。

L3：view=detail；kind 為 problem／startup／capability／resource／trend／guide，id 保留原 ID。origin=library 或 domain 決定返回位置；guide 由 origin=showcase 返回既有方法頁。原先樣本連結與 domain hash 分頁可相容。

URL 保存語言、分頁、頁次、分類、startup 三維多選；detail 返回復原原條件與焦點。只有打開新創列表時才讀 startups.json，只有打開公司才讀所屬 detail batch；原文件與證據亦按需載入。英文新創介紹沿用原文節錄，原文與中文細 tags／notes 保留在詳情。

build 讀 data/imports 固定來源，拒絕數量、版本雜湊、雙語或參照缺漏。GitHub workflow 先建置再測試；來源有變不會自動同步。樣本檔 data/samples 不再是建置輸入。
