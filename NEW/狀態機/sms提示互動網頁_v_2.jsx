const { useState } = React;

// ===== PM 維護的 9 筆情境文案 =====
const SCENARIO_CONFIGS = {
  "scenario.becomeFirst.noPrevious": {
    label: "成為目前最早預約（無舊排程）",
    category: "成為目前最早預約",
    description:
      "目前沒有任何會發簡訊的預約，這是第一筆「可以發簡訊」的預約。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText:
      "✓ 將為此預約排程簡訊，成為目前最早的簡訊通知。",
    question: "是否確認發送此預約的簡訊？",
  },
  "scenario.becomeFirst.replaceExisting": {
    label: "成為目前最早預約（取代舊排程）",
    category: "成為目前最早預約",
    description:
      "已經有一筆較晚的排程，這筆會變成新的最早預約，取代原本那筆發簡訊。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText:
      "⚠️ 將取代現有排程，原最早預約的簡訊將被取消。",
    question: "是否確認發送此預約的簡訊？",
  },
  "scenario.timeConflict.sameTime": {
    label: "同時間衝突：舊預約優先",
    category: "同時間衝突",
    description:
      "已有同時間預約，依先來後到（ID 較小）優先，新預約不會發簡訊。",
    guideMode: "confirm",
    modalType: "info",
    title: "⚠️ 注意：時間衝突",
    promptText:
      "✓ 根據「先來後到」規則，目前已有同時間的預約（ID 較小）將優先發送簡訊，此次新增不會發簡訊。",
    question:
      "是否要為這筆既有預約更新簡訊內容與發送時間？",
  },
  "scenario.earliest.abnormalFix": {
    label: "最早預約簡訊異常，提醒修正",
    category: "最早預約簡訊異常",
    description:
      "目前應該發簡訊的「最早預約」是未發送 / 已取消 / 發送失敗，系統提醒修正。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText:
      "✓ 系統偵測到最早預約簡訊異常（未發送/已取消/發送失敗），建議修正。",
    question: "是否確認發送此預約的簡訊？",
  },
  "scenario.later.hasEarlier": {
    label: "新增較晚預約：已有更早負責發簡訊",
    category: "新增較晚預約",
    description:
      "已有更早的預約負責發簡訊，這筆只是新增預約，不會再發簡訊。",
    guideMode: "cancel",
    modalType: "guide-cancel",
    title: "發送預覽",
    promptText:
      "ℹ️ 已有更早的預約負責發送簡訊，此次新增不會發簡訊。",
    question: "是否確認新增此預約？",
  },
  "scenario.timeConflict.secondCase": {
    label: "新增次早預約時發生時間衝突",
    category: "同時間衝突",
    description:
      "新增的預約時間與其他預約相同，依先來後到（ID 較小）優先。",
    guideMode: "confirm",
    modalType: "info",
    title: "⚠️ 注意：時間衝突",
    promptText:
      "✓ 根據「先來後到」規則，時間相同時優先處理 ID 較小的預約。",
    question:
      "是否要為此筆既有預約更新簡訊內容與發送時間？",
  },
  "scenario.cancelEarliest.singleReplacement": {
    label: "取消最早後，有唯一補位預約",
    category: "取消最早預約",
    description:
      "取消目前最早預約，只有一筆次早預約可補位發簡訊。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText:
      "✓ 最早預約已取消，系統將為次早預約發送簡訊。",
    question: "是否確認為補位預約發送簡訊？",
  },
  "scenario.cancelEarliest.multiReplacement": {
    label: "取消最早後，有多筆同時間補位",
    category: "取消最早預約",
    description:
      "取消最早預約後，有多筆同時間補位候選，系統自動選 ID 最小者。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText:
      "✓ 最早預約已取消，系統已自動選定補位預約（多筆同時間時優先處理 ID 較小者）。",
    question: "是否確認為補位預約發送簡訊？",
  },
  "scenario.cancelEarliest.noReplacement": {
    label: "取消最早後，沒有補位",
    category: "取消最早預約",
    description:
      "取消最早預約後，沒有任何預約可以補位發簡訊。",
    guideMode: "neutral",
    modalType: "info",
    title: "提示",
    promptText: "⚠️ 目前沒有其他預約可以補位。",
    question: "",
  },
};

const SCENARIO_ORDER = [
  "scenario.becomeFirst.noPrevious",
  "scenario.becomeFirst.replaceExisting",
  "scenario.timeConflict.sameTime",
  "scenario.earliest.abnormalFix",
  "scenario.later.hasEarlier",
  "scenario.timeConflict.secondCase",
  "scenario.cancelEarliest.singleReplacement",
  "scenario.cancelEarliest.multiReplacement",
  "scenario.cancelEarliest.noReplacement",
];

// 黑名單共用文案
const BLACKLIST_WARNING_TEXT =
  "⚠️ 警告：此會員已被標記為黑名單，強烈建議取消發送！";

