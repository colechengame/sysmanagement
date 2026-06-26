# NPOS Appointment SMS Template System — Build Prompt (for Claude Code)

## Role & Goal

You are a frontend engineer building a single-page prototype for an "appointment SMS template parameterization and shared-template" system. It has two modes: an **Appointment mode** (apply templates, send SMS) and a **Template Builder mode** (compose templates from parameters and blocks, and maintain system-wide shared templates). Templates are shared across the whole system; "pins" and "recently used" are per-user preferences.

## Technical Requirements

- Default: vanilla HTML / CSS / JavaScript — no framework, no external CDN — output as one runnable `.html` file.
- (If using a framework) React + Vite is acceptable; logic and spec stay identical, and the data layer must remain swappable.
- Persist per-user preferences (pins, recently used, last applied template) and custom templates in `localStorage`, wrapped in try/catch with an in-memory fallback so it doesn't throw in sandboxed previews.
- Style: SaaS back-office. Clean and restrained. For a medical / TCM tone, use a jade-green primary with warm neutral grays; pins use a gold star.
- Responsive: 3-column on desktop, stacked on narrow screens; keyboard-focusable; respect `prefers-reduced-motion`.

---

## 1. Shared Data Model

### System parameters (auto-substituted at send time)
`{{會員姓名}}` (member name), `{{門市名稱}}` (store name), `{{預約日期}}` (date), `{{預約時間}}` (time), `{{班別}}` (shift), `{{醫師姓名}}` (doctor), `{{門市地址}}` (address), `{{門市電話}}` (phone)

### Manual-input parameters (filled by staff before sending, NOT auto-filled)
`{{注意事項}}` (notes), `{{其他備註}}` (remarks)
- Any template containing these must be flagged in preview with a **gold dashed marker** and a "manual input before sending" hint.

### Sample data (for live preview substitution)
```
Member:  林雅婷
Store:   京都堂 台北中山館
Date:    2026/07/03（五）
Time:    19:30
Shift:   晚診
Doctor:  陳冠宇 醫師
Address: 台北市中山區南京東路二段 101 號 3 樓
Phone:   02-2521-7788
```

### Template data structure
```
{ id, name, desc, body, creator, created, enabled, scenario:"預約簡訊" }
```
- `body` stores `{{param}}` tokens verbatim; substitution happens only on apply.
- `id` prefixed `b` = system built-in, `c` = custom.

### SMS segment estimate (CJK / UCS-2)
- char count = length of substituted plain text (manual params counted as placeholders like `〔注意事項〕`).
- segments: `len===0 → 0`; `len<=70 → 1`; otherwise `ceil(len/67)`.

---

## 2. Appointment Mode

- Left card shows 8 appointment fields: member name, store, date, time, shift (pill style), doctor, address, phone.
- "Choose SMS template" button → opens a right-side Drawer.
- Right card is a phone-style SMS preview: substitutes parameters live; system params on a green background, unfilled/manual params on gold.
- Below the preview: current template name, char count, estimated segments; show a hint row when manual params are present.
- "Send SMS" button (disabled until a template is applied); clicking shows a send toast.

### Right Drawer (template panel)
- Header label: "templates are shared; pins and recently used are personal preferences."
- Search box: live-filter by name or purpose.
- Three sections in order: **Pinned → Recently used → All templates**, each with a count badge; pinned/recent items are not duplicated in "All."
- Each card shows: name, purpose, (custom) creator + date, star/pin toggle, apply button (mark the currently applied one).
- Interactions: clicking the star pins/unpins instantly; clicking apply fills the appointment page live and updates "recently used" (move to front, cap 5).
- "New template" button → quick-add form (name, purpose, content textarea, insert-parameter buttons); on save, add to the list, auto-apply, close the form.

### Built-in example templates (5)
1. Digital CS – new client booking
2. TCM – afternoon clinic reminder
3. TCM – evening clinic reminder
4. Aesthetics – treatment booking reminder
5. General booking reminder

---

## 3. Template Builder Mode (3-column composer)

Purpose is not appointment operations, but creating and maintaining system-wide shared templates.

### Left column: Available parameters panel
- Three groups: **System (auto)** (green dot), **Manual input** (gold dot, dashed border, "fill before sending" label), **Common blocks**.
- Each parameter is a chip that can: insert at the active block's cursor on click, be dragged into a target block, show a description tooltip, and indicate its source.

### Common blocks (click to add to the editor)
Greeting, Booking info, Shift info, Store address, Check-in reminder, Notes, Remarks, Closing text. Each carries default text (with the relevant params).

### Center column: Template editor
- Top: template name and purpose inputs.
- Below: list of blocks. Each block can:
  - accept typed text directly
  - insert a param at the cursor / accept a dragged param
  - reorder via drag handle (desktop) + up/down buttons (mobile/a11y fallback)
  - toggle enabled/disabled (disabled blocks are excluded from preview and saved content)
  - be deleted
- Blocks can be added repeatedly from "Common blocks" to form combinations, e.g.:
  `[Greeting] + [Booking info] + [Store address] + [Notes] + [Closing]`

### Right column: Live preview
- Show an "applied sample data" summary.
- Phone bubble: enabled blocks joined with `\n\n`, params substituted, rendered live.
- Stats: char count, estimated SMS segments.
- Unfilled-param hint: list the manual-input fields in the template (Notes / Remarks).

### Scenario presets (one-click block combinations)
- **General booking**: `親愛的{{會員姓名}}您好，提醒您已預約{{門市名稱}}，日期：{{預約日期}}，時間：{{預約時間}}，如需異動請來電{{門市電話}}。`
- **TCM clinic**: `親愛的{{會員姓名}}您好，提醒您已預約{{門市名稱}}{{預約日期}}{{班別}}門診，請依現場叫號順序看診。`
- **New client**: Greeting + Booking info (with address) + Check-in reminder (arrive 10 min early) + Remarks.

### Save logic
- Saved fields: template name, purpose, content (composed from enabled blocks), creator, created date, enabled status, scenario (預約簡訊).
- On save, write to the shared list (`localStorage`); it immediately appears under "All templates" in the appointment Drawer, viewable and applicable by all users.

---

## 4. Interaction Acceptance Checklist

- [ ] Switch between "Appointment" and "Template Builder" modes.
- [ ] Drawer slides from the right; search filters live; pinning updates and re-sorts to top instantly; applying previews live and updates recently used.
- [ ] Quick-add form saves, adds to the list, and auto-applies.
- [ ] Builder: click a param to insert at cursor; drag a param into a block; reorder blocks by drag and by up/down; enabling/disabling a block reflects in preview instantly.
- [ ] Editing any block updates the right-column preview, char count, and segments live.
- [ ] When `{{注意事項}}` or `{{其他備註}}` is present, the preview flags them as manual-input-before-sending fields.
- [ ] After saving in Builder mode, the template appears immediately in the appointment template list.
- [ ] After a page refresh, pins, recently used, last applied template, and custom templates are remembered (local environment).

---

## 5. Out of Scope / Future (optional)

- Edit / delete / enable-toggle for custom templates.
- Make appointment data editable to test param substitution with different members.
- Scenario routing (TCM / aesthetics / new client) and permissions (who may edit shared templates).
- Multi-store / multi-BU template scope (system-wide vs single-store override).

---

## Handoff note

The accompanying file `npos-sms-template.html` is the working vanilla prototype that already implements all of the above. Treat it as the visual + behavioral reference. When porting to a framework or wiring a real backend, keep the data model, the shared-vs-personal split, and the acceptance checklist intact.
