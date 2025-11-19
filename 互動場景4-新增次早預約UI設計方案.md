# 互動場景 4：新增次早預約時的 UI 設計方案

> **情境**: 新增次早預約 + 最早預約沒有發簡訊
> **設計原則**: 優先提示修復最早預約的簡訊狀態
> **版本**: v2.0
> **更新日期**: 2025-11-19

---

## 📋 目錄

1. [情境說明](#情境說明)
2. [設計理念](#設計理念)
3. [UI 設計方案](#ui-設計方案)
4. [程式碼實現](#程式碼實現)
5. [特殊情況處理](#特殊情況處理)
6. [測試案例](#測試案例)

---

## 📌 快速參考

### 標準提示詞格式

```
情境：新增次早預約但是最早預約簡訊未發送或已取消與傳送失敗

您新增的是次早預約時間（16:00）

{發送簡訊}後將最早預約簡訊寄送：
原最早預約（14:30）簡訊排程：
狀態：未發送 / 已取消 / 傳送失敗
預計發送：12/04(四)18:00

白色底黑色字 {取消發送}　綠色底白色字 {確認發送}
```

### 使用者操作結果

| 選擇 | 最早預約（14:30） | 次早預約（16:00） | 會員收到簡訊 |
|------|------------------|------------------|-------------|
| **確認發送** | 簡訊狀態：排程中<br>預計發送：12/04 18:00 | 簡訊狀態：未發送 | ✅ 收到（提醒 14:30） |
| **取消發送** | 簡訊狀態：未發送 | 簡訊狀態：未發送 | ❌ 不收到 |

### 核心邏輯

1. ✅ **優先修復最早預約**：提示使用者為最早預約（14:30）發送簡訊
2. ✅ **遵守 SYSGroup 規則**：次早預約（16:00）不發送簡訊
3. ✅ **清楚的選擇**：「確認發送」= 修復最早預約；「取消發送」= 維持現狀

---

## 情境說明

### 背景狀態

```
現有預約記錄：
RecordNo: BC002183
CompanyId: 板橋光澤醫美
SYSGroup: 1

最早預約 A1:
  └─ 時間: 2025-12-05(五) 14:30
  └─ SysSend: null
  └─ SysSendStatus: 0 (未發送)
  └─ 可能原因:
      • 會員在黑名單
      • 建立時選擇「不發送」
      • 簡訊被手動取消
      • 發送失敗後未重發
```

### 使用者操作

```
新增次早預約 A2:
  └─ 時間: 2025-12-05(五) 16:00
  └─ 療程: 雷射美白
  └─ 會員: 王小姐 (GT0000001)
```

### 核心問題

根據 **SYSGroup 規則**：
- ✅ 同一 SYSGroup 只有「最早預約」發送簡訊
- ❌ 次早預約不應該發送簡訊

**但現在的異常狀況是**：
- 最早預約（14:30）沒有發送簡訊 ⚠️
- 新增次早預約（16:00）時該如何處理？

---

## 設計理念

### ⭐ 核心設計原則

**優先修復最早預約的簡訊狀態，而非為次早預約破例發送**

### 為什麼這樣設計？

#### 1. 符合 SYSGroup 核心規則
```
✅ 維護系統一致性
   └─ 始終只有最早預約發簡訊
   └─ 不因異常狀況破壞規則

❌ 避免例外處理
   └─ 不為次早預約特別發送
   └─ 減少系統複雜度
```

#### 2. 引導使用者修復根本問題
```
問題根源：最早預約沒有發簡訊
正確做法：修復最早預約的簡訊
錯誤做法：繞過問題為次早預約發送
```

#### 3. 避免會員混淆
```
情境：如果為次早預約發送簡訊

會員收到：「提醒您 12/05(五) 16:00 有預約」
實際狀況：最早預約是 14:30

會員困惑：
  "我不是 14:30 有預約嗎？"
  "為什麼只提醒我 16:00？"
  "14:30 的預約取消了嗎？"
```

#### 4. 提升資料完整性
```
透過新增次早預約的時機 → 發現並修復異常狀態
確保所有最早預約都有簡訊排程
維護資料庫狀態的一致性
```

---

## UI 設計方案

### 方案 A：標準提示（推薦）

**適用情況**：最早預約簡訊未發送 / 已取消 / 傳送失敗

#### UI 視覺設計（官方版本）

```
┌─────────────────────────────────────────────────┐
│ 情境：新增次早預約但是最早預約簡訊             │
│       未發送或已取消與傳送失敗                 │
│                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                 │
│ 您新增的是次早預約時間（16:00）                  │
│                                                 │
│ {發送簡訊}後將最早預約簡訊寄送：                 │
│ 原最早預約（14:30）簡訊排程：                    │
│ 狀態：未發送                                     │
│ 預計發送：12/04(四)18:00                        │
│                                                 │
│                                                 │
│   [白色底黑色字] 取消發送                        │
│   [綠色底白色字] 確認發送                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 狀態變化版本

**狀態 1：未發送**
```
您新增的是次早預約時間（16:00）

{發送簡訊}後將最早預約簡訊寄送：
原最早預約（14:30）簡訊排程：
狀態：未發送
預計發送：12/04(四)18:00

白色底黑色字 {取消發送}　綠色底白色字 {確認發送}
```

**狀態 2：已取消**
```
您新增的是次早預約時間（16:00）

{發送簡訊}後將最早預約簡訊寄送：
原最早預約（14:30）簡訊排程：
狀態：已取消
上次取消時間：12/03(三)15:30
預計發送：12/04(四)18:00

白色底黑色字 {取消發送}　綠色底白色字 {確認發送}
```

**狀態 3：傳送失敗**
```
您新增的是次早預約時間（16:00）

{發送簡訊}後將最早預約簡訊寄送：
原最早預約（14:30）簡訊排程：
狀態：傳送失敗
失敗原因：電話號碼錯誤
預計發送：12/04(四)18:00

白色底黑色字 {取消發送}　綠色底白色字 {確認發送}
```

#### CSS 樣式

```css
/* 異常狀態提示框 */
.anomaly-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    max-width: 90vw;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 1000;
    padding: 0;
    animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, -48%);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}

.anomaly-modal-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 20px 24px;
    border-radius: 12px 12px 0 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: bold;
}

.anomaly-modal-body {
    padding: 24px;
}

/* 最早預約異常區塊 */
.earliest-appointment-warning {
    background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    border: 2px solid #ff9800;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
}

.earliest-appointment-warning h4 {
    margin: 0 0 12px 0;
    color: #e65100;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.earliest-appointment-warning ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.earliest-appointment-warning li {
    padding: 4px 0;
    color: #333;
    font-size: 14px;
}

.earliest-appointment-warning li strong {
    color: #e65100;
}

/* 新增預約資訊區塊 */
.new-appointment-info {
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
}

.new-appointment-info h4 {
    margin: 0 0 12px 0;
    color: #424242;
    font-size: 15px;
}

/* 建議處理方式區塊 */
.suggestion-section {
    margin-top: 20px;
}

.suggestion-title {
    font-size: 16px;
    font-weight: bold;
    color: #1976d2;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.suggestion-description {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 20px;
    padding: 12px;
    background: #e3f2fd;
    border-left: 4px solid #1976d2;
    border-radius: 4px;
}

/* 選項卡片 */
.option-card {
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.option-card:hover {
    border-color: #1976d2;
    background: #f5f9ff;
    transform: translateX(4px);
}

.option-card.selected {
    border-color: #1976d2;
    background: #e3f2fd;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.option-card.recommended {
    border-color: #4caf50;
}

.option-card.recommended::before {
    content: "推薦";
    position: absolute;
    top: -10px;
    right: 16px;
    background: linear-gradient(135deg, #4caf50, #388e3c);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
}

.option-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.option-radio {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.option-title {
    font-size: 15px;
    font-weight: bold;
    color: #333;
}

.option-details {
    margin-left: 32px;
    color: #666;
    font-size: 13px;
    line-height: 1.6;
}

.option-details ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
}

.option-details li {
    margin-bottom: 4px;
}

.option-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin-left: 8px;
}

.badge-success {
    background: #c8e6c9;
    color: #2e7d32;
}

.badge-warning {
    background: #fff3cd;
    color: #856404;
}

/* 提示內容樣式 */
.prompt-content {
    padding: 20px;
}

.secondary-appointment-notice {
    font-size: 16px;
    color: #333;
    margin-bottom: 20px;
    font-weight: 500;
}

.divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e0e0e0, transparent);
    margin: 20px 0;
}

.action-description {
    font-size: 15px;
    color: #555;
    margin-bottom: 16px;
    line-height: 1.6;
}

.highlight-action {
    background: #fff3cd;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
    color: #856404;
}

.earliest-info {
    background: #f8f9fa;
    border-left: 4px solid #ff9800;
    padding: 16px;
    border-radius: 4px;
    margin-top: 12px;
}

.info-line {
    margin: 8px 0;
    font-size: 14px;
    color: #333;
    line-height: 1.6;
}

.info-line:first-child {
    margin-top: 0;
}

.info-line:last-child {
    margin-bottom: 0;
}

.status-text {
    font-weight: bold;
    color: #e74c3c;
}

/* 按鈕區域（官方版本） */
.anomaly-modal-footer {
    padding: 20px 24px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.btn-action {
    padding: 12px 32px;
    border-radius: 6px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 140px;
    border: 2px solid transparent;
}

/* 白色底黑色字 */
.btn-cancel-white {
    background: white;
    color: #333;
    border-color: #d0d0d0;
}

.btn-cancel-white:hover {
    background: #f5f5f5;
    border-color: #b0b0b0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-cancel-white:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 綠色底白色字 */
.btn-confirm-green {
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    border-color: #4caf50;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-confirm-green:hover {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    border-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.btn-confirm-green:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}
```

---

### 方案 B：黑名單情境

**適用情況**：最早預約的會員在黑名單中

#### UI 視覺設計

```
┌─────────────────────────────────────────────────┐
│ 🚫 偵測到黑名單會員                              │
│                                                 │
│ 您正在新增次早預約，但系統發現：                  │
│                                                 │
│ ╔═══════════════════════════════════════════╗   │
│ ║ ⚠️ 會員在不收簡訊黑名單中                  ║   │
│ ║                                           ║   │
│ ║ • 會員：王小姐 (GT0000001)                ║   │
│ ║ • 黑名單原因：會員要求不接收簡訊           ║   │
│ ║ • 最早預約：12/05(五) 14:30               ║   │
│ ║ • 簡訊狀態：未發送 ❌                      ║   │
│ ╚═══════════════════════════════════════════╝   │
│                                                 │
│ 新增的次早預約：12/05(五) 16:00                  │
│                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                 │
│ 💡 建議處理方式                                  │
│                                                 │
│ 由於會員在黑名單中，建議：                       │
│                                                 │
│ ┌───────────────────────────────────────────┐   │
│ │ ✅ 遵守黑名單設定（推薦）                 │   │
│ │                                           │   │
│ │    • 兩筆預約都不發送簡訊                 │   │
│ │    • 尊重會員意願                         │   │
│ │    • 建議使用電話聯絡                     │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│ ┌───────────────────────────────────────────┐   │
│ │ ⚪ 移除黑名單並發送簡訊                    │   │
│ │                                           │   │
│ │    1. 先確認會員同意接收簡訊              │   │
│ │    2. 從黑名單移除會員                    │   │
│ │    3. 為最早預約排程簡訊                  │   │
│ │                                           │   │
│ │    🔒 需要主管權限                         │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│   [取消]  [確認處理]                             │
└─────────────────────────────────────────────────┘
```

---

### 方案 C：簡訊發送失敗情境

**適用情況**：最早預約的簡訊發送失敗

#### UI 視覺設計

```
┌─────────────────────────────────────────────────┐
│ ❌ 偵測到簡訊發送失敗                            │
│                                                 │
│ 您正在新增次早預約，但系統發現：                  │
│                                                 │
│ ╔═══════════════════════════════════════════╗   │
│ ║ 最早預約的簡訊發送失敗                     ║   │
│ ║                                           ║   │
│ ║ • 預約時間：12/05(五) 14:30               ║   │
│ ║ • 會員：王小姐 (0912-345-678)             ║   │
│ ║ • 簡訊狀態：發送失敗 ❌                    ║   │
│ ║ • 失敗原因：電話號碼錯誤 / 手機停機        ║   │
│ ╚═══════════════════════════════════════════╝   │
│                                                 │
│ 新增的次早預約：12/05(五) 16:00                  │
│                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                 │
│ 💡 建議處理方式                                  │
│                                                 │
│ ┌───────────────────────────────────────────┐   │
│ │ ✅ 修復並重新發送（推薦）                 │   │
│ │                                           │   │
│ │    1. 檢查並更新會員電話號碼              │   │
│ │    2. 為最早預約重新排程簡訊              │   │
│ │    3. 新增次早預約（不發送）              │   │
│ │                                           │   │
│ │    [點擊檢查會員資料]                     │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│ ┌───────────────────────────────────────────┐   │
│ │ ⚪ 改用電話聯絡                            │   │
│ │                                           │   │
│ │    • 不發送簡訊                           │   │
│ │    • 稍後用電話確認兩筆預約               │   │
│ │    • 更新聯絡狀況為「電話」               │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│   [取消]  [確認處理]                             │
└─────────────────────────────────────────────────┘
```

---

## 程式碼實現

### JavaScript 核心邏輯

```javascript
/**
 * 處理新增次早預約時最早預約沒有發簡訊的情境
 * @param {Object} earliestAppointment - 最早預約資訊
 * @param {Object} newAppointment - 新增的次早預約資訊
 */
function handleAddSecondEarliestWithEarliestNoSMS(earliestAppointment, newAppointment) {
    // 檢查最早預約的簡訊狀態
    if (!hasValidSMS(earliestAppointment)) {
        // 分析未發送原因
        const reason = analyzeNoSMSReason(earliestAppointment);

        // 根據原因顯示對應的 Modal
        showAnomalyModal(reason, earliestAppointment, newAppointment);
    } else {
        // 正常流程：直接新增次早預約（不發送簡訊）
        createSecondEarliestAppointment(newAppointment, { sendSMS: false });
    }
}

/**
 * 檢查預約是否有有效的簡訊排程
 */
function hasValidSMS(appointment) {
    const validStatuses = ['scheduled', 'delivered'];
    return validStatuses.includes(appointment.smsStatus);
}

/**
 * 分析最早預約沒有發送簡訊的原因
 */
function analyzeNoSMSReason(appointment) {
    // 1. 檢查是否在黑名單
    if (isInBlacklist(appointment.memberId)) {
        return {
            type: 'BLACKLIST',
            title: '會員在不收簡訊黑名單中',
            icon: '🚫',
            severity: 'warning'
        };
    }

    // 2. 檢查是否發送失敗
    if (appointment.smsStatus === 'failed') {
        return {
            type: 'FAILED',
            title: '簡訊發送失敗',
            icon: '❌',
            severity: 'error',
            failureReason: appointment.smsFailureReason || '未知原因'
        };
    }

    // 3. 檢查是否被取消
    if (appointment.smsStatus === 'cancelled') {
        return {
            type: 'CANCELLED',
            title: '簡訊已被取消',
            icon: '⚠️',
            severity: 'warning',
            cancelledBy: appointment.smsCancelledBy || '未知',
            cancelledAt: appointment.smsCancelledAt || null
        };
    }

    // 4. 預設：未發送
    return {
        type: 'NOT_SENT',
        title: '簡訊未發送',
        icon: '⚠️',
        severity: 'info'
    };
}

/**
 * 顯示異常處理 Modal
 */
function showAnomalyModal(reason, earliestAppointment, newAppointment) {
    const modalConfig = {
        'BLACKLIST': generateBlacklistModal,
        'FAILED': generateFailedModal,
        'CANCELLED': generateCancelledModal,
        'NOT_SENT': generateNotSentModal
    };

    const generator = modalConfig[reason.type] || generateNotSentModal;
    const modalHTML = generator(reason, earliestAppointment, newAppointment);

    // 顯示 Modal
    const modalContainer = document.createElement('div');
    modalContainer.id = 'anomalyModalContainer';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // 綁定事件
    bindModalEvents(reason.type, earliestAppointment, newAppointment);
}

/**
 * 生成標準的「未發送」Modal（官方版本）
 */
function generateNotSentModal(reason, earliest, newAppt) {
    const statusText = getStatusText(earliest.smsStatus);
    const sendTime = calculateSendTime(earliest);

    return `
        <div class="anomaly-modal-overlay" onclick="closeAnomalyModal()"></div>
        <div class="anomaly-modal">
            <div class="anomaly-modal-header">
                <span class="title">情境：新增次早預約但是最早預約簡訊未發送或已取消與傳送失敗</span>
            </div>

            <div class="anomaly-modal-body">
                <div class="prompt-content">
                    <p class="secondary-appointment-notice">
                        您新增的是次早預約時間（${newAppt.time}）
                    </p>

                    <div class="divider"></div>

                    <p class="action-description">
                        <span class="highlight-action">{發送簡訊}</span>後將最早預約簡訊寄送：
                    </p>

                    <div class="earliest-info">
                        <p class="info-line">原最早預約（${earliest.time}）簡訊排程：</p>
                        <p class="info-line">狀態：<span class="status-text">${statusText}</span></p>
                        ${getAdditionalInfo(earliest)}
                        <p class="info-line">預計發送：${sendTime}</p>
                    </div>
                </div>
            </div>

            <div class="anomaly-modal-footer">
                <button class="btn-action btn-cancel-white" onclick="handleCancelSend()">
                    取消發送
                </button>
                <button class="btn-action btn-confirm-green" onclick="handleConfirmSend()">
                    確認發送
                </button>
            </div>
        </div>
    `;
}

/**
 * 取得狀態文字
 */
function getStatusText(smsStatus) {
    const statusMap = {
        '': '未發送',
        'cancelled': '已取消',
        'failed': '傳送失敗'
    };
    return statusMap[smsStatus] || '未發送';
}

/**
 * 取得額外資訊（根據狀態）
 */
function getAdditionalInfo(earliest) {
    if (earliest.smsStatus === 'cancelled' && earliest.smsCancelledAt) {
        return `<p class="info-line">上次取消時間：${earliest.smsCancelledAt}</p>`;
    } else if (earliest.smsStatus === 'failed' && earliest.smsFailureReason) {
        return `<p class="info-line">失敗原因：${earliest.smsFailureReason}</p>`;
    }
    return '';
}

/**
 * 處理「取消發送」
 */
function handleCancelSend() {
    // 不發送簡訊，直接新增次早預約
    const newAppt = window.currentNewAppointment;
    createAppointment(newAppt, { sendSMS: false });
    closeAnomalyModal();
    showInfoToast('已新增次早預約，未排程簡訊');
}

/**
 * 處理「確認發送」
 */
function handleConfirmSend() {
    // 為最早預約發送簡訊，並新增次早預約（不發送）
    const earliest = window.currentEarliestAppointment;
    const newAppt = window.currentNewAppointment;

    // 重新排程最早預約的簡訊
    rescheduleSMS(earliest);

    // 新增次早預約（不發送）
    createAppointment(newAppt, { sendSMS: false });

    closeAnomalyModal();
    showSuccessToast('已為最早預約排程簡訊，並新增次早預約');
}

/**
 * 生成黑名單 Modal
 */
function generateBlacklistModal(reason, earliest, newAppt) {
    return `
        <div class="anomaly-modal-overlay" onclick="closeAnomalyModal()"></div>
        <div class="anomaly-modal">
            <div class="anomaly-modal-header" style="background: linear-gradient(135deg, #e53935, #c62828);">
                <span class="icon">🚫</span>
                <span class="title">偵測到黑名單會員</span>
            </div>

            <div class="anomaly-modal-body">
                <p class="intro-text">您正在新增次早預約，但系統發現：</p>

                <!-- 黑名單警告 -->
                <div class="earliest-appointment-warning" style="background: linear-gradient(135deg, #ffebee, #ffcdd2); border-color: #e53935;">
                    <h4 style="color: #b71c1c;">
                        <span class="icon">⚠️</span>
                        <span>會員在不收簡訊黑名單中</span>
                    </h4>
                    <ul>
                        <li><strong>會員：</strong>${earliest.name} (${earliest.member})</li>
                        <li><strong>黑名單原因：</strong>會員要求不接收簡訊</li>
                        <li><strong>最早預約：</strong>${earliest.date} ${earliest.time}</li>
                        <li><strong>簡訊狀態：</strong><span class="status-badge status-error">未發送 ❌</span></li>
                    </ul>
                </div>

                <div class="new-appointment-info">
                    <h4>新增的次早預約</h4>
                    <p>${newAppt.date} ${newAppt.time} - ${newAppt.treatment}</p>
                </div>

                <div class="suggestion-section">
                    <div class="suggestion-title">
                        <span>💡</span>
                        <span>建議處理方式</span>
                    </div>

                    <div class="suggestion-description">
                        由於會員在黑名單中，建議：
                    </div>

                    <!-- 選項 1：遵守黑名單 -->
                    <div class="option-card recommended selected" data-option="respect-blacklist">
                        <div class="option-header">
                            <input type="radio" name="action" value="respect-blacklist"
                                   class="option-radio" checked>
                            <span class="option-title">遵守黑名單設定</span>
                        </div>
                        <div class="option-details">
                            <ul>
                                <li>兩筆預約都不發送簡訊</li>
                                <li>尊重會員意願</li>
                                <li>建議使用電話聯絡</li>
                            </ul>
                            <span class="option-badge badge-success">✓ 推薦</span>
                        </div>
                    </div>

                    <!-- 選項 2：移除黑名單 -->
                    <div class="option-card" data-option="remove-blacklist">
                        <div class="option-header">
                            <input type="radio" name="action" value="remove-blacklist"
                                   class="option-radio">
                            <span class="option-title">移除黑名單並發送簡訊</span>
                        </div>
                        <div class="option-details">
                            <ol>
                                <li>先確認會員同意接收簡訊</li>
                                <li>從黑名單移除會員</li>
                                <li>為最早預約排程簡訊</li>
                            </ol>
                            <span class="option-badge badge-warning">🔒 需要主管權限</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="anomaly-modal-footer">
                <button class="btn-cancel" onclick="closeAnomalyModal()">取消</button>
                <button class="btn-confirm" onclick="confirmAnomalyAction()">確認處理</button>
            </div>
        </div>
    `;
}

/**
 * 生成發送失敗 Modal
 */
function generateFailedModal(reason, earliest, newAppt) {
    return `
        <div class="anomaly-modal-overlay" onclick="closeAnomalyModal()"></div>
        <div class="anomaly-modal">
            <div class="anomaly-modal-header" style="background: linear-gradient(135deg, #f44336, #d32f2f);">
                <span class="icon">❌</span>
                <span class="title">偵測到簡訊發送失敗</span>
            </div>

            <div class="anomaly-modal-body">
                <p class="intro-text">您正在新增次早預約，但系統發現：</p>

                <!-- 發送失敗警告 -->
                <div class="earliest-appointment-warning" style="background: linear-gradient(135deg, #ffebee, #ef9a9a); border-color: #f44336;">
                    <h4 style="color: #c62828;">
                        <span class="icon">📋</span>
                        <span>最早預約的簡訊發送失敗</span>
                    </h4>
                    <ul>
                        <li><strong>預約時間：</strong>${earliest.date} ${earliest.time}</li>
                        <li><strong>會員：</strong>${earliest.name} (${earliest.phone})</li>
                        <li><strong>簡訊狀態：</strong><span class="status-badge status-error">發送失敗 ❌</span></li>
                        <li><strong>失敗原因：</strong>${reason.failureReason}</li>
                    </ul>
                </div>

                <div class="new-appointment-info">
                    <h4>新增的次早預約</h4>
                    <p>${newAppt.date} ${newAppt.time} - ${newAppt.treatment}</p>
                </div>

                <div class="suggestion-section">
                    <div class="suggestion-title">
                        <span>💡</span>
                        <span>建議處理方式</span>
                    </div>

                    <!-- 選項 1：修復並重發 -->
                    <div class="option-card recommended selected" data-option="fix-and-resend">
                        <div class="option-header">
                            <input type="radio" name="action" value="fix-and-resend"
                                   class="option-radio" checked>
                            <span class="option-title">修復並重新發送</span>
                        </div>
                        <div class="option-details">
                            <ol>
                                <li>檢查並更新會員電話號碼</li>
                                <li>為最早預約重新排程簡訊</li>
                                <li>新增次早預約（不發送）</li>
                            </ol>
                            <button class="btn-check-member" onclick="openMemberEditor('${earliest.memberId}')">
                                點擊檢查會員資料
                            </button>
                        </div>
                    </div>

                    <!-- 選項 2：改用電話 -->
                    <div class="option-card" data-option="use-phone">
                        <div class="option-header">
                            <input type="radio" name="action" value="use-phone"
                                   class="option-radio">
                            <span class="option-title">改用電話聯絡</span>
                        </div>
                        <div class="option-details">
                            <ul>
                                <li>不發送簡訊</li>
                                <li>稍後用電話確認兩筆預約</li>
                                <li>更新聯絡狀況為「電話」</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="anomaly-modal-footer">
                <button class="btn-cancel" onclick="closeAnomalyModal()">取消</button>
                <button class="btn-confirm" onclick="confirmAnomalyAction()">確認處理</button>
            </div>
        </div>
    `;
}

/**
 * 綁定 Modal 事件
 */
function bindModalEvents(reasonType, earliest, newAppt) {
    // 選項卡片點擊事件
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            // 移除其他選項的 selected
            document.querySelectorAll('.option-card').forEach(c => {
                c.classList.remove('selected');
            });
            // 添加 selected
            this.classList.add('selected');
            // 勾選 radio
            this.querySelector('input[type="radio"]').checked = true;
        });
    });

    // Radio 按鈕變更事件
    document.querySelectorAll('input[name="action"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.option-card').forEach(card => {
                card.classList.remove('selected');
            });
            this.closest('.option-card').classList.add('selected');
        });
    });
}