function applyBlacklistOverlay(baseModalType, isBlacklisted) {
  if (!isBlacklisted) return baseModalType;
  return "guide-cancel"; // 黑名單一律引導取消
}

function buildPromptLines(scenarioId, isBlacklisted) {
  const cfg = SCENARIO_CONFIGS[scenarioId];
  const lines = [];
  if (isBlacklisted) {
    lines.push(BLACKLIST_WARNING_TEXT);
  }
  lines.push(cfg.promptText);
  if (cfg.question) {
    lines.push(cfg.question);
  }
  return lines;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SmsCard({ scenarioId, isBlacklisted, title }) {
  const cfg = SCENARIO_CONFIGS[scenarioId];
  const finalModalType = applyBlacklistOverlay(cfg.modalType, isBlacklisted);
  const promptLines = buildPromptLines(scenarioId, isBlacklisted);

  let confirmLabel = "確認發送";
  let cancelLabel = "取消發送";
  let confirmClass = "";
  let cancelClass = "";
  let badgeText = "";

  if (finalModalType === "guide-confirm") {
    badgeText = "引導【確認發送】";
    confirmLabel = "確認發送";
    cancelLabel = "取消發送";
    confirmClass = "bg-emerald-600 text-white hover:bg-emerald-700";
    cancelClass =
      "border border-slate-400 text-slate-800 bg-white hover:bg-slate-50";
  } else if (finalModalType === "guide-cancel") {
    badgeText = "引導【取消發送】";
    confirmLabel = isBlacklisted ? "仍要發送" : "確認發送";
    cancelLabel = "取消發送";
    confirmClass =
      "border border-slate-400 text-slate-800 bg-white hover:bg-slate-50";
    cancelClass = "bg-red-600 text-white hover:bg-red-700";
  } else {
    badgeText = "資訊提示 (中立)";
    confirmLabel = "確認";
    cancelLabel = "取消";
    confirmClass = "bg-sky-600 text-white hover:bg-sky-700";
    cancelClass =
      "border border-slate-400 text-slate-800 bg-white hover:bg-slate-50";
  }

  const messageText =
    "提醒您：有在【板橋光澤醫學美容】12/05(四) 10:30，02-0000-0000，請提前30分鐘蒞臨現場報到。";

  const modalBorderColor =
    finalModalType === "guide-confirm"
      ? "border-l-4 border-emerald-600 bg-emerald-50"
      : finalModalType === "guide-cancel"
      ? "border-l-4 border-red-600 bg-rose-50"
      : "border-l-4 border-sky-600 bg-sky-50";

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">{title}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
          {badgeText}
        </span>
      </div>

      <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800">
        <div className="mb-1 font-semibold text-slate-700">簡訊內容</div>
        <p>{messageText}</p>
      </div>

      <div
        className={classNames(
          "mb-4 rounded-xl border px-4 py-3 text-sm leading-relaxed text-slate-800",
          modalBorderColor
        )}
      >
        <div className="mb-1 text-sm font-semibold text-slate-900">
          {cfg.title}
          {isBlacklisted && (
            <span className="ml-2 text-xs text-red-700">(黑名單疊加)</span>
          )}
        </div>
        {promptLines.map((line, idx) => (
          <p
            key={idx}
            className={
              idx === 0
                ? "mt-1 text-[13px]"
                : "mt-1 text-[13px] text-slate-800"
            }
          >
            {line}
          </p>
        ))}
      </div>

      <div className="mb-2 text-xs font-medium text-sky-700">簡訊發送時間</div>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-slate-700">
          <span className="text-lg">📅</span>
          <input
            type="datetime-local"
            defaultValue="2025-12-04T18:00"
            className="w-full border-0 bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className={classNames(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition",
            cancelClass
          )}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={classNames(
            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition",
            confirmClass
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

function SmsHintInteractivePage() {
  const [scenarioId, setScenarioId] = useState(
    "scenario.becomeFirst.noPrevious"
  );

  const cfg = SCENARIO_CONFIGS[scenarioId];

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto mb-6 max-w-5xl text-slate-800">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          簡訊彈窗情境與按鈕狀態機互動預覽
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          依據「簡訊彈窗情境與文案維護表（PM 版 v1.1）」的 9 種情境，預覽一般狀態與「黑名單疊加」時的彈窗行為與按鈕顏色引導。
        </p>

        <div className="mt-4 flex flex-col gap-2 text-[13px] sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">情境文案：</span>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
            >
              {SCENARIO_ORDER.map((id) => (
                <option key={id} value={id}>
                  {SCENARIO_CONFIGS[id].label} ｜ {SCENARIO_CONFIGS[id].category}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            {cfg.description}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row">
        <SmsCard
          title="一般狀態（未勾選黑名單）"
          scenarioId={scenarioId}
          isBlacklisted={false}
        />
        <SmsCard
          title="黑名單狀態（勾選黑名單後）"
          scenarioId={scenarioId}
          isBlacklisted={true}
        />
      </div>
    </div>
  );
}
