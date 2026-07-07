# NPOS 預約簡訊多模板系統

診所預約簡訊由單一固定格式擴增為「門市自訂模板 + 系統內建模板」，支援釘選、門市預設、套用優先序、預約發送與排程管理。純前端 HTML 原型，Vercel 靜態部署。

## 本地預覽

```bash
python3 -m http.server 8000
# 或
npx http-server -p 8000
```

瀏覽 `http://localhost:8000/prototypes/index.html`（請務必透過 HTTP Server 開啟，勿直接用 `file://`）。

## 文件導覽

| 用途 | 檔案 |
|---|---|
| 可互動原型入口 | `prototypes/index.html` |
| 前端規格（定案） | `docs/擴增需求/前端規格書.md` |
| 後端規格（工程，完整版／簡易版） | `docs/擴增需求/後端規格書.md`／`後端規格書（簡易版）.md` |
| 後端規格（PM 視角） | `docs/擴增需求/後端規格書（PM視角）.md` |
| PM 專案總覽 | `docs/擴增需求/專案經理視角.md` |
| PM 流程圖 | `prototypes/流程圖.html` |
| 套用優先序 activity diagram | `prototypes/套用優先序.puml` |

其餘原型頁面說明見 `CLAUDE.md`。

## 部署

`vercel.json` 將 `/` 導向 `prototypes/index.html`，其餘 `.html`／`.md` 靜態託管。