/**
 * 確認異常處理操作
 */
function confirmAnomalyAction() {
    const selectedAction = document.querySelector('input[name="action"]:checked').value;
    const earliestAppointment = window.currentEarliestAppointment;
    const newAppointment = window.currentNewAppointment;

    switch(selectedAction) {
        case 'send-earliest':
            // 為最早預約發送簡訊，新增次早預約（不發送）
            rescheduleSMS(earliestAppointment);
            createAppointment(newAppointment, { sendSMS: false });
            showSuccessToast('已為最早預約排程簡訊，並新增次早預約');
            break;

        case 'no-send':
            // 兩筆都不發送
            createAppointment(newAppointment, { sendSMS: false });
            showWarningToast('已新增預約，但兩筆預約都未排程簡訊');
            break;

        case 'later':
            // 稍後處理
            createAppointment(newAppointment, { sendSMS: false });
            showInfoToast('已新增預約，請記得稍後為最早預約排程簡訊');
            break;

        case 'respect-blacklist':
            // 遵守黑名單
            createAppointment(newAppointment, { sendSMS: false });
            updateContactStatus(newAppointment.id, 'phone');
            showSuccessToast('已新增預約，遵守黑名單設定');
            break;

        case 'remove-blacklist':
            // 移除黑名單（需權限檢查）
            if (!checkManagerPermission()) {
                showError('此操作需要主管權限');
                return;
            }
            removeFromBlacklist(earliestAppointment.memberId);
            rescheduleSMS(earliestAppointment);
            createAppointment(newAppointment, { sendSMS: false });
            showSuccessToast('已移除黑名單並排程簡訊');
            break;

        case 'fix-and-resend':
            // 修復並重發
            // 這裡應該先讓使用者檢查/更新會員資料
            showMemberEditor(earliestAppointment.memberId, function() {
                rescheduleSMS(earliestAppointment);
                createAppointment(newAppointment, { sendSMS: false });
                showSuccessToast('已更新會員資料並重新排程簡訊');
            });
            return; // 不關閉 modal，等待會員資料更新完成

        case 'use-phone':
            // 改用電話
            createAppointment(newAppointment, { sendSMS: false });
            updateContactStatus(earliestAppointment.id, 'phone');
            updateContactStatus(newAppointment.id, 'phone');
            showInfoToast('已新增預約，請記得用電話聯絡確認');
            break;
    }

    closeAnomalyModal();
}

