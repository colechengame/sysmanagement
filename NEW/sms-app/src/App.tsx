import { useState } from "react";

// ===== 型別定義 =====
type ModalType = "guide-confirm" | "guide-cancel" | "info";
type GuideMode = "confirm" | "cancel" | "neutral";

type ScenarioId =
  | "scenario.becomeFirst.noPrevious"
  | "scenario.becomeFirst.replaceExisting"
  | "scenario.timeConflict.sameTime"
  | "scenario.earliest.abnormalFix"
  | "scenario.later.hasEarlier"
  | "scenario.timeConflict.secondCase"
  | "scenario.cancelEarliest.singleReplacement"
  | "scenario.cancelEarliest.multiReplacement"
  | "scenario.cancelEarliest.noReplacement";

interface ScenarioConfig {
  label: string;
  category: string;
  description: string;
  guideMode: GuideMode;
  modalType: ModalType;
  title: string;
  promptText: string;
  question?: string;
}

// ===== PM 維護的 9 筆情境文案 =====
const SCENARIO_CONFIGS: Record<ScenarioId, ScenarioConfig> = {
  "scenario.becomeFirst.noPrevious": {
    label: "成為目前最早預約（無舊排程）",
    category: "成為目前最早預約",
    description: "目前沒有任何會發簡訊的預約，這是第一筆「可以發簡訊」的預約。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText: "✓ 將為此預約排程簡訊，成為目前最早的簡訊通知。",
    question: "是否確認發送此預約的簡訊？",
  },
  "scenario.becomeFirst.replaceExisting": {
    label: "成為目前最早預約（取代舊排程）",
    category: "成為目前最早預約",
    description: "已經有一筆較晚的排程，這筆會變成新的最早預約，取代原本那筆發簡訊。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText: "⚠️ 將取代現有排程，原最早預約的簡訊將被取消。",
    question: "是否確認發送此預約的簡訊？",
  },
  "scenario.timeConflict.sameTime": {
    label: "同時間衝突：舊預約優先",
    category: "同時間衝突",
    description: "已有同時間預約，依先來後到（ID 較小）優先，新預約不會發簡訊。",
    guideMode: "confirm",
    modalType: "info",
    title: "⚠️ 注意：時間衝突",
    promptText: "✓ 根據「先來後到」規則，目前已有同時間的預約（ID 較小）將優先發送簡訊，此次新增不會發簡訊。",
    question: "是否要為這筆既有預約更新簡訊內容與發送時間？",
  },
  "scenario.earliest.abnormalFix": {
    label: "最早預約簡訊異常，提醒修正",
    category: "最早預約簡訊異常",
    description: "目前應該發簡訊的「最早預約」是未發送 / 已取消 / 發送失敗，系統提醒修正。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText: "✓ 系統偵測到最早預約簡訊異常（未發送/已取消/發送失敗），建議修正。",
    question: "是否確認發送此預約的簡訊？",
  },
  "scenario.later.hasEarlier": {
    label: "新增較晚預約：已有更早負責發簡訊",
    category: "新增較晚預約",
    description: "已有更早的預約負責發簡訊，這筆只是新增預約，不會再發簡訊。",
    guideMode: "cancel",
    modalType: "guide-cancel",
    title: "發送預覽",
    promptText: "ℹ️ 已有更早的預約負責發送簡訊，此次新增不會發簡訊。",
    question: "是否確認新增此預約？",
  },
  "scenario.timeConflict.secondCase": {
    label: "新增次早預約時發生時間衝突",
    category: "同時間衝突",
    description: "新增的預約時間與其他預約相同，依先來後到（ID 較小）優先。",
    guideMode: "confirm",
    modalType: "info",
    title: "⚠️ 注意：時間衝突",
    promptText: "✓ 根據「先來後到」規則，時間相同時優先處理 ID 較小的預約。",
    question: "是否要為此筆既有預約更新簡訊內容與發送時間？",
  },
  "scenario.cancelEarliest.singleReplacement": {
    label: "取消最早後，有唯一補位預約",
    category: "取消最早預約",
    description: "取消目前最早預約，只有一筆次早預約可補位發簡訊。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText: "✓ 最早預約已取消，系統將為次早預約發送簡訊。",
    question: "是否確認為補位預約發送簡訊？",
  },
  "scenario.cancelEarliest.multiReplacement": {
    label: "取消最早後，有多筆同時間補位",
    category: "取消最早預約",
    description: "取消最早預約後，有多筆同時間補位候選，系統自動選 ID 最小者。",
    guideMode: "confirm",
    modalType: "guide-confirm",
    title: "發送預覽",
    promptText: "✓ 最早預約已取消，系統已自動選定補位預約（多筆同時間時優先處理 ID 較小者）。",
    question: "是否確認為補位預約發送簡訊？",
  },
  "scenario.cancelEarliest.noReplacement": {
    label: "取消最早後，沒有補位",
    category: "取消最早預約",
    description: "取消最早預約後，沒有任何預約可以補位發簡訊。",
    guideMode: "neutral",
    modalType: "info",
    title: "提示",
    promptText: "⚠️ 目前沒有其他預約可以補位。",
    question: "",
  },
};

