# 中英文整合網站殼

Node.js 22+，不需安裝依賴。npm test、npm run build、npm run dev。預覽 http://127.0.0.1:4176/。

首頁：?lang=zh。領域：?lang=zh&view=domain&domain=business-sales。詳情：?lang=zh&view=detail&domain=business-sales&kind=problem&id=S02；kind 也可為 startup／capability。方案架構：?lang=zh&view=showcase。

網址保留 domain、kind、id、lang；返回以領域與頁型保留捲動，語言不造成重新選擇。所有詳情須同時符合 ID、模組與領域；未知連結顯示未提供，不回填別的資料。

build 讀取 data/samples/round-one.json，沒有網路同步、資料庫、matching 或執行端點。未來產品化可替換資料讀取層，不能把目前概念界線當成已實作權限。