/**
 * 關閉異常處理 Modal
 */
function closeAnomalyModal() {
    const container = document.getElementById('anomalyModalContainer');
    if (container) {
        container.remove();
    }
}

/**
 * 計算簡訊發送時間
 */
function calculateSendTime(appointment) {
    const appointmentDate = new Date(appointment.date + ' ' + appointment.time);
    const now = new Date();

    // 計算前一天 18:00
    const dayBefore = new Date(appointmentDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dayBefore.setHours(18, 0, 0, 0);

    // 如果前一天 18:00 已經過了，則改為療程前 1 小時
    if (dayBefore < now) {
        const oneHourBefore = new Date(appointmentDate);
        oneHourBefore.setHours(oneHourBefore.getHours() - 1);
        return formatDateTime(oneHourBefore);
    }

    return formatDateTime(dayBefore);
}

/**
 * 格式化日期時間
 */
function formatDateTime(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${month}/${day}(${weekday}) ${hour}:${minute}`;
}

/**
 * 重新排程簡訊
 */
function rescheduleSMS(appointment) {
    const sendTime = calculateSendTime(appointment);

    // 更新資料庫
    updateAppointmentSMS(appointment.id, {
        SysSend: sendTime,
        SysSendStatus: 1,
        smsStatus: 'scheduled'
    });

    // 排程簡訊任務
    scheduleSMSTask(appointment.id, sendTime);
}

/**
 * 建立預約
 */
function createAppointment(appointment, options = {}) {
    const appointmentData = {
        ...appointment,
        SysSend: options.sendSMS ? calculateSendTime(appointment) : null,
        SysSendStatus: options.sendSMS ? 1 : 0,
        smsStatus: options.sendSMS ? 'scheduled' : ''
    };

    // 呼叫 API 建立預約
    apiCreateAppointment(appointmentData);
}
```

---

## 特殊情況處理

### 情況 1：最早預約簡訊已取消

**背景**：
- 最早預約的簡訊被手動取消（status: cancelled）
- 可能原因：已電話確認、會員要求取消等

**處理邏輯**：
```javascript
if (earliestAppointment.smsStatus === 'cancelled') {
    // 詢問使用者是否要重新發送
    showConfirmDialog({
        title: '最早預約的簡訊已被取消',
        message: `
            最早預約（${earliest.time}）的簡訊已於
            ${earliest.smsCancelledAt} 被 ${earliest.smsCancelledBy} 取消。

            是否要重新為最早預約排程簡訊？
        `,
        options: [
            {
                label: '重新排程簡訊',
                value: 'resend',
                primary: true
            },
            {
                label: '維持取消狀態',
                value: 'keep-cancelled'
            }
        ]
    });
}
```

---

### 情況 2：會員有多筆同日預約

**背景**：
- 會員在同一天已有多筆預約
- 新增的次早預約可能是第三筆、第四筆等

**處理邏輯**：
```javascript
function handleMultipleAppointments(memberId, newAppointment) {
    // 取得會員當天所有預約
    const appointments = getAppointmentsByMemberAndDate(
        memberId,
        newAppointment.date
    );

    // 排序找出最早預約
    appointments.sort((a, b) =>
        parseTime(a.time) - parseTime(b.time)
    );

    const earliest = appointments[0];

    // 顯示完整預約列表
    showMultipleAppointmentsWarning({
        earliest: earliest,
        existing: appointments,
        new: newAppointment
    });
}
```

**UI 提示**：
```
⚠️ 會員當天有多筆預約

最早預約：14:30 - 雷射除斑 [簡訊：未發送 ❌]
現有預約：16:00 - 電波拉提 [簡訊：無]
新增預約：18:00 - 超音波導入 [簡訊：?]

建議：為最早預約（14:30）排程簡訊
```

---

### 情況 3：跨門市預約

**背景**：
- 最早預約在門市 A
- 新增的次早預約在門市 B
- 但屬於同一 SYSGroup

**處理邏輯**：
```javascript
if (earliestAppointment.storeId !== newAppointment.storeId) {
    // 顯示跨門市提示
    showCrossStoreWarning({
        earliestStore: getStoreName(earliestAppointment.storeId),
        newStore: getStoreName(newAppointment.storeId),
        sameGroup: earliestAppointment.SYSGroup === newAppointment.SYSGroup
    });
}
```

**UI 提示**：
```
💡 跨門市預約提醒

最早預約：板橋光澤醫美 - 14:30
新增預約：板橋岩盤浴 - 16:00

兩者屬於同一 SYSGroup，簡訊將只提醒最早的門市預約。

建議簡訊內容包含兩個門市的資訊：
"提醒您今天有兩筆預約：
 14:30 板橋光澤醫美
 16:00 板橋岩盤浴"
```

---

## 測試案例

### 測試案例 1：標準流程

**測試步驟**：
1. 建立最早預約：12/05 14:30（未發送簡訊）
2. 新增次早預約：12/05 16:00
3. 系統彈出異常 Modal
4. 選擇「為最早預約發送簡訊」
5. 確認

**預期結果**：
```
✓ 最早預約（14:30）簡訊狀態：排程中
✓ 次早預約（16:00）簡訊狀態：未發送
✓ 顯示成功提示：「已為最早預約排程簡訊」
```

---

### 測試案例 2：黑名單會員

**測試步驟**：
1. 會員在黑名單
2. 建立最早預約：12/05 14:30（未發送）
3. 新增次早預約：12/05 16:00
4. 系統彈出黑名單 Modal
5. 選擇「遵守黑名單設定」
6. 確認

**預期結果**：
```
✓ 最早預約（14:30）簡訊狀態：未發送
✓ 次早預約（16:00）簡訊狀態：未發送
✓ 聯絡狀況：建議設為「電話」
✓ 顯示提示：「已新增預約，遵守黑名單設定」
```

---

### 測試案例 3：發送失敗修復

**測試步驟**：
1. 最早預約：12/05 14:30（簡訊發送失敗）
2. 新增次早預約：12/05 16:00
3. 系統彈出發送失敗 Modal
4. 點擊「檢查會員資料」
5. 更新正確電話號碼
6. 選擇「修復並重新發送」
7. 確認

**預期結果**：
```
✓ 會員電話已更新
✓ 最早預約（14:30）簡訊狀態：排程中
✓ 次早預約（16:00）簡訊狀態：未發送
✓ 顯示提示：「已更新會員資料並重新排程簡訊」
```

---

### 測試案例 4：權限檢查

**測試步驟**：
1. 黑名單會員
2. 新增次早預約
3. 選擇「移除黑名單並發送簡訊」
4. 使用一般員工帳號確認

**預期結果**：
```
✓ 顯示錯誤提示：「此操作需要主管權限」
✓ Modal 不關閉
✓ 可以重新選擇其他選項
```

---

### 測試案例 5：取消操作

**測試步驟**：
1. 新增次早預約觸發 Modal
2. 點擊「取消」按鈕

**預期結果**：
```
✓ Modal 關閉
✓ 次早預約未被建立
✓ 最早預約狀態不變
✓ 回到預約頁面
```

---

## 📊 設計決策總結

### ✅ 為什麼優先提示修復最早預約？

| 理由 | 說明 |
|------|------|
| **1. 符合 SYSGroup 規則** | 始終維持「最早預約發簡訊」的核心邏輯 |
| **2. 避免會員困惑** | 會員收到的簡訊時間與實際最早預約一致 |
| **3. 資料一致性** | 確保所有最早預約都有簡訊排程 |
| **4. 引導正確操作** | 教育使用者修復問題而非繞過問題 |
| **5. 減少例外處理** | 系統邏輯更簡單、更好維護 |

### 🎯 使用者體驗優化

1. **清楚的視覺層級**
   - 用顏色區分警告程度（黃色/紅色）
   - 推薦選項明顯標示

2. **完整的資訊揭露**
   - 顯示最早預約的詳細資訊
   - 說明為什麼沒有發簡訊
   - 列出所有處理選項

3. **智能預設選項**
   - 自動選擇最合適的處理方式
   - 減少使用者思考負擔

4. **安全機制**
   - 權限檢查（黑名單移除）
   - 確認對話框（避免誤操作）

---

## 🔗 相關文檔

- [情境堆疊實例完整文檔.md](./情境堆疊實例完整文檔.md)
- [最終版本開發邏輯.md](./最終版本開發邏輯.md)
- [預約查詢互動.html](./預約查詢互動.html)

---

**文檔結束**