const SCENARIO_ORDER: ScenarioId[] = [
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

const BLACKLIST_WARNING_TEXT = "⚠️ 警告：此會員已被標記為黑名單，強烈建議取消發送！";

function applyBlacklistOverlay(baseModalType: ModalType, isBlacklisted: boolean): ModalType {
  if (!isBlacklisted) return baseModalType;
  return "guide-cancel";
}

function buildPromptLines(scenarioId: ScenarioId, isBlacklisted: boolean): string[] {
  const cfg = SCENARIO_CONFIGS[scenarioId];
  const lines: string[] = [];
  if (isBlacklisted) {
    lines.push(BLACKLIST_WARNING_TEXT);
  }
  lines.push(cfg.promptText);
  if (cfg.question) {
    lines.push(cfg.question);
  }
  return lines;
}

// ===== Modal 彈窗組件 =====
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: ScenarioId;
  isBlacklisted: boolean;
}

function Modal({ isOpen, onClose, scenarioId, isBlacklisted }: ModalProps) {
  if (!isOpen) return null;

  const cfg = SCENARIO_CONFIGS[scenarioId];
  const finalModalType = applyBlacklistOverlay(cfg.modalType, isBlacklisted);
  const promptLines = buildPromptLines(scenarioId, isBlacklisted);

  let confirmLabel = "確認發送";
  let cancelLabel = "取消發送";
  let confirmClass = "";
  let cancelClass = "";

  if (finalModalType === "guide-confirm") {
    confirmLabel = "確認發送";
    cancelLabel = "取消發送";
    confirmClass = "bg-emerald-600 text-white hover:bg-emerald-700";
    cancelClass = "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50";
  } else if (finalModalType === "guide-cancel") {
    confirmLabel = isBlacklisted ? "仍要發送" : "確認發送";
    cancelLabel = "取消發送";
    confirmClass = "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50";
    cancelClass = "bg-red-600 text-white hover:bg-red-700";
  } else {
    confirmLabel = "確認";
    cancelLabel = "取消";
    confirmClass = "bg-sky-600 text-white hover:bg-sky-700";
    cancelClass = "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50";
  }

  const headerBgColor =
    finalModalType === "guide-confirm"
      ? "bg-emerald-600"
      : finalModalType === "guide-cancel"
      ? "bg-red-600"
      : "bg-sky-600";

  const contentBorderColor =
    finalModalType === "guide-confirm"
      ? "border-l-4 border-emerald-500 bg-emerald-50"
      : finalModalType === "guide-cancel"
      ? "border-l-4 border-red-500 bg-red-50"
      : "border-l-4 border-sky-500 bg-sky-50";

  const messageText =
    "提醒您：有在【板橋光澤醫學美容】12/05(四) 10:30，02-0000-0000，請提前30分鐘蒞臨現場報到。";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 彈窗主體 */}
      <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 標題列 */}
          <div className={`${headerBgColor} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {cfg.title}
                {isBlacklisted && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    黑名單
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 內容區 */}
          <div className="p-6">
            {/* 簡訊內容預覽 */}
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💬</span>
                <span className="font-medium text-slate-700 text-sm">簡訊內容預覽</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{messageText}</p>
            </div>

            {/* 提示區塊 */}
            <div className={`rounded-xl p-4 mb-4 ${contentBorderColor}`}>
              {promptLines.map((line, idx) => (
                <p
                  key={idx}
                  className={`text-sm leading-relaxed ${
                    idx === 0 && isBlacklisted ? "text-red-700 font-medium" : "text-slate-700"
                  } ${idx > 0 ? "mt-2" : ""}`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* 發送時間 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                📅 簡訊發送時間
              </label>
              <input
                type="datetime-local"
                defaultValue="2025-12-04T18:00"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* 按鈕區 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${cancelClass}`}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onClose}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${confirmClass}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 預覽卡片組件 =====
