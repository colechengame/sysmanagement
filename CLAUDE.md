# CLAUDE.md - AI Assistant Guide

> **Purpose:** This document provides AI assistants with essential context about the codebase structure, development workflows, conventions, and key information needed to effectively contribute to this project.

**Last Updated:** 2025-12-05
**Project Version:** v2.3
**Language:** Traditional Chinese (zh-TW)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Core Concepts](#core-concepts)
4. [Development Workflow](#development-workflow)
5. [Code Conventions](#code-conventions)
6. [Documentation Standards](#documentation-standards)
7. [Common Tasks](#common-tasks)
8. [Important Guidelines](#important-guidelines)

---

## 📖 Project Overview

### What is this project?

**SMS Management System UI** for Dr. Shine Medical Beauty Clinic - An intelligent SMS management system designed to optimize appointment reminder costs through smart scheduling and store group management.

### Key Characteristics

- **Type:** Documentation-heavy static site with interactive HTML prototypes
- **Language:** Traditional Chinese (zh-TW) - All code comments, docs, and UI text are in Chinese
- **Tech Stack:** Pure HTML/CSS/JavaScript (no frameworks)
- **Deployment:** Vercel static hosting
- **Focus:** UI/UX prototypes and comprehensive business logic documentation
- **Primary Goal:** Reduce SMS costs by 35% through intelligent scheduling rules

### Business Context

The system implements the core principle: **"往最早的排程靠齊"** (Align to the earliest schedule)

- For the same customer on the same day in the same store group, only send SMS for the **earliest appointment**
- Manages 27 stores across 5 consumption area groups
- Implements automatic backup/replacement logic when appointments are canceled
- Includes customer qualification checks (blacklist/whitelist)

### Project Stats

- **Current Version:** v2.3
- **Total Stores:** 27 (5 grouped + 16 independent)
- **Expected Monthly Savings:** ~2,450 NTD (35% SMS cost reduction)
- **HTML/CSS/JS Files:** 8 prototype files
- **Markdown Docs:** 15+ comprehensive documentation files

---

## 🗂️ Repository Structure

```
sysmanagement/
├── CLAUDE.md                        # This file - AI assistant guide
├── README.md                        # Project overview + navigation hub
├── CHANGELOG.md                     # Version history and updates
├── 快速上手.md                        # 5-minute quick start guide
├── QQQ.md                           # UI scenario explanations
├── 優化v2.0.md                       # v2.0 optimization plan
├── 更新說明_取消預約功能.md             # Cancel appointment feature notes
├── 更新說明_移除已合併狀態.md           # Remove merged status notes
├── 最早預約邏輯說明.md                  # Earliest appointment logic
├── 活躍預約與非活躍預約邏輯.md          # Active/inactive appointment logic
├── vercel.json                      # Vercel deployment config
│
├── /prototypes                      # Interactive HTML prototypes
│   ├── index.html                   # Main navigation/homepage
│   ├── 簡訊設定教學動畫.html            # SMS setup tutorial (1st priority)
│   ├── 簡訊彈窗情境模擬.html            # Modal scenario simulation
│   ├── 預約查詢互動.html                # Appointment query interaction
│   ├── 基礎.html                     # Basic tutorial
│   ├── 發送時間互動示意.html            # Timeline demonstration
│   └── 優化.html                     # Optimization details
│
├── /docs                            # Comprehensive documentation
│   ├── /business                    # Business logic documentation
│   │   └── 核心概念.md                # ⭐ SINGLE SOURCE OF TRUTH
│   │
│   ├── /design                      # Design documentation
│   │   └── UI設計規範.md              # UI design specifications
│   │
│   ├── /technical                   # Technical documentation (referenced but not yet created)
│   │   ├── 資料庫設計.md              # Database design (referenced)
│   │   └── API文檔.md                # API documentation (referenced)
│   │
│   ├── /guides                      # User guides (referenced but not yet created)
│   │   ├── 操作員手冊.md              # Operator manual (referenced)
│   │   ├── 開發者指南.md              # Developer guide (referenced)
│   │   └── FAQ.md                   # FAQ (referenced)
│   │
│   └── /archive                     # Historical version documentation
│       ├── v2.0-完整優化方案.md
│       └── /updates
│           ├── v2.1-最早預約邏輯.md
│           ├── v2.1-活躍預約邏輯.md
│           ├── v2.2-取消預約功能.md
│           └── v2.3-移除已合併狀態.md
│
└── /版本對比                          # Version comparison archives
    ├── v0-原始版本/
    ├── v1-方案A-基礎重組版/
    ├── 優化.html
    └── 版本對比說明.md
```

### Key Entry Points

1. **README.md** - Start here for project overview and navigation
2. **docs/business/核心概念.md** - Single source of truth for all core concepts
3. **prototypes/index.html** - Interactive demo homepage
4. **CHANGELOG.md** - Version history and feature updates

---

## 🎯 Core Concepts

### CRITICAL: Single Source of Truth

**docs/business/核心概念.md** is the authoritative definition for ALL core concepts. When writing or updating documentation:

- ✅ **DO:** Link to definitions in 核心概念.md
- ❌ **DON'T:** Duplicate or redefine concepts elsewhere

### Key Business Terms

#### 1. 最早預約 (Earliest Appointment)
**Definition:** The earliest active appointment for the same member on the same day in the same store group.

**Determination:**
1. Filter: Same member (`RecordNo`) + same date + same group (`SYSGroup`) or same store
2. Exclude: Canceled, delivered, or expired appointments
3. Select: Earliest time among remaining active appointments

#### 2. 活躍預約 (Active Appointment)
**Definition:** Appointments that may still send SMS (not yet completed or invalidated).

**Criteria:**
- SMS status: `''` (unsent) or `'scheduled'` or `'failed'`
- Appointment status: Not `'cancelled'`
- Not expired: `isAppointmentExpired === false`

**IMPORTANT:** Only the earliest active appointment can perform SMS operations.

#### 3. 非活躍預約 (Inactive Appointment)
**Definition:** Appointments that will no longer send SMS.

**Categories:**
- Non-earliest appointments (active but not earliest)
- Canceled/deleted appointments (`appointmentStatus === 'cancelled'`)
- Delivered or expired appointments

**UI Display:**
- Non-earliest: Show original status with opacity 0.5, tooltip "非最早預約，不可操作"
- Canceled: Gray color #9e9e9e
- Delivered/Expired: Gray color #9e9e9e

#### 4. 自動補位 (Auto Replacement)
**Definition:** Automatic transfer of SMS sending rights to the next earliest appointment when canceling.

**Trigger Conditions:**
- ✅ Canceling appointment (`appointmentStatus` set to `'cancelled'`)
- ✅ The appointment is the earliest for that day
- ✅ There exists a next earliest active appointment

**Won't Trigger:**
- ❌ Only canceling SMS (`smsStatus` set to `'cancelled'`)
- ❌ Modifying appointment time
- ❌ Appointment is not the earliest

#### 5. 門市群組 (Store Group)
**Definition:** A collection of stores where members can consume services interchangeably.

**5 Consumption Area Groups (11 stores):**

| Group | Name | Stores | SYSGroup Value |
|-------|------|--------|----------------|
| Group 1 | 忠孝區域 | 忠孝岩盤浴、忠孝光澤 | 1 |
| Group 2 | 羅東區域 | 羅東岩盤浴、羅東光澤 | 2 |
| Group 3 | 板橋區域 | 板橋醫美、板橋岩盤浴 | 3 |
| Group 4 | 中壢彤顏區域 | 中壢彤顏健保、中壢彤顏醫美、中壢岩盤浴 | 4 |
| Group 5 | 台中區域 | 台中光澤診所、台中岩盤浴 | 5 |

**16 Independent Stores (`SYSGroup = 0`):**
南西光澤診所、永和彤顏診所、古亭光澤、大直光澤診所、新竹光澤診所、高雄光澤、八德健保診所、三重光澤、桃園岩盤浴、林口彤顏診所、台北岩盤浴、新莊光澤診所、桃園彤顏健保、三峽光澤診所、三民光澤診所、板橋光澤健保

### SMS Sending Rules

#### Rule 1: Consumption Area Group Rule (Priority)
- Same day + Same store group (`SYSGroup` matching) → Only send SMS to the earliest appointment

#### Rule 2: Single Store Rule (Secondary)
- If store not in any group (`SYSGroup = 0`) → Use "same store" rule
- Same day + Same store → Only send SMS to the earliest appointment

### Important Principles

1. **Appointments are never blocked** - All stores can create appointments freely
2. **SMS rules only affect sending logic** - Not appointment creation
3. **Each appointment corresponds to one SMS** - Optimization through "skip sending"
4. **Different groups are independent** - Operations in one group don't affect others

---

## 🔄 Development Workflow

### Git Workflow

#### Current Branch Structure

```bash
# Development branch (AI-managed)
claude/claude-md-misgbx4oqoir8go9-01ES2GTnripdJgDw1kKTy6YD

# Remote tracking
remotes/origin/claude/claude-md-misgbx4oqoir8go9-01ES2GTnripdJgDw1kKTy6YD
```

#### Commit Message Conventions

Based on recent commit history, this project uses **conventional commits** format:

```
<type>(<scope>): <description>

Examples:
- feat(prototypes): 新增簡訊設定教學動畫頁面
- fix(prototypes): 修正導航路徑使用絕對路徑
- refactor(prototypes): 優化簡訊設定教學提示文案
- style(prototypes): 調整提示訊息寬度避免過度換行
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring without changing functionality
- `style`: UI/visual changes
- `docs`: Documentation updates
- `chore`: Maintenance tasks

**Scopes:**
- `prototypes`: Changes to HTML prototype files
- `docs`: Documentation changes
- `business`: Business logic changes
- `design`: Design specification changes

#### Branch Guidelines

**CRITICAL:** Always work on the designated `claude/` branch

```bash
# Current development branch
git checkout claude/claude-md-misgbx4oqoir8go9-01ES2GTnripdJgDw1kKTy6YD

# Push with upstream tracking
git push -u origin claude/claude-md-misgbx4oqoir8go9-01ES2GTnripdJgDw1kKTy6YD
```

**Important:**
- Branch names must start with `claude/` and end with matching session ID
- Push failures with 403 indicate branch naming issues
- Retry network failures up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Deployment

**Platform:** Vercel
**Config:** `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {"src": "**/*.html", "use": "@vercel/static"},
    {"src": "**/*.md", "use": "@vercel/static"}
  ],
  "routes": [
    {"src": "/", "dest": "/prototypes/index.html"},
    // ... additional routes
  ]
}
```

**Entry Point:** `/prototypes/index.html` (homepage)

### Version Management

**Current Version:** v2.3 (as of 2025-12-05)

**Version Numbering:**
- **Major (v2.x)**: Major feature updates or architecture changes
- **Minor (vx.3)**: New features or important improvements
- **Patch (vx.x.1)**: Bug fixes or minor optimizations

**Version Documentation:**
- Current version docs: `docs/` subdirectories
- Historical updates: `docs/archive/updates/`
- Complete versions: `docs/archive/`
- Version comparisons: `版本對比/`

---

## 📝 Code Conventions

### HTML/CSS/JavaScript Standards

#### 1. Pure Vanilla JS - No Frameworks
```javascript
// ✅ Good - Using vanilla JavaScript
document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
});

// ❌ Avoid - Don't add frameworks like React, Vue, jQuery
```

#### 2. Language: Traditional Chinese

```html
<!-- ✅ Good - Chinese labels and content -->
<h1>📱 簡訊管理系統教材</h1>
<button>確認發送</button>

<!-- ❌ Avoid - English labels unless technical terms -->
<h1>SMS Management System</h1>
<button>Confirm Send</button>
```

#### 3. Inline Styles Acceptable
```html
<!-- ✅ Acceptable - Inline styles are used in this project -->
<div style="width: 100%; height: 100%; border: none;"></div>
```

#### 4. Color Palette (UI Design)

**Alert/Status Colors:**
- **danger (紅色系)**: Red background - violations, customer complaints risk
- **warning (黃色/橘色系)**: Yellow/orange - scheduling conflicts, auto-replacement notifications
- **success (綠色)**: Green - recommended actions
- **default (灰色)**: Gray - neutral, cancel actions
- **info (藍色系)**: Blue - informational messages

#### 5. Responsive Design
```css
/* Mobile-first approach */
@media (max-width: 768px) {
    .sidebar {
        left: -280px;
        transition: left 0.3s ease;
    }
}
```

#### 6. File Organization

**Prototypes:**
- Self-contained HTML files with inline CSS and JavaScript
- Can reference common styles if needed
- Use absolute paths for navigation: `/prototypes/filename.html`

```html
<!-- ✅ Good - Absolute path -->
<iframe src="/prototypes/簡訊設定教學動畫.html"></iframe>

<!-- ❌ Avoid - Relative path -->
<iframe src="./簡訊設定教學動畫.html"></iframe>
```

### JavaScript Patterns

#### 1. Function Naming
```javascript
// ✅ Good - camelCase, descriptive English names
function toggleMenu() { }
function loadContent(element, url) { }

// Chinese comments are acceptable
// 切換選單顯示狀態
function toggleMenu() { }
```

#### 2. Event Handlers
```html
<!-- ✅ Good - Inline onclick with clear function names -->
<div class="nav-item" onclick="loadContent(this, '/prototypes/page.html')">
```

#### 3. DOM Manipulation
```javascript
// ✅ Good - Modern querySelector APIs
const sidebar = document.querySelector('.sidebar');
sidebar.classList.toggle('show');

document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
});
```

---

## 📚 Documentation Standards

### Single Source of Truth Principle

**CRITICAL RULE:** `docs/business/核心概念.md` is the **only** place to define core concepts.

#### ✅ Correct Way - Reference with Links

```markdown
系統會判斷[最早預約](/docs/business/核心概念.md#最早預約)來決定發送對象。
```

#### ❌ Wrong Way - Duplicate Definition

```markdown
<!-- Don't do this! -->
最早預約是指同一會員、同一天、同一門市群組內，時間最早的活躍預約。
```

### Documentation Structure

#### 1. Header Format

```markdown
# Document Title

> Brief description or purpose statement

⏱️ **預計閱讀時間: X分鐘** (for user guides)

---
```

#### 2. Table of Contents

```markdown
## 📋 目錄

1. [Section 1](#section-1)
2. [Section 2](#section-2)
...
```

#### 3. Section Anchors

```markdown
## 1. 最早預約 (Earliest Appointment) {#最早預約}

### Definition
...

### 相關連結
- [Internal link](/docs/path/to/doc.md#anchor)
```

#### 4. Version Footer

```markdown
---

**文檔版本:** v2.3
**最後更新:** 2025-12-05
**維護單位:** Dr. Shine 簡訊管理系統專案組
```

### Markdown Conventions

#### 1. Use Emojis for Visual Clarity

```markdown
## 🎯 核心原則
### ✅ Correct
### ❌ Incorrect
💡 **為什麼?**
⚠️ **重要提示**
```

#### 2. Code Blocks with Language Tags

```markdown
```javascript
// JavaScript code
```

```bash
# Shell commands
```

```markdown
<!-- Markdown examples -->
```
```

#### 3. Tables for Structured Data

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |
```

#### 4. Alert/Info Boxes

```markdown
> ⚠️ **重要:本文檔是所有核心概念的唯一權威定義來源**
>
> 其他文檔應通過連結引用此處定義,而非重複說明。
```

### Documentation Maintenance

When modifying `docs/business/核心概念.md`:

1. ✅ Update "最後更新" (Last Updated) date
2. ✅ Check all documents that reference the concept
3. ✅ Update related links
4. ✅ Notify relevant team members

---

## 🛠️ Common Tasks

### Adding a New Prototype Page

1. **Create HTML file** in `/prototypes/`

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>頁面標題</title>
    <style>
        /* Inline styles */
    </style>
</head>
<body>
    <!-- Content -->
    <script>
        // JavaScript
    </script>
</body>
</html>
```

2. **Add navigation item** in `/prototypes/index.html`

```html
<div class="nav-item" onclick="loadContent(this, '/prototypes/新頁面.html')">
    <span class="icon">📄</span>
    <span>頁面名稱</span>
</div>
```

3. **Commit with conventional format**

```bash
git add prototypes/新頁面.html prototypes/index.html
git commit -m "feat(prototypes): 新增XXX功能頁面"
git push -u origin claude/claude-md-misgbx4oqoir8go9-01ES2GTnripdJgDw1kKTy6YD
```

### Adding New Documentation

1. **Determine category**: business / design / technical / guides / archive

2. **Create markdown file** in appropriate directory

```markdown
# Document Title

> Description

---

## Content

...

---

**文檔版本:** v2.3
**最後更新:** YYYY-MM-DD
**維護單位:** Dr. Shine 簡訊管理系統專案組
```

3. **Update README.md** if needed (add to navigation table)

4. **Link from 核心概念.md** if defining new concepts

5. **Commit**

```bash
git add docs/category/新文檔.md
git commit -m "docs(category): 新增XXX說明文檔"
git push
```

### Updating Version

1. **Update CHANGELOG.md**

```markdown
## [vX.X] - YYYY-MM-DD

### ✨ 新功能 / 🐛 Bug 修復 / 🎨 UI/UX 改進

- Change description

### 📖 文檔
詳見：[docs/archive/updates/vX.X-description.md](./docs/archive/updates/vX.X-description.md)
```

2. **Update version in relevant docs**
- README.md (footer)
- docs/business/核心概念.md (footer)
- Other documentation footers

3. **Create archive if major version**

```bash
mkdir -p docs/archive/updates/
# Create version documentation
```

### Fixing UI Issues

**Recent pattern from git history:**

```bash
# Example commits
fix(prototypes): 修正導航路徑使用絕對路徑
fix(prototypes): 調整 hint3 位置至電訪/銷開關正下方
style(prototypes): 調整提示訊息寬度避免過度換行
```

**Steps:**
1. Identify the prototype file
2. Make inline style/script changes
3. Test in browser
4. Commit with `fix(prototypes):` or `style(prototypes):` prefix

---

## ⚠️ Important Guidelines

### DO's ✅

1. **Always write in Traditional Chinese** for user-facing content
2. **Reference 核心概念.md** for all core business term definitions
3. **Use conventional commit messages** with Chinese descriptions
4. **Test prototypes in browser** before committing
5. **Update CHANGELOG.md** for significant changes
6. **Maintain single source of truth** - don't duplicate definitions
7. **Use absolute paths** in HTML navigation (`/prototypes/...`)
8. **Include version footers** in documentation
9. **Add emoji icons** for better visual clarity
10. **Keep inline styles** in prototypes (project convention)

### DON'Ts ❌

1. **Don't add JavaScript frameworks** (React, Vue, jQuery) - stay vanilla
2. **Don't create duplicate concept definitions** - link to 核心概念.md instead
3. **Don't use relative paths** in prototype navigation
4. **Don't skip CHANGELOG updates** for new features
5. **Don't modify core concepts** without updating all references
6. **Don't commit without testing** prototypes in browser
7. **Don't use English** for UI labels and user-facing text
8. **Don't create backend code** - this is a frontend-only project
9. **Don't add package.json dependencies** - pure HTML/CSS/JS only
10. **Don't push to wrong branch** - always use designated `claude/` branch

### Critical Files - Handle with Care

1. **docs/business/核心概念.md** - Single source of truth
   - Any changes require updating all dependent docs
   - Must update "最後更新" date
   - Must notify team

2. **prototypes/index.html** - Main navigation
   - Changes affect entire site navigation
   - Test all menu items after modification

3. **README.md** - Project entry point
   - Keep navigation table updated
   - Maintain accurate project statistics

4. **CHANGELOG.md** - Version history
   - Must update for all notable changes
   - Follow version numbering convention

5. **vercel.json** - Deployment config
   - Changes affect production deployment
   - Verify routes carefully

### File Naming Conventions

- **Prototypes:** Descriptive Chinese names, e.g., `簡訊設定教學動畫.html`
- **Documentation:** Descriptive Chinese names, e.g., `核心概念.md`
- **Root level:** Can mix Chinese and English, e.g., `CHANGELOG.md`, `快速上手.md`
- **Directories:** Mix of English (`/prototypes/`, `/docs/`) and Chinese (`/版本對比/`)

### When to Update Which Files

#### Adding new feature to prototype:
- [ ] Create/modify HTML in `/prototypes/`
- [ ] Update navigation in `/prototypes/index.html`
- [ ] Update `CHANGELOG.md`
- [ ] Consider updating README.md if significant
- [ ] Commit with `feat(prototypes):` prefix

#### Changing business logic:
- [ ] Update `docs/business/核心概念.md` FIRST
- [ ] Update all referencing documents
- [ ] Update related prototypes if needed
- [ ] Update `CHANGELOG.md`
- [ ] Commit with `docs(business):` prefix

#### Fixing bugs:
- [ ] Fix the issue in relevant file(s)
- [ ] Test thoroughly
- [ ] Update `CHANGELOG.md` if user-facing
- [ ] Commit with `fix(scope):` prefix

#### Updating UI/styling:
- [ ] Modify inline styles in prototype HTML
- [ ] Ensure responsive design still works
- [ ] Test on mobile viewport
- [ ] Commit with `style(prototypes):` prefix

---

## 🔍 Quick Reference

### Key URLs and Paths

```
Entry Point:        /prototypes/index.html
Documentation Hub:  /README.md
Core Concepts:      /docs/business/核心概念.md
UI Specs:           /docs/design/UI設計規範.md
Quick Start:        /快速上手.md
Changelog:          /CHANGELOG.md
```

### Git Commands Quick Reference

```bash
# Check current branch
git branch

# Switch to development branch (if needed)
git checkout claude/claude-md-misgbx4oqoir8go9-01ES2GTnripdJgDw1kKTy6YD

# Check status
git status

# Stage changes
git add <files>

# Commit with conventional format
git commit -m "<type>(<scope>): <chinese description>"

# Push to remote with upstream tracking
git push -u origin claude/claude-md-misgbx4oqoir8go9-01ES2GTnripdJgDw1kKTy6YD

# View recent commits
git log --oneline --graph -10
```

### Vercel Deployment Routes

```javascript
"/" → "/prototypes/index.html"           // Homepage
"/prototypes/*" → "/prototypes/*"        // Prototype pages
"/docs/*" → "/docs/*"                    // Documentation
"/*.md" → "/*.md"                        // Root markdown files
```

### Common Color Values

```css
/* Gradient */
background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);

/* Status Colors */
--danger: #f44336;      /* 紅色 - 危險/警告 */
--warning: #ff9800;     /* 橘色 - 警告/提醒 */
--success: #4caf50;     /* 綠色 - 成功/建議 */
--info: #2196f3;        /* 藍色 - 資訊 */
--default: #9e9e9e;     /* 灰色 - 中立/取消 */

/* Text Colors */
--text-primary: #333;
--text-white: rgba(255,255,255,0.9);
--text-muted: rgba(255,255,255,0.7);
```

### Important SYSGroup Values

```javascript
// Store Groups
SYSGroup = 0  // Independent stores (16 stores)
SYSGroup = 1  // 忠孝區域 (2 stores)
SYSGroup = 2  // 羅東區域 (2 stores)
SYSGroup = 3  // 板橋區域 (2 stores)
SYSGroup = 4  // 中壢彤顏區域 (3 stores)
SYSGroup = 5  // 台中區域 (2 stores)
```

### SMS Status Values

```javascript
smsStatus = ''            // 未發送 (unsent)
smsStatus = 'scheduled'   // 排程中 (scheduled)
smsStatus = 'failed'      // 發送失敗 (failed)
smsStatus = 'delivered'   // 已送達 (delivered)
smsStatus = 'cancelled'   // 已取消 (cancelled)
```

### Appointment Status Values

```javascript
appointmentStatus = ''           // 正常 (normal)
appointmentStatus = 'cancelled'  // 已取消 (cancelled)

isAppointmentExpired = false     // 未過期 (not expired)
isAppointmentExpired = true      // 已過期 (expired)
```

---

## 📞 Getting Help

### Documentation to Consult

1. **For business logic questions**: Read `docs/business/核心概念.md`
2. **For UI/UX questions**: Read `docs/design/UI設計規範.md`
3. **For quick overview**: Read `快速上手.md`
4. **For version history**: Read `CHANGELOG.md`
5. **For project overview**: Read `README.md`

### Understanding Change History

```bash
# View recent changes to a file
git log --oneline --follow -- path/to/file

# See what changed in a commit
git show <commit-hash>

# Compare versions
git diff <commit1> <commit2> -- path/to/file
```

### Common Issues and Solutions

#### Issue: Navigation not working in prototypes
**Solution:** Ensure using absolute paths `/prototypes/...` not relative paths

#### Issue: Concept definition inconsistency
**Solution:** Always reference `docs/business/核心概念.md` as single source of truth

#### Issue: Git push fails with 403
**Solution:** Verify branch name starts with `claude/` and ends with session ID

#### Issue: Vercel deployment not showing changes
**Solution:** Check `vercel.json` routes configuration

---

## 🎓 Learning Resources

### Understanding the Domain

To effectively work on this project, understand:

1. **SMS Management Systems** - How appointment reminders work
2. **Medical Beauty Industry** - Clinic appointment workflows
3. **Traditional Chinese** - Project language (at least basic reading)
4. **Cost Optimization** - Why "earliest appointment" rule saves money

### Key Business Scenarios (9 total)

Referenced in documentation:
- Store group rule scenarios (板橋區域, 中壢彤顏, 忠孝區域)
- Independent store scenarios (三重光澤, 高雄光澤, cross-store)
- Mixed group scenarios (group + independent combinations)
- Auto-replacement scenarios (within group, within store)

### UI Design Patterns

**5 Standard Modal Scenarios:**
1. 情境1: Standard send (標準發送)
2. 情境2: Customer rejection (客人拒收)
3. 情境3: Schedule conflict (排程衝突)
4. 情境4: Combined risk (複合風險)
5. 情境5: Auto replacement (自動補位)

---

## 📊 Project Metrics

### Success Criteria

- **SMS Cost Reduction:** Target 35% savings
- **Monthly Savings:** ~2,450 NTD (based on 10,000 appointments/month)
- **Annual Savings:** ~29,400 NTD
- **No-show Rate:** Must stay ≤5% (not increase)

### Key Performance Indicators

- 📉 SMS cost reduction percentage
- 📊 No-show rate tracking
- ⭐ Replacement decision rate (record and analyze)
- 📈 User adoption and feedback

---

## 🔄 Continuous Improvement

### When This Document Should Be Updated

- ✅ New feature added that changes workflow
- ✅ New documentation structure created
- ✅ New conventions established
- ✅ Important patterns discovered
- ✅ Common mistakes identified
- ✅ Major version release

### Update Process

1. Edit CLAUDE.md with new information
2. Update "Last Updated" date at top
3. Add to CHANGELOG.md if significant
4. Commit with `docs: 更新 CLAUDE.md` message
5. Consider notifying team if major changes

---

## ✅ Checklist for AI Assistants

Before making changes, verify:

- [ ] I understand the business context and core concepts
- [ ] I've read the relevant documentation in `docs/`
- [ ] I'm working on the correct `claude/` branch
- [ ] I'm using Traditional Chinese for user-facing content
- [ ] I'm following conventional commit message format
- [ ] I'm not duplicating definitions from `核心概念.md`
- [ ] I'm using absolute paths in HTML navigation
- [ ] I've tested any prototype changes in a browser
- [ ] I'm updating CHANGELOG.md if needed
- [ ] I'm not adding unnecessary frameworks or dependencies

---

**This guide is maintained as a living document. When in doubt, refer to existing code patterns and documentation structure.**

**Last Updated:** 2025-12-05
**Maintained by:** AI Assistants working on sysmanagement project
**Version:** 1.0
