# NPOS Project Notes & Guidelines for Assistant (Claude)

## 📌 Recent Critical Updates

### ⚠️ [2026-07-07] 簡訊多模板跨店複製/瀏覽功能移除 (Critical Scope Change)
* **事件背景**：在早期規劃文件（如 `docs/擴增需求/後端規格書.md` 舊版）中，曾設計過「跨店複製模板」(`POST /api/sms-templates?source_id=...`) 與「跨店瀏覽」(`GET /api/sms-templates` 回傳所有門市自訂模板) 功能。
* **調整內容**：依據最新前端原型（Prototypes）及專案定案，**此項跨店功能已完全移除**。各分店只可讀取/管理「本分店自訂的模板」與「系統全域內建模板 (store_id = NULL)」，各店資料完全獨立隔離。
* **開發配合事項**：
  * 後端 `GET /api/sms-templates` 僅能回傳本門市及系統內建模板，不可回傳其他門市的自訂模板。
  * 移除所有與 `source_id` 複製功能相關之程式碼。
  * 已同步更新 `docs/擴增需求/後端規格書.md`。

---

## 🛠️ 開發常用指令與環境

### 本地伺服器預覽原型
專案原型以純前端 HTML 實作，可透過以下方式在本機以 HTTP Server 開啟：
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000
```
開啟後請瀏覽 `http://localhost:8000/prototypes/index.html`。

### 核心規格文件導航
* 前端規格定案：`docs/擴增需求/前端規格書.md`
* 後端規格（工程用，權威版）：`docs/擴增需求/後端規格書.md`
* 後端規格（PM 視角）：`docs/擴增需求/後端規格書（PM視角）.md`
* PM 專案總覽（範圍/里程碑/風險）：`docs/擴增需求/專案經理視角.md`
* PM 流程圖：`prototypes/流程圖.html`

### ⚠️ [2026-07-07] 舊專案文件已整批移除
早期「門市群組批次發送優化」專案（README.md、CHANGELOG.md、QQQ.md、優化v2.0.md、版本對比/、docs/archive/、docs/business/、docs/design/ 等）與目前的 NPOS 簡訊多模板專案是兩個不同階段的工作，已整批刪除以精簡目錄。回溯需要時用 `git checkout legacy-batch-send-archive-2026-07-07 -- <path>` 取回，不要憑印象或舊 commit 重新加回來。

### ⚠️ [2026-07-07] docs/擴增需求 精簡：移除死文件與重複版本
`後端規格書.md` 完整版（舊 v1.0，內容已過時）與 6/26 專案初版建置提示詞（`npos-sms-template.html`、`NPOS簡訊模板_提示詞.md`、`NPOS_SMS_Template_Prompt_EN.md`，資料模型與現行設計矛盾）已刪除；原本的「簡易版」規格書（唯一持續維護、內容最完整的工程規格）改名為 `後端規格書.md`。現行 `docs/擴增需求/` 只剩 4 份文件：前端規格書.md、後端規格書.md、後端規格書（PM視角）.md、專案經理視角.md（另有 2 張截圖）。回溯舊檔案內容可用 `git log` 查詢刪除前的 commit。