interface PreviewCardProps {
  scenarioId: ScenarioId;
  isBlacklisted: boolean;
  onOpenModal: () => void;
}

function PreviewCard({ scenarioId, isBlacklisted, onOpenModal }: PreviewCardProps) {
  const cfg = SCENARIO_CONFIGS[scenarioId];
  const finalModalType = applyBlacklistOverlay(cfg.modalType, isBlacklisted);

  let badgeText = "";
  let badgeClass = "";

  if (finalModalType === "guide-confirm") {
    badgeText = "引導確認";
    badgeClass = "bg-emerald-100 text-emerald-700";
  } else if (finalModalType === "guide-cancel") {
    badgeText = "引導取消";
    badgeClass = "bg-red-100 text-red-700";
  } else {
    badgeText = "中立資訊";
    badgeClass = "bg-sky-100 text-sky-700";
  }

  const cardBorderColor =
    finalModalType === "guide-confirm"
      ? "border-emerald-200 hover:border-emerald-400"
      : finalModalType === "guide-cancel"
      ? "border-red-200 hover:border-red-400"
      : "border-sky-200 hover:border-sky-400";

  return (
    <div
      onClick={onOpenModal}
      className={`cursor-pointer rounded-xl border-2 bg-white p-5 shadow-sm transition-all hover:shadow-lg ${cardBorderColor}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
          {badgeText}
        </span>
        {isBlacklisted && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-600 text-white">
            ⚠️ 黑名單
          </span>
        )}
      </div>

      <h3 className="font-semibold text-slate-800 mb-1">{cfg.title}</h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{cfg.promptText}</p>

      <button className="w-full py-2.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition">
        點擊預覽彈窗 →
      </button>
    </div>
  );
}

// ===== 主頁面 =====
export default function SmsHintInteractivePage() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("scenario.becomeFirst.noPrevious");
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBlacklist, setModalBlacklist] = useState(false);

  const cfg = SCENARIO_CONFIGS[scenarioId];

  const openModal = (blacklist: boolean) => {
    setModalBlacklist(blacklist);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-800">
            📱 簡訊彈窗情境預覽系統
          </h1>
          <p className="mt-1 text-slate-500">
            依據「簡訊彈窗情境與文案維護表（PM 版 v1.1）」的 9 種情境互動預覽
          </p>
        </div>
      </header>

      {/* 控制面板 */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                選擇情境文案
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value as ScenarioId)}
              >
                {SCENARIO_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {SCENARIO_CONFIGS[id].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBlacklisted}
                  onChange={(e) => setIsBlacklisted(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-slate-700">模擬黑名單狀態</span>
              </label>
            </div>
          </div>

          {/* 情境說明 */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <div className="font-medium text-slate-700">{cfg.category}</div>
                <div className="text-sm text-slate-500 mt-1">{cfg.description}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 預覽卡片 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">一般狀態</h2>
            <PreviewCard
              scenarioId={scenarioId}
              isBlacklisted={false}
              onOpenModal={() => openModal(false)}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">黑名單狀態</h2>
            <PreviewCard
              scenarioId={scenarioId}
              isBlacklisted={true}
              onOpenModal={() => openModal(true)}
            />
          </div>
        </div>

        {/* 快速預覽按鈕 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => openModal(isBlacklisted)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="text-xl">🚀</span>
            開啟彈窗預覽
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        scenarioId={scenarioId}
        isBlacklisted={modalBlacklist}
      />
    </div>
  );
}
