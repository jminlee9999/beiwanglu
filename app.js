/* =========================================================
   拾光备忘 · 应用逻辑
   纯前端、本地优先，所有数据保存在当前浏览器。
   ========================================================= */

(() => {
  "use strict";

  /* ---------------- Constants ---------------- */

  const DB_NAME = "shiguang-memo";
  const DB_VERSION = 1;
  const DB_STORE = "state";
  const DB_KEY = "app";
  const FALLBACK_KEY = "shiguang-memo:state:v1";
  const APP_VERSION = "1.2.1";
  const MAX_MEDIA = 6;
  const MAX_VIDEOS = 2;
  const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
  const MAX_IMAGE_BYTES = 30 * 1024 * 1024;
  const MAX_MEDIA_DATA_URL = 40_000_000;
  const DATA_VERSION = 2;
  const BACKUP_FILENAME = "shiguang-backup.json";
  const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const ROUTES = ["home", "plan", "done", "daily", "favorites"];

  const ROUTE_META = {
    home: { title: "我的备忘录" },
    plan: {
      title: "计划",
      kicker: "我的列表",
      icon: "calendar",
      tone: "plan",
      desc: "想做的事，一件一件来。",
    },
    done: {
      title: "已完成",
      kicker: "我的列表",
      icon: "checkCircle",
      tone: "done",
      desc: "认真生活的证据，都在这里。",
    },
    daily: {
      title: "日常记录",
      kicker: "我的列表",
      icon: "note",
      tone: "daily",
      desc: "留住今天，哪怕只是一点点。",
    },
    favorites: {
      title: "好物收藏",
      kicker: "我的列表",
      icon: "heart",
      tone: "favorite",
      desc: "心动的东西，值得被记住。",
    },
  };

  /* ---------------- Icons ---------------- */

  const ICON_PATHS = {
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m19.3 19.3-4.2-4.2"/>',
    more:
      '<circle cx="5" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.15" fill="currentColor" stroke="none"/>',
    calendar:
      '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 9.5h17"/><path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2" stroke-width="1.5"/>',
    check: '<path d="m5 12.6 4.2 4.2L19 6.9"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.7"/><path d="m8.2 12.3 2.5 2.5 5.2-5.4"/>',
    note:
      '<path d="M6.4 3.5h7.9l4 4v12.2a1 1 0 0 1-1 1H6.4a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14.2 3.8v4.1h4.2M8.7 12h6.6M8.7 15.5h4.2"/>',
    heart:
      '<path d="M20.7 9.4c0 5.3-8.7 10-8.7 10s-8.7-4.7-8.7-10a4.6 4.6 0 0 1 8.7-2.5 4.6 4.6 0 0 1 8.7 2.5Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevronLeft: '<path d="m14.8 5.8-6.2 6.2 6.2 6.2"/>',
    chevronRight: '<path d="m9.2 5.8 6.2 6.2-6.2 6.2"/>',
    arrowRight: '<path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5"/>',
    arrowUpRight: '<path d="M6.8 17.2 17.2 6.8M8.3 6.8h8.9v8.9"/>',
    clock: '<circle cx="12" cy="12" r="8.7"/><path d="M12 7.5V12l3.1 1.9"/>',
    pin:
      '<path d="m14.6 3.7 5.7 5.7-2 .8-3 3 .4 3.8-1.1 1.1-8.3-8.3 1.1-1.1 3.8.4 3-3 .4-2.4Z"/><path d="m9 15-4.4 4.4"/>',
    edit:
      '<path d="M4.2 19.8h4.1L19.1 9 15 4.9 4.2 15.7v4.1Z"/><path d="m13.8 6.1 4.1 4.1"/>',
    trash:
      '<path d="M4 7h16M9.2 7V4.7h5.6V7M6.4 7l.8 12.1h9.6L17.6 7M10 10.9v4.7M14 10.9v4.7"/>',
    rotate:
      '<path d="M4 4.5v5.8h5.8"/><path d="M5 14a7.8 7.8 0 1 0 .7-7.1L4 9.7"/>',
    image:
      '<rect x="3.2" y="4.2" width="17.6" height="15.6" rx="3.2"/><circle cx="8.5" cy="9" r="1.7"/><path d="m4.3 17.5 4.6-4.6a1.4 1.4 0 0 1 2 0l3 3 1.8-1.8a1.4 1.4 0 0 1 2 0l2.8 2.8"/>',
    video:
      '<rect x="3" y="5.5" width="12.8" height="13" rx="2.8"/><path d="m15.8 10 5.2-2.9v9.8L15.8 14"/>',
    play: '<path d="M8 5.4v13.2L18.6 12 8 5.4Z" fill="currentColor" stroke="none"/>',
    link:
      '<path d="m9.3 14.7 5.4-5.4"/><path d="M7.2 17.6 5.6 19.2a3.3 3.3 0 0 1-4.7-4.7l3.3-3.3a3.3 3.3 0 0 1 4.7 0"/><path d="m16.8 6.4 1.6-1.6a3.3 3.3 0 0 1 4.7 4.7l-3.3 3.3a3.3 3.3 0 0 1-4.7 0" transform="translate(-1.5 0)"/>',
    lock:
      '<rect x="4.5" y="10" width="15" height="10.3" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v2.5"/>',
    sparkles:
      '<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m18.5 15 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    download:
      '<path d="M12 3.5v11.7M7.5 11l4.5 4.5 4.5-4.5"/><path d="M4.5 17.2v2.2a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-2.2"/>',
    upload:
      '<path d="M12 15.2V3.5M7.5 7.7 12 3.2l4.5 4.5"/><path d="M4.5 17.2v2.2a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-2.2"/>',
    database:
      '<ellipse cx="12" cy="5.5" rx="7.8" ry="3"/><path d="M4.2 5.5v6c0 1.7 3.5 3 7.8 3s7.8-1.3 7.8-3v-6"/><path d="M4.2 11.5v6c0 1.7 3.5 3 7.8 3s7.8-1.3 7.8-3v-6"/>',
    alert:
      '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.5v5M12 16.2v.2"/>',
    inbox:
      '<path d="M4 13.2 6.3 4.8h11.4L20 13.2v5.6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.6Z"/><path d="M4 13.2h4.8l1 1.9h4.4l1-1.9H20"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
  };

  function icon(name, className = "") {
    const body = ICON_PATHS[name] || "";
    return `<svg${className ? ` class="${className}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  const BRAND_MARK = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <rect x="7" y="9" width="34" height="32" rx="9" fill="white" opacity=".96"/>
    <path d="M15 20h18M15 26h11" stroke="#E98975" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M31 30.5c0-2.2 3.2-4.4 4.4-4.9.3-.1.6.2.5.5-.3 1.5-1.7 4.9-4.3 5.7" fill="#F3A94E"/>
  </svg>`;

  /* ---------------- DOM + App state ---------------- */

  const app = document.getElementById("app");
  let appState = emptyState();
  let currentRoute = "home";
  let storageMode = "idb";
  let dbPromise = null;
  let writeQueue = Promise.resolve();
  let saveErrorShown = false;
  let currentSheet = null;
  let activeConfirm = null;
  let activeLightbox = null;
  let deferredInstallPrompt = null;
  let installPromptShownThisSession = false;
  let installPromptTimer = null;
  let toastTimer = null;
  let toastEl = null;
  let webpSupport = null;

  /* ---------------- Utilities ---------------- */

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      switch (character) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return character;
      }
    });
  }

  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function localDateKey(date = new Date()) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function parseDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) return null;
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  function validISODate(value) {
    if (typeof value !== "string") return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function formatMonthDay(date) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatWeekday(date) {
    return WEEKDAYS[date.getDay()];
  }

  function formatDateLabel(dateKey, options = {}) {
    const date = parseDateKey(dateKey);
    if (!date) return options.empty || "未设日期";
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.round((targetStart - todayStart) / 86400000);
    if (dayDiff === 0) return "今天";
    if (dayDiff === 1) return "明天";
    if (dayDiff === -1) return "昨天";
    if (date.getFullYear() !== today.getFullYear()) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatFriendlyDate(dateKey) {
    const date = parseDateKey(dateKey);
    if (!date) return "未设日期";
    const short = formatDateLabel(dateKey);
    if (short === "今天" || short === "明天" || short === "昨天") {
      return `${short} · ${formatMonthDay(date)}`;
    }
    return `${short} ${formatWeekday(date)}`;
  }

  function relativeTime(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const diff = Date.now() - date.getTime();
    if (diff < 0) return "刚刚";
    const minute = 60000;
    const hour = 3600000;
    if (diff < minute) return "刚刚";
    if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / hour)} 小时前`;
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const days = Math.round((start - target) / 86400000);
    if (days === 1) return "昨天";
    if (days < 7) return `${days} 天前`;
    if (date.getFullYear() !== today.getFullYear()) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatClockTime(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }

  function formatTimeValue(value) {
    if (!/^\d{2}:\d{2}$/.test(value || "")) return "";
    return value;
  }

  function truncateText(value, max = 80) {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max)}…` : text;
  }

  function isImageDataUrl(value) {
    return /^data:image\/(?!svg)[a-z0-9.+-]+;base64,/i.test(String(value || ""));
  }

  function isVideoDataUrl(value) {
    return /^data:video\/[a-z0-9.+-]+;base64,/i.test(String(value || ""));
  }

  function makeMedia(type, src, poster = "") {
    return {
      id: newId(),
      type: type === "video" ? "video" : "image",
      src,
      poster: poster && isImageDataUrl(poster) ? poster : "",
    };
  }

  function normalizeMediaItem(raw) {
    if (typeof raw === "string") {
      if (isImageDataUrl(raw) && raw.length < MAX_MEDIA_DATA_URL) {
        return makeMedia("image", raw);
      }
      if (isVideoDataUrl(raw) && raw.length < MAX_MEDIA_DATA_URL) {
        return makeMedia("video", raw);
      }
      return null;
    }
    if (!raw || typeof raw !== "object") return null;
    const src = typeof raw.src === "string" ? raw.src : "";
    let type = raw.type === "video" ? "video" : "image";
    if (!isImageDataUrl(src) && !isVideoDataUrl(src)) return null;
    if (src.length >= MAX_MEDIA_DATA_URL) return null;
    if (isVideoDataUrl(src)) type = "video";
    if (type === "image" && !isImageDataUrl(src)) return null;
    return {
      id: typeof raw.id === "string" && /^[\w-]{1,90}$/.test(raw.id) ? raw.id : newId(),
      type,
      src,
      poster:
        typeof raw.poster === "string" && isImageDataUrl(raw.poster)
          ? raw.poster
          : "",
    };
  }

  function normalizeMediaList(rawMedia, legacyImages = []) {
    const source = Array.isArray(rawMedia)
      ? rawMedia
      : Array.isArray(legacyImages)
      ? legacyImages
      : [];
    const media = [];
    let videoCount = 0;
    for (const entry of source) {
      const normalized = normalizeMediaItem(entry);
      if (!normalized) continue;
      if (normalized.type === "video") {
        if (videoCount >= MAX_VIDEOS) continue;
        videoCount += 1;
      }
      media.push(normalized);
      if (media.length >= MAX_MEDIA) break;
    }
    return media;
  }

  function mediaThumb(mediaItem) {
    if (!mediaItem) return "";
    return mediaItem.type === "video" ? mediaItem.poster || "" : mediaItem.src;
  }

  function mediaSummary(media) {
    const list = Array.isArray(media) ? media : [];
    const videos = list.filter((item) => item.type === "video").length;
    const images = list.length - videos;
    if (!list.length) return "暂无附件";
    const parts = [];
    if (images) parts.push(`${images} 张图片`);
    if (videos) parts.push(`${videos} 段视频`);
    return parts.join(" · ");
  }

  function mediaLimitLabel() {
    return `最多 ${MAX_MEDIA} 个附件，视频最多 ${MAX_VIDEOS} 个（单个 ≤20MB）`;
  }

  function dataUrlToBlob(dataUrl) {
    const match = /^data:([^;,]+);base64,(.*)$/s.exec(String(dataUrl || ""));
    if (!match) return null;
    try {
      const binary = atob(match[2]);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      return new Blob([bytes], { type: match[1] });
    } catch {
      return null;
    }
  }

  function renderMediaThumb(mediaItem, scope, ownerId, index, extraClass = "") {
    const thumb = mediaThumb(mediaItem);
    const isVideo = mediaItem.type === "video";
    return `<button class="media-thumb${isVideo ? " is-video" : ""}${
      extraClass ? ` ${extraClass}` : ""
    }" type="button" data-action="view-media" data-scope="${scope}" data-id="${escapeHTML(
      ownerId
    )}" data-index="${index}" aria-label="查看${isVideo ? "视频" : "图片"} ${index + 1}">
      ${
        thumb
          ? `<img src="${escapeHTML(thumb)}" alt="" loading="lazy" decoding="async">`
          : `<span class="media-fallback">${icon(isVideo ? "video" : "image")}</span>`
      }
      ${isVideo ? `<span class="media-play" aria-hidden="true">${icon("play")}</span>` : ""}
    </button>`;
  }

  function renderMediaStrip(media, scope, ownerId, limit = 3) {
    const list = Array.isArray(media) ? media : [];
    if (!list.length) return "";
    const visible = list.slice(0, limit);
    return `<div class="media-strip">
      ${visible
        .map((mediaItem, index) => renderMediaThumb(mediaItem, scope, ownerId, index))
        .join("")}
      ${
        list.length > limit
          ? `<button class="media-thumb media-more" type="button" data-action="view-media" data-scope="${scope}" data-id="${escapeHTML(
              ownerId
            )}" data-index="${limit}" aria-label="查看其余 ${list.length - limit} 个附件">+${
              list.length - limit
            }</button>`
          : ""
      }
    </div>`;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function safeLink(rawValue) {
    let value = String(rawValue || "").trim();
    if (!value) return "";
    if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") return "";
      return url.href;
    } catch {
      return "";
    }
  }

  function haptic(ms = 12) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {
        /* noop */
      }
    }
  }

  function cloneState(value) {
    if (typeof structuredClone === "function") {
      try {
        return structuredClone(value);
      } catch {
        /* fallback below */
      }
    }
    return JSON.parse(JSON.stringify(value));
  }

  /* ---------------- Data model ---------------- */

  function emptyState() {
    return {
      version: DATA_VERSION,
      plans: [],
      daily: [],
      favorites: [],
      updatedAt: nowISO(),
    };
  }

  function normalizePlan(raw) {
    if (!raw || typeof raw !== "object") return null;
    const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 120) : "";
    if (!title) return null;
    const createdAt = validISODate(raw.createdAt) || nowISO();
    return {
      id: typeof raw.id === "string" && /^[\w-]{1,90}$/.test(raw.id) ? raw.id : newId(),
      title,
      notes: typeof raw.notes === "string" ? raw.notes.slice(0, 2000) : "",
      dueDate: parseDateKey(raw.dueDate) ? raw.dueDate : "",
      dueTime: formatTimeValue(raw.dueTime),
      important: Boolean(raw.important),
      completed: Boolean(raw.completed),
      completedAt: raw.completed ? validISODate(raw.completedAt) || createdAt : "",
      media: normalizeMediaList(raw.media, raw.images),
      createdAt,
      updatedAt: validISODate(raw.updatedAt) || createdAt,
    };
  }

  function normalizeDaily(raw) {
    if (!raw || typeof raw !== "object") return null;
    const text = typeof raw.text === "string" ? raw.text.slice(0, 6000) : "";
    const media = normalizeMediaList(raw.media, raw.images);
    if (!text.trim() && !media.length) return null;
    const createdAt = validISODate(raw.createdAt) || nowISO();
    return {
      id: typeof raw.id === "string" && /^[\w-]{1,90}$/.test(raw.id) ? raw.id : newId(),
      text,
      date: parseDateKey(raw.date) ? raw.date : localDateKey(new Date(createdAt)),
      media,
      createdAt,
      updatedAt: validISODate(raw.updatedAt) || createdAt,
    };
  }

  function normalizeFavorite(raw) {
    if (!raw || typeof raw !== "object") return null;
    const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 120) : "";
    const notes = typeof raw.notes === "string" ? raw.notes.slice(0, 4000) : "";
    const media = normalizeMediaList(raw.media, raw.images);
    if (!title && !notes && media.length === 0) return null;
    const createdAt = validISODate(raw.createdAt) || nowISO();
    return {
      id: typeof raw.id === "string" && /^[\w-]{1,90}$/.test(raw.id) ? raw.id : newId(),
      title: title || "未命名好物",
      notes,
      link: safeLink(raw.link),
      media,
      pinned: Boolean(raw.pinned),
      createdAt,
      updatedAt: validISODate(raw.updatedAt) || createdAt,
    };
  }

  function normalizeState(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const seenIds = new Set();
    const ensureUnique = (item) => {
      if (seenIds.has(item.id)) item.id = newId();
      seenIds.add(item.id);
      return item;
    };
    return {
      version: DATA_VERSION,
      plans: (Array.isArray(source.plans) ? source.plans : [])
        .map(normalizePlan)
        .filter(Boolean)
        .map(ensureUnique),
      daily: (Array.isArray(source.daily) ? source.daily : [])
        .map(normalizeDaily)
        .filter(Boolean)
        .map(ensureUnique),
      favorites: (Array.isArray(source.favorites) ? source.favorites : [])
        .map(normalizeFavorite)
        .filter(Boolean)
        .map(ensureUnique),
      updatedAt: validISODate(source.updatedAt) || nowISO(),
    };
  }

  function totalRecordCount() {
    return appState.plans.length + appState.daily.length + appState.favorites.length;
  }

  /* ---------------- Storage ---------------- */

  function openDatabase() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB unavailable"));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Cannot open database"));
      request.onblocked = () => reject(new Error("Database blocked"));
    }).catch((error) => {
      dbPromise = null;
      throw error;
    });
    return dbPromise;
  }

  async function loadState() {
    try {
      const db = await openDatabase();
      const stored = await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readonly");
        const request = tx.objectStore(DB_STORE).get(DB_KEY);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Read failed"));
      });
      storageMode = "idb";
      if (stored) {
        return normalizeState(stored);
      }
    } catch (error) {
      console.warn("IndexedDB unavailable, falling back to localStorage.", error);
      storageMode = "local";
    }

    try {
      const raw = window.localStorage.getItem(FALLBACK_KEY);
      if (raw) {
        storageMode = "local";
        return normalizeState(JSON.parse(raw));
      }
    } catch (error) {
      console.warn("LocalStorage unavailable.", error);
      storageMode = "none";
    }
    return emptyState();
  }

  async function saveSnapshot(snapshot) {
    if (storageMode === "none") {
      throw new Error("当前浏览器不允许本地存储");
    }
    if (storageMode === "idb") {
      try {
        const db = await openDatabase();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(DB_STORE, "readwrite");
          tx.objectStore(DB_STORE).put(snapshot, DB_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error || new Error("Write failed"));
          tx.onabort = () => reject(tx.error || new Error("Write aborted"));
        });
        return;
      } catch (error) {
        console.warn("IndexedDB write failed, trying localStorage.", error);
        storageMode = "local";
      }
    }
    try {
      window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(snapshot));
    } catch (error) {
      storageMode = "local";
      throw new Error("本地存储空间不足，请先导出备份并清理图片");
    }
  }

  function persist() {
    appState.updatedAt = nowISO();
    const snapshot = cloneState(appState);
    writeQueue = writeQueue
      .catch(() => {})
      .then(() => saveSnapshot(snapshot))
      .catch((error) => {
        console.error("Save failed:", error);
        if (!saveErrorShown) {
          saveErrorShown = true;
          window.setTimeout(() => {
            saveErrorShown = false;
          }, 6000);
          showToast("保存失败，请检查浏览器存储空间", { duration: 4800 });
        }
      });
    return writeQueue;
  }

  async function storageUsageText() {
    try {
      if (navigator.storage && typeof navigator.storage.estimate === "function") {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          return `本机已用约 ${formatBytes(estimate.usage)}`;
        }
      }
    } catch {
      /* noop */
    }
    try {
      return `数据约 ${formatBytes(new Blob([JSON.stringify(appState)]).size)}`;
    } catch {
      return "本地保存";
    }
  }

  /* ---------------- Formatting helpers ---------------- */

  function dueTimestamp(plan) {
    const date = parseDateKey(plan.dueDate);
    if (!date) return Number.POSITIVE_INFINITY;
    let hours = 23;
    let minutes = 59;
    if (/^\d{2}:\d{2}$/.test(plan.dueTime || "")) {
      const [h, m] = plan.dueTime.split(":").map(Number);
      hours = h;
      minutes = m;
    }
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
      0,
      0
    ).getTime();
  }

  function isPlanOverdue(plan) {
    if (!plan.dueDate || plan.completed) return false;
    const target = dueTimestamp(plan);
    return Number.isFinite(target) && target < Date.now();
  }

  function planDueChip(plan) {
    if (!plan.dueDate) return "";
    const overdue = isPlanOverdue(plan);
    const label = `${overdue ? "已过期 · " : ""}${formatDateLabel(plan.dueDate)}${
      plan.dueTime ? ` ${plan.dueTime}` : ""
    }`;
    return `<span class="meta-chip${overdue ? " chip-overdue" : ""}">${icon("clock")}${escapeHTML(
      label
    )}</span>`;
  }

  function sortedPlans(completed) {
    const list = appState.plans.filter((item) => item.completed === completed);
    if (completed) {
      return list.sort(
        (a, b) =>
          new Date(b.completedAt || b.updatedAt).getTime() -
          new Date(a.completedAt || a.updatedAt).getTime()
      );
    }
    return list.sort((a, b) => {
      const dueA = dueTimestamp(a);
      const dueB = dueTimestamp(b);
      if (dueA !== dueB) return dueA - dueB;
      if (a.important !== b.important) return a.important ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  function sortedDaily() {
    return [...appState.daily].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  function sortedFavorites() {
    return [...appState.favorites].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  function findPlan(id) {
    return appState.plans.find((item) => item.id === id) || null;
  }

  function findDaily(id) {
    return appState.daily.find((item) => item.id === id) || null;
  }

  function findFavorite(id) {
    return appState.favorites.find((item) => item.id === id) || null;
  }

  /* ---------------- Routing ---------------- */

  function getRoute() {
    const route = (window.location.hash || "").replace(/^#\/?/, "").trim();
    return ROUTES.includes(route) ? route : "home";
  }

  function ensureInitialRoute() {
    if (!window.location.hash || !ROUTES.includes(window.location.hash.replace(/^#\/?/, ""))) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}#/home`
      );
    }
    currentRoute = getRoute();
  }

  function navigate(route) {
    const safeRoute = ROUTES.includes(route) ? route : "home";
    if (getRoute() === safeRoute) {
      render();
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    window.location.hash = `#/${safeRoute}`;
  }

  /* ---------------- Render: shared ---------------- */

  function render() {
    currentRoute = getRoute();
    document.body.dataset.route = currentRoute;
    const html = currentRoute === "home" ? renderHome() : renderGroup(currentRoute);
    app.innerHTML = html;
    renderFab();
    document.title =
      currentRoute === "home"
        ? "拾光备忘 · 私人备忘录"
        : `${ROUTE_META[currentRoute].title} · 拾光备忘`;
  }

  function renderFab() {
    if (currentRoute === "done") return;
    const label =
      currentRoute === "home"
        ? "新建记录"
        : currentRoute === "favorites"
        ? "添加好物"
        : currentRoute === "daily"
        ? "写日常记录"
        : "添加计划";
    app.insertAdjacentHTML(
      "beforeend",
      `<button class="fab" type="button" data-action="fab" aria-label="${label}">${icon(
        "plus"
      )}</button>`
    );
  }

  function renderBrand() {
    return `<div class="brand">
      <span class="brand-mark" aria-hidden="true">${BRAND_MARK}</span>
      <span class="brand-copy"><strong>拾光</strong><small>私人备忘录</small></span>
    </div>`;
  }

  function renderHome() {
    const now = new Date();
    const pendingCount = appState.plans.filter((plan) => !plan.completed).length;
    const doneCount = appState.plans.filter((plan) => plan.completed).length;
    const dailyCount = appState.daily.length;
    const favoriteCount = appState.favorites.length;
    const allCount = totalRecordCount();

    const tiles = `
      <div class="stat-grid">
        ${statTile({
          tone: "plan",
          route: "plan",
          count: pendingCount,
          label: "计划",
          caption: "待完成",
          icon: `<span class="stat-icon calendar-day-icon">${icon("calendar")}<b>${now.getDate()}</b></span>`,
        })}
        ${statTile({
          tone: "done",
          route: "done",
          count: doneCount,
          label: "已完成",
          caption: "已归档",
          icon: `<span class="stat-icon">${icon("checkCircle")}</span>`,
        })}
        ${statTile({
          tone: "daily",
          route: "daily",
          count: dailyCount,
          label: "日常记录",
          caption: "条记录",
          icon: `<span class="stat-icon">${icon("note")}</span>`,
        })}
        ${statTile({
          tone: "favorite",
          route: "favorites",
          count: favoriteCount,
          label: "好物收藏",
          caption: "件心头好",
          icon: `<span class="stat-icon">${icon("heart")}</span>`,
        })}
      </div>`;

    const listRows = `
      ${listRow("plan", "计划", pendingCount, "plan")}
      ${listRow("done", "已完成", doneCount, "done")}
      ${listRow("daily", "日常记录", dailyCount, "daily")}
      ${listRow("favorites", "好物收藏", favoriteCount, "favorite")}
    `;

    return `<div class="view home-view">
      <header class="home-header">
        <div class="topbar">
          ${renderBrand()}
          <div class="tool-pill">
            <button class="icon-button" type="button" data-action="open-search" aria-label="搜索全部记录">${icon(
              "search"
            )}</button>
            <span class="tool-divider" aria-hidden="true"></span>
            <button class="icon-button" type="button" data-action="open-data" aria-label="数据与备份">${icon(
              "database"
            )}</button>
          </div>
        </div>
        <div class="home-intro">
          <p class="date-line"><span class="date-dot" aria-hidden="true"></span>${formatMonthDay(
            now
          )} · ${formatWeekday(now)}</p>
          <h1 class="home-title">我的备忘录</h1>
          <p class="home-subtitle">把想做的事、喜欢的东西，都妥帖收进这里。</p>
        </div>
      </header>

      ${tiles}

      <section class="lists-section" aria-labelledby="my-lists-title">
        <div class="section-head">
          <h2 class="section-title" id="my-lists-title">我的列表</h2>
          <span class="section-note">${allCount ? `共 ${allCount} 条记录` : "从今天开始"}</span>
        </div>
        <div class="list-card">${listRows}</div>
      </section>

      <section class="recent-section" aria-labelledby="recent-title">
        <div class="section-head">
          <h2 class="section-title" id="recent-title">最近</h2>
          <span class="section-note">${allCount ? "随时可以回来看看" : "还没有记录"}</span>
        </div>
        ${renderRecent()}
      </section>

      <p class="privacy-note">${icon("lock")}数据只保存在这台设备，记得定期备份</p>
    </div>`;
  }

  function statTile({ tone, route, count, label, caption, icon: iconHtml }) {
    return `<button class="stat-tile ${tone}" type="button" data-nav="${route}" aria-label="${label}，${count} ${caption}">
      <div class="stat-top">
        ${iconHtml}
        <span class="stat-count">${count}</span>
      </div>
      <div class="stat-bottom">
        <span class="stat-label">${label}</span>
        <span class="stat-caption">${caption}</span>
      </div>
    </button>`;
  }

  function listRow(route, label, count, tone) {
    return `<button class="list-row" type="button" data-nav="${route}">
      <span class="list-icon ${tone}" aria-hidden="true">${icon(
        tone === "favorite" ? "heart" : tone === "done" ? "check" : tone === "daily" ? "note" : "calendar"
      )}</span>
      <span class="list-name">${label}</span>
      <span class="list-count">${count}</span>
      ${icon("chevronRight", "list-chevron")}
    </button>`;
  }

  function renderRecent() {
    const items = [];
    appState.plans.forEach((plan) => {
      items.push({
        route: "plan",
        tone: plan.completed ? "done" : "plan",
        icon: plan.completed ? "check" : "calendar",
        title: plan.title,
        meta: plan.completed
          ? `已完成 · ${relativeTime(plan.completedAt || plan.updatedAt)}`
          : plan.dueDate
          ? `${formatDateLabel(plan.dueDate)}${plan.dueTime ? ` ${plan.dueTime}` : ""} · ${
              isPlanOverdue(plan) ? "已过期" : "计划"
            }`
          : `计划 · ${relativeTime(plan.updatedAt)}`,
        updatedAt: plan.updatedAt,
        image: mediaThumb(plan.media && plan.media[0]),
      });
    });
    appState.daily.forEach((entry) => {
      items.push({
        route: "daily",
        tone: "daily",
        icon: "note",
        title: entry.text.trim()
          ? truncateText(entry.text, 52)
          : `${entry.media.length} 个日常附件`,
        meta: `日常记录 · ${relativeTime(entry.createdAt)}`,
        updatedAt: entry.updatedAt,
        image: mediaThumb(entry.media && entry.media[0]),
      });
    });
    appState.favorites.forEach((item) => {
      items.push({
        route: "favorites",
        tone: "favorite",
        icon: "heart",
        title: item.title,
        meta: `好物收藏 · ${relativeTime(item.updatedAt)}`,
        updatedAt: item.updatedAt,
        image: mediaThumb(item.media && item.media[0]),
      });
    });

    if (!items.length) {
      return `<div class="home-empty">
        <div class="empty-art" aria-hidden="true">${icon("sparkles")}</div>
        <h3>从第一件小事开始</h3>
        <p>写下一个计划，记一段今天，或者收藏那件让你心动很久的东西。</p>
        <div class="quick-actions">
          <button class="quick-action primary" type="button" data-action="new-plan">${icon(
            "plus"
          )}写个计划</button>
          <button class="quick-action" type="button" data-action="new-daily">${icon(
            "note"
          )}记下今天</button>
          <button class="quick-action" type="button" data-action="new-favorite">${icon(
            "heart"
          )}收藏好物</button>
        </div>
      </div>`;
    }

    const sorted = items
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    return `<div class="recent-list">
      ${sorted
        .map(
          (item) => `<button class="recent-row" type="button" data-nav="${item.route}">
            <span class="recent-icon ${item.tone}" aria-hidden="true">${icon(item.icon)}</span>
            <span class="recent-copy">
              <span class="recent-title">${escapeHTML(item.title)}</span>
              <span class="recent-meta">${escapeHTML(item.meta)}</span>
            </span>
            ${
              item.image
                ? `<img class="recent-thumb" src="${escapeHTML(item.image)}" alt="" loading="lazy" decoding="async">`
                : ""
            }
            ${icon("chevronRight", "recent-arrow")}
          </button>`
        )
        .join("")}
    </div>`;
  }

  /* ---------------- Render: group ---------------- */

  function renderGroup(route) {
    const meta = ROUTE_META[route];
    if (!meta) return renderHome();
    const groupData = getGroupData(route);
    return `<div class="view group-view tone-${meta.tone}">
      <header class="page-header">
        <button class="round-control" type="button" data-nav="home" aria-label="返回首页">${icon(
          "chevronLeft"
        )}</button>
        <div class="page-heading">
          <p class="page-kicker">${meta.kicker}</p>
          <h1 class="page-title">${meta.title}</h1>
        </div>
        <button class="round-control" type="button" data-action="open-search" aria-label="搜索全部记录">${icon(
          "search"
        )}</button>
      </header>

      ${renderGroupSummary(route, meta)}

      <section class="group-content" aria-label="${meta.title}列表">
        ${
          groupData.items.length
            ? `<div class="group-list-head"><h2>${groupData.listLabel}</h2><span>${
                groupData.items.length
              } ${groupData.unit}${
                route === "plan" ? ' <i class="list-tip">点圆圈完成</i>' : ""
              }</span></div>`
            : ""
        }
        ${groupData.html}
      </section>
    </div>`;
  }

  function getGroupData(route) {
    if (route === "plan") {
      const list = sortedPlans(false);
      return {
        items: list,
        listLabel: "待完成",
        unit: "件",
        html: list.length
          ? `<div class="note-list">${list.map(renderPlanCard).join("")}</div>`
          : renderPlanEmpty(),
      };
    }
    if (route === "done") {
      const list = sortedPlans(true);
      return {
        items: list,
        listLabel: "完成记录",
        unit: "件",
        html: list.length
          ? `<div class="note-list">${list.map(renderPlanCard).join("")}</div>`
          : emptyStateBlock({
              tone: "done",
              icon: "checkCircle",
              title: "还没有完成的任务",
              text: "完成一个计划后，它会被妥帖地收在这里。",
              cta: "去看看计划",
              ctaRoute: "plan",
            }),
      };
    }
    if (route === "daily") {
      const list = sortedDaily();
      return {
        items: list,
        listLabel: "记录",
        unit: "条",
        html: list.length
          ? `<div class="note-list">${list.map(renderDailyCard).join("")}</div>`
          : emptyStateBlock({
              tone: "daily",
              icon: "note",
              title: "今天还没有记录",
              text: "不必写得很多，一句话也值得被留下。",
              cta: "记下此刻",
              ctaAction: "new-daily",
            }),
      };
    }
    const list = sortedFavorites();
    return {
      items: list,
      listLabel: "收藏",
      unit: "件",
      html: list.length
        ? `<div class="favorite-grid">${list.map(renderFavoriteCard).join("")}</div>${renderAddFavoriteTile()}`
        : emptyStateBlock({
            tone: "favorite",
            icon: "heart",
            title: "收藏夹还是空的",
            text: "把喜欢的东西连同照片一起收好，想找的时候就能找到。",
            cta: "添加第一件好物",
            ctaAction: "new-favorite",
          }),
    };
  }

  function renderGroupSummary(route, meta) {
    if (route === "plan") {
      const pending = appState.plans.filter((item) => !item.completed).length;
      const done = appState.plans.filter((item) => item.completed).length;
      const total = appState.plans.length;
      const percent = total ? Math.round((done / total) * 100) : 0;
      return `<div class="group-summary">
        <div class="summary-icon" aria-hidden="true">${icon(meta.icon)}</div>
        <div class="summary-copy">
          <strong>${pending} 件待完成</strong>
          <span>${
            total
              ? `已完成 ${done} 件 · ${percent}% 的进度`
              : "还没有计划，写下第一件想做的事吧。"
          }</span>
        </div>
        ${
          total
            ? `<div class="summary-ring" style="--progress:${percent}" aria-label="计划完成度 ${percent}%"><span>${percent}%</span></div>`
            : ""
        }
      </div>`;
    }
    if (route === "done") {
      const done = appState.plans.filter((item) => item.completed).length;
      return `<div class="group-summary tone-done">
        <div class="summary-icon" aria-hidden="true">${icon("checkCircle")}</div>
        <div class="summary-copy">
          <strong>${done} 件已完成</strong>
          <span>每一次完成，都算数。</span>
        </div>
      </div>`;
    }
    if (route === "daily") {
      const days = new Set(appState.daily.map((entry) => entry.date)).size;
      return `<div class="group-summary tone-daily">
        <div class="summary-icon" aria-hidden="true">${icon("note")}</div>
        <div class="summary-copy">
          <strong>${appState.daily.length} 条记录</strong>
          <span>${
            appState.daily.length
              ? `记录了 ${days} 天的生活碎片。`
              : "留住今天，哪怕只是一点点。"
          }</span>
        </div>
      </div>`;
    }
    const mediaCount = appState.favorites.reduce(
      (sum, item) => sum + item.media.length,
      0
    );
    const videoCount = appState.favorites.reduce(
      (sum, item) => sum + item.media.filter((mediaItem) => mediaItem.type === "video").length,
      0
    );
    return `<div class="group-summary tone-favorite">
      <div class="summary-icon" aria-hidden="true">${icon("heart")}</div>
      <div class="summary-copy">
        <strong>${appState.favorites.length} 件收藏</strong>
        <span>${
          appState.favorites.length
            ? `${mediaCount} 个附件${videoCount ? ` · ${videoCount} 段视频` : ""} · 喜欢的东西都值得记住。`
            : "心动的东西，值得被记住。"
        }</span>
      </div>
    </div>`;
  }

  function renderPlanCard(plan) {
    const completed = plan.completed;
    const media = Array.isArray(plan.media) ? plan.media : [];
    return `<article class="note-card${completed ? " is-done" : ""}">
      ${
        completed
          ? `<span class="task-check static-done" aria-hidden="true">${icon("check")}</span>`
          : `<button class="task-check" type="button" data-action="toggle-plan" data-id="${escapeHTML(
              plan.id
            )}" aria-label="完成计划：${escapeHTML(plan.title)}">${icon("check")}</button>`
      }
      <div class="task-body">
        <button class="note-main" type="button" data-action="edit-plan" data-id="${escapeHTML(
          plan.id
        )}">
          <h3 class="task-title">${escapeHTML(plan.title)}</h3>
          ${plan.notes ? `<p class="task-notes">${escapeHTML(plan.notes)}</p>` : ""}
          <div class="task-meta">
            ${
              completed
                ? `<span class="meta-chip chip-done">${icon("checkCircle")}完成于 ${escapeHTML(
                    formatDateLabel(localDateKey(new Date(plan.completedAt || plan.updatedAt)))
                  )}</span>`
                : planDueChip(plan)
            }
            ${plan.important ? `<span class="meta-chip chip-important">${icon("sparkles")}重要</span>` : ""}
          </div>
        </button>
        <div class="task-media-row">
          ${media.length ? renderMediaStrip(media, "plan", plan.id, 3) : ""}
          <button class="task-media-add" type="button" data-action="add-plan-media" data-id="${escapeHTML(
            plan.id
          )}" aria-label="为「${escapeHTML(plan.title)}」添加图片或视频">
            ${icon("plus")}<span>图片/视频</span>
          </button>
        </div>
      </div>
      <button class="more-button" type="button" data-action="plan-menu" data-id="${escapeHTML(
        plan.id
      )}" aria-label="计划更多操作">${icon("more")}</button>
    </article>`;
  }

  function renderDailyCard(entry) {
    const media = Array.isArray(entry.media) ? entry.media : [];
    return `<article class="note-card daily-card">
      <div class="task-body">
        <button class="note-main" type="button" data-action="edit-daily" data-id="${escapeHTML(
          entry.id
        )}">
          <div class="daily-top">
            <span class="daily-date">${icon("calendar")}${escapeHTML(
              formatFriendlyDate(entry.date)
            )}</span>
            ${
              media.length
                ? `<span class="mood-chip media-count-chip">${icon(
                    media.some((mediaItem) => mediaItem.type === "video") ? "video" : "image"
                  )}${media.length} 个附件</span>`
                : ""
            }
          </div>
          ${entry.text.trim() ? `<p class="daily-text">${escapeHTML(entry.text)}</p>` : ""}
          <span class="daily-time">${escapeHTML(formatClockTime(entry.createdAt))} 记录${
            entry.updatedAt !== entry.createdAt ? " · 已编辑" : ""
          }</span>
        </button>
        ${media.length ? renderMediaStrip(media, "daily", entry.id, 4) : ""}
      </div>
      <button class="more-button" type="button" data-action="daily-menu" data-id="${escapeHTML(
        entry.id
      )}" aria-label="日常记录更多操作">${icon("more")}</button>
    </article>`;
  }

  function renderFavoriteCard(item) {
    const media = Array.isArray(item.media) ? item.media : [];
    const firstMedia = media[0] || null;
    const cover = mediaThumb(firstMedia);
    return `<article class="fav-card">
      ${
        firstMedia
          ? `<button class="fav-cover" type="button" data-action="view-media" data-scope="favorite" data-id="${escapeHTML(
              item.id
            )}" data-index="0" aria-label="查看 ${escapeHTML(item.title)} 的附件">
              ${
                cover
                  ? `<img src="${escapeHTML(cover)}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async">`
                  : `<div class="fav-placeholder">${icon(
                      firstMedia.type === "video" ? "video" : "image"
                    )}<span>${firstMedia.type === "video" ? "视频" : "图片"}</span></div>`
              }
              ${firstMedia.type === "video" ? `<span class="fav-play" aria-hidden="true">${icon("play")}</span>` : ""}
              ${
                media.length > 1
                  ? `<span class="fav-count">+${media.length - 1}</span>`
                  : ""
              }
            </button>`
          : `<button class="fav-cover" type="button" data-action="edit-favorite" data-id="${escapeHTML(
              item.id
            )}" aria-label="编辑 ${escapeHTML(item.title)}">
              <div class="fav-placeholder">${icon("heart")}<span>好物收藏</span></div>
            </button>`
      }
      <button class="fav-more${firstMedia ? "" : " light"}" type="button" data-action="favorite-menu" data-id="${escapeHTML(
        item.id
      )}" aria-label="好物更多操作">${icon("more")}</button>
      ${
        item.link
          ? `<a class="fav-link-badge" href="${escapeHTML(
              item.link
            )}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${escapeHTML(
              item.title
            )} 的相关链接">${icon("link")}</a>`
          : ""
      }
      <button class="fav-info" type="button" data-action="edit-favorite" data-id="${escapeHTML(
        item.id
      )}">
        <h3 class="fav-title">${escapeHTML(item.title)}</h3>
        ${item.notes ? `<p class="fav-desc">${escapeHTML(item.notes)}</p>` : ""}
        <div class="fav-foot">
          <span>${escapeHTML(relativeTime(item.updatedAt))}</span>
          ${item.pinned ? `<span class="pin-label">${icon("pin")}置顶</span>` : ""}
        </div>
      </button>
    </article>`;
  }

  function renderAddFavoriteTile() {
    return `<button class="add-fav-tile" type="button" data-action="new-favorite">
      <span class="add-plus" aria-hidden="true">${icon("plus")}</span>
      再收藏一件
    </button>`;
  }

  function renderPlanEmpty() {
    const doneCount = appState.plans.filter((item) => item.completed).length;
    if (doneCount > 0) {
      return emptyStateBlock({
        tone: "plan",
        icon: "sparkles",
        title: "待办已经清空",
        text: "完成的计划都收在「已完成」里。也可以继续写下下一件想做的事。",
        cta: "看看已完成",
        ctaRoute: "done",
      });
    }
    return emptyStateBlock({
      tone: "plan",
      icon: "calendar",
      title: "还没有计划",
      text: "不必宏大，先写下一件想完成的小事。",
      cta: "添加第一个计划",
      ctaAction: "new-plan",
    });
  }

  function emptyStateBlock({ tone, icon: iconName, title, text, cta, ctaAction, ctaRoute }) {
    const ctaHtml = cta
      ? `<button class="empty-cta" type="button" ${
          ctaRoute ? `data-nav="${ctaRoute}"` : `data-action="${ctaAction}"`
        }>${icon("plus")}${escapeHTML(cta)}</button>`
      : "";
    return `<div class="empty-state">
      <div class="empty-icon tone-${tone}" aria-hidden="true">${icon(iconName)}</div>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(text)}</p>
      ${ctaHtml}
    </div>`;
  }

  /* ---------------- Sheets ---------------- */

  function showSheet({ kicker = "", title = "", subtitle = "", content = "", onMount = null }) {
    if (currentSheet) {
      closeSheet(true);
    }
    const previousFocus = document.activeElement;
    const layer = document.createElement("div");
    layer.className = "sheet-layer";
    layer.innerHTML = `
      <button class="sheet-backdrop" type="button" data-sheet-close aria-label="关闭弹层"></button>
      <section class="sheet" role="dialog" aria-modal="true" aria-label="${escapeHTML(
        title || kicker || "操作"
      )}">
        <div class="sheet-grabber" aria-hidden="true"></div>
        <header class="sheet-head">
          <div class="sheet-head-copy">
            ${kicker ? `<p class="sheet-kicker">${escapeHTML(kicker)}</p>` : ""}
            <h2 class="sheet-title">${escapeHTML(title)}</h2>
            ${subtitle ? `<p class="sheet-subtitle">${escapeHTML(subtitle)}</p>` : ""}
          </div>
          <button class="sheet-close" type="button" data-sheet-close aria-label="关闭">${icon("close")}</button>
        </header>
        ${content}
      </section>`;
    document.body.appendChild(layer);
    document.body.classList.add("sheet-open");

    const sheet = layer.querySelector(".sheet");
    const close = () => closeSheet();
    const handle = { layer, sheet, close };
    currentSheet = handle;

    layer.querySelectorAll("[data-sheet-close]").forEach((button) => {
      button.addEventListener("click", close);
    });

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => layer.classList.add("is-open"));
    });

    if (typeof onMount === "function") {
      onMount(sheet, close);
    }

    window.setTimeout(() => {
      const focusTarget =
        sheet.querySelector("[data-autofocus]") ||
        sheet.querySelector(
          "input:not([type=hidden]):not([disabled]), textarea:not([disabled])"
        ) ||
        sheet.querySelector(".sheet-close");
      if (focusTarget && document.body.classList.contains("sheet-open")) {
        try {
          focusTarget.focus({ preventScroll: true });
        } catch {
          focusTarget.focus();
        }
      }
    }, 220);

    layer.dataset.previousFocus = "";
    handle.previousFocus = previousFocus;
    return handle;
  }

  function closeSheet(immediate = false) {
    const handle = currentSheet;
    if (!handle) return;
    currentSheet = null;
    document.body.classList.remove("sheet-open");
    const { layer } = handle;
    layer.classList.remove("is-open");
    const remove = () => {
      if (layer.isConnected) layer.remove();
    };
    if (immediate) {
      remove();
    } else {
      window.setTimeout(remove, 380);
    }
    const previousFocus = handle.previousFocus;
    if (previousFocus && previousFocus.isConnected && !immediate) {
      try {
        previousFocus.focus({ preventScroll: true });
      } catch {
        previousFocus.focus();
      }
    }
  }

  function openCreateSheet() {
    const content = `<div class="sheet-body">
      <div class="create-options">
        <button class="create-option" type="button" id="create-plan-option">
          <span class="create-icon plan" aria-hidden="true">${icon("calendar")}</span>
          <span class="create-copy"><strong>计划</strong><span>一次可以写多个，也能附上图片/视频</span></span>
          ${icon("chevronRight", "create-arrow")}
        </button>
        <button class="create-option" type="button" id="create-daily-option">
          <span class="create-icon daily" aria-hidden="true">${icon("note")}</span>
          <span class="create-copy"><strong>日常记录</strong><span>文字、图片和视频，都可以留住今天</span></span>
          ${icon("chevronRight", "create-arrow")}
        </button>
        <button class="create-option" type="button" id="create-favorite-option">
          <span class="create-icon favorite" aria-hidden="true">${icon("heart")}</span>
          <span class="create-copy"><strong>好物收藏</strong><span>文字、图片、视频和链接一起收好</span></span>
          ${icon("chevronRight", "create-arrow")}
        </button>
      </div>
      <p class="sheet-helper">所有内容仅保存在这台设备</p>
    </div>`;
    const sheet = showSheet({ kicker: "新建", title: "想记录什么？", content });
    sheet.sheet
      .querySelector("#create-plan-option")
      .addEventListener("click", () => openPlanBatchForm());
    sheet.sheet
      .querySelector("#create-daily-option")
      .addEventListener("click", () => openDailyForm());
    sheet.sheet
      .querySelector("#create-favorite-option")
      .addEventListener("click", () => openFavoriteForm());
  }

  function actionSheetHtml(actions) {
    return `<div class="sheet-body">
      <div class="action-group">
        ${actions
          .map(
            (action) => `<button class="action-item${action.danger ? " danger" : ""}" type="button" data-key="${escapeHTML(
              action.key
            )}">
              <span class="action-item-icon" aria-hidden="true">${icon(action.icon)}</span>
              <span class="action-item-label">${escapeHTML(action.label)}</span>
              ${action.note ? `<span class="action-item-note">${escapeHTML(action.note)}</span>` : ""}
            </button>`
          )
          .join("")}
      </div>
      <button class="cancel-button" type="button" data-cancel>取消</button>
    </div>`;
  }

  function openPlanMenu(plan) {
    if (!plan) return;
    const actions = [
      { key: "edit", label: "编辑计划", icon: "edit" },
      plan.completed
        ? { key: "restore", label: "恢复为待办", icon: "rotate" }
        : { key: "complete", label: "标记为完成", icon: "check" },
      { key: "media", label: "添加图片/视频", icon: "image" },
      { key: "delete", label: "删除计划", icon: "trash", danger: true },
    ];
    const sheet = showSheet({
      kicker: "计划",
      title: truncateText(plan.title, 60),
      subtitle: plan.media.length
        ? mediaSummary(plan.media)
        : plan.completed
        ? "这个计划已经完成"
        : "选择要进行的操作",
      content: actionSheetHtml(actions),
    });
    sheet.sheet.querySelector("[data-cancel]").addEventListener("click", () => sheet.close());
    sheet.sheet.querySelectorAll("[data-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.key;
        if (key === "edit") {
          openPlanForm(plan);
          return;
        }
        if (key === "complete") {
          closeSheet(true);
          completePlan(plan.id);
          return;
        }
        if (key === "restore") {
          closeSheet(true);
          restorePlan(plan.id);
          return;
        }
        if (key === "media") {
          closeSheet(true);
          pickPlanMedia(plan.id);
          return;
        }
        if (key === "delete") {
          confirmDialog({
            title: "删除这个计划？",
            text: "删除后还可以在提示中撤销。",
            confirmLabel: "删除",
            danger: true,
          }).then((accepted) => {
            if (!accepted) return;
            closeSheet(true);
            deletePlan(plan.id);
          });
        }
      });
    });
  }

  function openDailyMenu(entry) {
    if (!entry) return;
    const actions = [
      { key: "edit", label: "编辑记录", icon: "edit" },
      { key: "delete", label: "删除记录", icon: "trash", danger: true },
    ];
    const sheet = showSheet({
      kicker: "日常记录",
      title: entry.text.trim()
        ? truncateText(entry.text, 52)
        : `${entry.media.length} 个日常附件`,
      subtitle: entry.media.length
        ? `${formatFriendlyDate(entry.date)} · ${mediaSummary(entry.media)}`
        : formatFriendlyDate(entry.date),
      content: actionSheetHtml(actions),
    });
    sheet.sheet.querySelector("[data-cancel]").addEventListener("click", () => sheet.close());
    sheet.sheet.querySelectorAll("[data-key]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.key === "edit") {
          openDailyForm(entry);
          return;
        }
        confirmDialog({
          title: "删除这条记录？",
          text: "删除后还可以在提示中撤销。",
          confirmLabel: "删除",
          danger: true,
        }).then((accepted) => {
          if (!accepted) return;
          closeSheet(true);
          deleteDaily(entry.id);
        });
      });
    });
  }

  function openFavoriteMenu(item) {
    if (!item) return;
    const actions = [
      { key: "edit", label: "编辑收藏", icon: "edit" },
      {
        key: "pin",
        label: item.pinned ? "取消置顶" : "置顶这件好物",
        icon: "pin",
      },
      { key: "delete", label: "删除收藏", icon: "trash", danger: true },
    ];
    const sheet = showSheet({
      kicker: "好物收藏",
      title: truncateText(item.title, 60),
      subtitle: item.media.length ? mediaSummary(item.media) : "暂无图片或视频",
      content: actionSheetHtml(actions),
    });
    sheet.sheet.querySelector("[data-cancel]").addEventListener("click", () => sheet.close());
    sheet.sheet.querySelectorAll("[data-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.key;
        if (key === "edit") {
          openFavoriteForm(item);
          return;
        }
        if (key === "pin") {
          item.pinned = !item.pinned;
          item.updatedAt = nowISO();
          closeSheet(true);
          persist();
          render();
          showToast(item.pinned ? "已置顶" : "已取消置顶");
          return;
        }
        confirmDialog({
          title: "删除这件收藏？",
          text: "图片、视频和文字会一起删除，删除后还可以在提示中撤销。",
          confirmLabel: "删除",
          danger: true,
        }).then((accepted) => {
          if (!accepted) return;
          closeSheet(true);
          deleteFavorite(item.id);
        });
      });
    });
  }

  /* ---------------- Media helpers ---------------- */

  async function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsDataURL(file);
    });
  }

  async function createVideoPoster(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      let settled = false;
      let timer = null;
      const cleanup = () => {
        if (timer) window.clearTimeout(timer);
        video.removeAttribute("src");
        try {
          video.load();
        } catch {
          /* noop */
        }
        URL.revokeObjectURL(url);
      };
      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value || "");
      };
      const draw = () => {
        try {
          const width = video.videoWidth;
          const height = video.videoHeight;
          if (!width || !height) {
            finish("");
            return;
          }
          const scale = Math.min(1, 640 / Math.max(width, height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          const context = canvas.getContext("2d");
          if (!context) {
            finish("");
            return;
          }
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          finish(canvas.toDataURL("image/webp", 0.72));
        } catch {
          finish("");
        }
      };
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.addEventListener(
        "loadeddata",
        () => {
          try {
            video.currentTime = Math.min(0.2, (video.duration || 1) * 0.1);
          } catch {
            draw();
          }
          window.setTimeout(() => {
            if (!settled) draw();
          }, 260);
        },
        { once: true }
      );
      video.addEventListener("seeked", draw, { once: true });
      video.addEventListener("error", () => finish(""), { once: true });
      timer = window.setTimeout(() => finish(""), 5000);
      video.src = url;
      try {
        video.load();
      } catch {
        finish("");
      }
    });
  }

  async function prepareMediaFile(file) {
    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "";
    if (!type) {
      throw new Error("只支持图片或视频");
    }
    if (type === "image") {
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error("图片请小于 30MB");
      }
      const src = await compressImage(file);
      return makeMedia("image", src);
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("视频请小于 20MB");
    }
    const poster = await createVideoPoster(file).catch(() => "");
    const src = await readFileAsDataUrl(file);
    if (!isVideoDataUrl(src) || src.length >= MAX_MEDIA_DATA_URL) {
      throw new Error("视频格式无法保存");
    }
    return makeMedia("video", src, poster);
  }

  async function processMediaFiles(files, existingMedia, onProgress) {
    const existing = Array.isArray(existingMedia) ? existingMedia : [];
    let videoCount = existing.filter((item) => item.type === "video").length;
    let remainingSlots = MAX_MEDIA - existing.length;
    const items = [];
    let skipped = 0;
    let failed = 0;
    const list = [...files];
    for (let index = 0; index < list.length; index += 1) {
      const file = list[index];
      const type = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "";
      if (!type) {
        failed += 1;
        continue;
      }
      if (remainingSlots <= 0) {
        skipped += 1;
        continue;
      }
      if (type === "video" && videoCount >= MAX_VIDEOS) {
        skipped += 1;
        continue;
      }
      if (typeof onProgress === "function") {
        onProgress(index + 1, list.length);
      }
      try {
        const item = await prepareMediaFile(file);
        items.push(item);
        remainingSlots -= 1;
        if (item.type === "video") videoCount += 1;
      } catch (error) {
        console.warn("Media processing failed:", error);
        failed += 1;
      }
    }
    return { items, skipped, failed };
  }

  function setupMediaEditor({
    grid,
    input,
    status,
    initialMedia = [],
    showAddTile = true,
    onChange = null,
    onProcessingChange = null,
  }) {
    let media = (Array.isArray(initialMedia) ? initialMedia : []).map((item) => ({
      ...item,
    }));
    let processing = false;

    const updateStatus = (result) => {
      if (!status) return;
      const parts = [];
      if (result.items.length) parts.push(`已添加 ${result.items.length} 个附件`);
      if (result.skipped) parts.push(`${result.skipped} 个超出数量限制，已忽略`);
      if (result.failed) parts.push(`${result.failed} 个处理失败`);
      status.textContent = parts.join("，");
      status.classList.toggle("is-error", Boolean(result.failed));
    };

    const render = () => {
      const previews = media
        .map((mediaItem, index) => {
          const isVideo = mediaItem.type === "video";
          const thumb = mediaThumb(mediaItem);
          return `<div class="image-preview media-preview${isVideo ? " is-video" : ""}">
            ${
              thumb
                ? `<img src="${escapeHTML(thumb)}" alt="附件 ${index + 1}" loading="lazy" decoding="async">`
                : `<span class="media-preview-fallback">${icon(isVideo ? "video" : "image")}</span>`
            }
            ${isVideo ? `<span class="media-type-badge">视频</span>` : ""}
            <button class="remove-image" type="button" data-remove-media="${index}" aria-label="移除附件 ${
              index + 1
            }">${icon("close")}</button>
          </div>`;
        })
        .join("");
      grid.innerHTML =
        previews +
        (showAddTile && media.length < MAX_MEDIA
          ? `<button class="add-image media-add" type="button" data-add-media aria-label="添加图片或视频">${icon(
              "plus"
            )}<span>图片/视频</span></button>`
          : "");
      if (!showAddTile) {
        grid.hidden = media.length === 0;
      }
      if (typeof onChange === "function") {
        onChange(media.length, media);
      }
    };

    grid.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-media]");
      if (removeButton) {
        media.splice(Number(removeButton.dataset.removeMedia), 1);
        if (status) {
          status.textContent = "";
          status.classList.remove("is-error");
        }
        render();
        return;
      }
      if (event.target.closest("[data-add-media]")) {
        input.click();
      }
    });

    input.addEventListener("change", async () => {
      if (processing) return;
      const files = [...(input.files || [])];
      input.value = "";
      if (!files.length) return;
      if (media.length >= MAX_MEDIA) {
        if (status) {
          status.textContent = `最多保存 ${MAX_MEDIA} 个附件`;
          status.classList.add("is-error");
        }
        return;
      }
      processing = true;
      if (typeof onProcessingChange === "function") onProcessingChange(true);
      if (status) {
        status.classList.remove("is-error");
        status.textContent = "正在处理图片/视频…";
      }
      const result = await processMediaFiles(files, media, (current, total) => {
        if (status) status.textContent = `正在处理 ${current} / ${total}…`;
      });
      media = media.concat(result.items);
      processing = false;
      if (typeof onProcessingChange === "function") onProcessingChange(false);
      render();
      updateStatus(result);
    });

    render();
    return {
      getMedia: () => media.map((item) => ({ ...item })),
      isProcessing: () => processing,
    };
  }

  function pickPlanMedia(planId) {
    const plan = findPlan(planId);
    if (!plan) return;
    if (plan.media.length >= MAX_MEDIA) {
      showToast(`每个计划最多 ${MAX_MEDIA} 个附件`);
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.multiple = true;
    input.className = "hidden";
    document.body.appendChild(input);
    input.addEventListener("cancel", () => input.remove(), { once: true });
    input.addEventListener(
      "change",
      async () => {
        const files = [...(input.files || [])];
        input.remove();
        if (!files.length) return;
        showToast("正在处理图片/视频…", { duration: 2200 });
        const result = await processMediaFiles(files, plan.media, (current, total) => {
          showToast(`正在处理 ${current} / ${total}…`, { duration: 2200 });
        });
        if (!result.items.length) {
          if (result.skipped) {
            showToast(`最多 ${MAX_MEDIA} 个附件，视频最多 ${MAX_VIDEOS} 个`, {
              duration: 4000,
            });
          } else {
            showToast("附件处理失败，请确认视频小于 20MB", { duration: 4000 });
          }
          return;
        }
        const target = findPlan(planId);
        if (!target) return;
        target.media = target.media.concat(result.items);
        target.updatedAt = nowISO();
        persist();
        render();
        const extra = result.skipped || result.failed ? "，部分文件已忽略" : "";
        showToast(`已添加 ${result.items.length} 个附件${extra}`);
      },
      { once: true }
    );
    input.click();
  }

  /* ---------------- Forms ---------------- */

  function openPlanBatchForm() {
    const content = `<form class="sheet-form" id="batch-plan-form" novalidate>
      <div class="sheet-body">
        <div class="batch-plan-list" id="batch-plan-list"></div>
        <button class="batch-add-row" id="batch-add-row" type="button">${icon("plus")}再加一个计划</button>
        <p class="sheet-helper">截止时间和图片/视频都可以不填，留空的计划会自动忽略。</p>
      </div>
      <div class="sheet-footer">
        <button class="primary-button" id="batch-plan-submit" type="submit">添加计划</button>
      </div>
    </form>`;

    const sheet = showSheet({
      kicker: "计划",
      title: "添加计划",
      subtitle: "一次写下几件事，慢慢完成。",
      content,
    });

    const form = sheet.sheet.querySelector("#batch-plan-form");
    const list = form.querySelector("#batch-plan-list");
    const addRowButton = form.querySelector("#batch-add-row");
    const submitButton = form.querySelector("#batch-plan-submit");
    const editors = new Map();
    let rowSeq = 0;

    const updateRowControls = () => {
      const rows = [...list.querySelectorAll(".batch-plan-row")];
      rows.forEach((row) => {
        const removeButton = row.querySelector(".batch-row-remove");
        if (removeButton) removeButton.hidden = rows.length <= 1;
      });
    };

    const updateSubmitLabel = () => {
      const count = [...list.querySelectorAll(".batch-plan-title")].filter(
        (input) => input.value.trim()
      ).length;
      submitButton.textContent = count > 0 ? `添加 ${count} 个计划` : "添加计划";
    };

    const addRow = (focus = false) => {
      if (editors.size >= 15) {
        showToast("一次最多添加 15 个计划");
        return;
      }
      rowSeq += 1;
      const row = document.createElement("div");
      row.className = "batch-plan-row";
      row.dataset.rowId = String(rowSeq);
      row.innerHTML = `
        <div class="batch-plan-head">
          <span class="batch-plan-circle" aria-hidden="true"></span>
          <input class="text-input batch-plan-title" type="text" maxlength="120"
            placeholder="想做的事，例如：周末去一趟海边" autocomplete="off" enterkeyhint="done"
            aria-label="计划内容" ${editors.size === 0 ? "data-autofocus" : ""}>
          <button class="batch-row-remove" type="button" aria-label="删除这个计划">${icon("close")}</button>
        </div>
        <div class="batch-row-fields">
          <label class="batch-date-field">
            <span>截止日期</span>
            <input class="text-input" type="date" aria-label="截止日期">
          </label>
          <label class="batch-date-field">
            <span>时间</span>
            <input class="text-input" type="time" aria-label="截止时间">
          </label>
        </div>
        <div class="batch-row-toolbar">
          <button class="batch-media-button" type="button">${icon("image")}<span>图片/视频</span></button>
          <span class="batch-media-count">暂无附件</span>
        </div>
        <div class="image-grid batch-media-grid" hidden></div>
        <input class="hidden" type="file" accept="image/*,video/*" multiple>
        <div class="upload-status batch-upload-status" role="status"></div>`;
      list.appendChild(row);

      const fileInput = row.querySelector('input[type="file"]');
      const mediaGrid = row.querySelector(".batch-media-grid");
      const mediaStatus = row.querySelector(".batch-upload-status");
      const mediaCount = row.querySelector(".batch-media-count");
      const mediaButton = row.querySelector(".batch-media-button");
      const titleInput = row.querySelector(".batch-plan-title");
      const removeButton = row.querySelector(".batch-row-remove");

      const editor = setupMediaEditor({
        grid: mediaGrid,
        input: fileInput,
        status: mediaStatus,
        initialMedia: [],
        showAddTile: false,
        onChange: (count) => {
          mediaCount.textContent = count ? `${count} 个附件` : "暂无附件";
        },
      });
      editors.set(rowSeq, editor);

      mediaButton.addEventListener("click", () => fileInput.click());
      titleInput.addEventListener("input", updateSubmitLabel);
      removeButton.addEventListener("click", () => {
        editors.delete(Number(row.dataset.rowId));
        row.remove();
        updateRowControls();
        updateSubmitLabel();
      });
      updateRowControls();
      updateSubmitLabel();

      if (focus) {
        window.requestAnimationFrame(() => {
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          titleInput.focus({ preventScroll: true });
        });
      }
    };

    addRow();
    sheet.sheet
      .querySelector("#batch-add-row")
      .addEventListener("click", () => addRow(true));

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const rows = [...list.querySelectorAll(".batch-plan-row")];
      const drafts = [];
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        const title = row.querySelector(".batch-plan-title").value.trim();
        const dateInput = row.querySelector('input[type="date"]');
        const timeInput = row.querySelector('input[type="time"]');
        const editor = editors.get(Number(row.dataset.rowId));
        if (!editor) continue;
        if (editor.isProcessing()) {
          showToast("图片/视频还在处理中，稍等一下");
          return;
        }
        const media = editor.getMedia();
        const hasExtra = Boolean(dateInput.value || timeInput.value || media.length);
        if (!title && hasExtra) {
          row.querySelector(".batch-plan-title").focus();
          showToast(`第 ${index + 1} 个计划还没写内容`);
          return;
        }
        if (!title) continue;
        drafts.push({
          title,
          dueDate: parseDateKey(dateInput.value) ? dateInput.value : "",
          dueTime: dateInput.value ? formatTimeValue(timeInput.value) : "",
          media,
        });
      }
      if (!drafts.length) {
        const firstTitle = list.querySelector(".batch-plan-title");
        if (firstTitle) firstTitle.focus();
        showToast("至少写下一个计划");
        return;
      }
      const createdAt = nowISO();
      drafts.forEach((draft) => {
        appState.plans.push({
          id: newId(),
          title: draft.title,
          notes: "",
          dueDate: draft.dueDate,
          dueTime: draft.dueTime,
          important: false,
          completed: false,
          completedAt: "",
          media: draft.media,
          createdAt,
          updatedAt: createdAt,
        });
      });
      persist();
      closeSheet(true);
      navigate("plan");
      showToast(drafts.length > 1 ? `已添加 ${drafts.length} 个计划` : "计划已添加");
    });
  }

  function openPlanForm(plan = null) {
    const isEdit = Boolean(plan);
    const current = plan || {
      title: "",
      notes: "",
      dueDate: "",
      dueTime: "",
      important: false,
      media: [],
    };
    let important = Boolean(current.important);
    const content = `<form class="sheet-form" id="plan-form" novalidate>
      <div class="sheet-body">
        <label class="field">
          <span class="field-label">计划内容 <em>必填</em></span>
          <input class="text-input" id="plan-title" name="title" type="text" maxlength="120"
            placeholder="例如：读完那本一直想看的书" value="${escapeHTML(
              current.title
            )}" data-autofocus autocomplete="off" enterkeyhint="done">
        </label>
        <label class="field">
          <span class="field-label">备注 <em>选填</em></span>
          <textarea class="text-area" id="plan-notes" name="notes" maxlength="2000"
            placeholder="补充一点细节，或者写给自己的话…">${escapeHTML(current.notes)}</textarea>
        </label>
        <div class="field">
          <span class="field-label">截止时间 <em>选填</em></span>
          <div class="form-row">
            <input class="text-input" id="plan-date" name="dueDate" type="date" value="${escapeHTML(
              current.dueDate
            )}" aria-label="截止日期">
            <input class="text-input" id="plan-time" name="dueTime" type="time" value="${escapeHTML(
              current.dueTime
            )}" aria-label="截止时间">
          </div>
          <div class="quick-dates" role="group" aria-label="快捷选择日期">
            <button class="quick-chip" type="button" data-quick-date="today">今天</button>
            <button class="quick-chip" type="button" data-quick-date="tomorrow">明天</button>
            <button class="quick-chip" type="button" data-quick-date="week">一周后</button>
            <button class="quick-chip" type="button" data-quick-date="none">不设日期</button>
          </div>
        </div>
        <div class="image-uploader">
          <div class="field-label">
            <span>图片 / 视频 <em>${mediaLimitLabel()}</em></span>
          </div>
          <div class="image-grid" id="plan-media-grid"></div>
          <input class="hidden" id="plan-media-input" type="file" accept="image/*,video/*" multiple>
          <div class="upload-status" id="plan-media-status" role="status"></div>
        </div>
        <div class="field">
          <span class="field-label">优先级 <em>选填</em></span>
          <div class="choice-row" role="group" aria-label="优先级">
            <button class="choice-chip${important ? "" : " is-active"}" type="button" data-priority="normal">普通</button>
            <button class="choice-chip important-only${important ? " is-active" : ""}" type="button" data-priority="important">重要</button>
          </div>
        </div>
      </div>
      <div class="sheet-footer">
        <button class="primary-button" type="submit">${isEdit ? "保存修改" : "添加计划"}</button>
      </div>
    </form>`;

    const sheet = showSheet({
      kicker: "计划",
      title: isEdit ? "编辑计划" : "写下一个计划",
      subtitle: isEdit ? "慢慢调整，也慢慢完成。" : "一件一件来，就已经很好。",
      content,
    });

    const form = sheet.sheet.querySelector("#plan-form");
    const dateInput = form.querySelector("#plan-date");
    const timeInput = form.querySelector("#plan-time");
    const quickDateButtons = [...form.querySelectorAll("[data-quick-date]")];
    const mediaEditor = setupMediaEditor({
      grid: form.querySelector("#plan-media-grid"),
      input: form.querySelector("#plan-media-input"),
      status: form.querySelector("#plan-media-status"),
      initialMedia: current.media || [],
    });

    const refreshQuickDates = () => {
      const today = localDateKey();
      const now = new Date();
      const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const weekDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
      quickDateButtons.forEach((button) => {
        const key = button.dataset.quickDate;
        let active = false;
        if (key === "today") active = dateInput.value === today;
        else if (key === "tomorrow") active = dateInput.value === localDateKey(tomorrowDate);
        else if (key === "week") active = dateInput.value === localDateKey(weekDate);
        else if (key === "none") active = !dateInput.value;
        button.classList.toggle("is-active", active);
      });
    };

    quickDateButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.quickDate;
        const now = new Date();
        if (key === "today") dateInput.value = localDateKey(now);
        if (key === "tomorrow") {
          dateInput.value = localDateKey(
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          );
        }
        if (key === "week") {
          dateInput.value = localDateKey(
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
          );
        }
        if (key === "none") dateInput.value = "";
        refreshQuickDates();
      });
    });
    dateInput.addEventListener("change", refreshQuickDates);
    refreshQuickDates();

    form.querySelectorAll("[data-priority]").forEach((button) => {
      button.addEventListener("click", () => {
        important = button.dataset.priority === "important";
        form.querySelectorAll("[data-priority]").forEach((chip) => {
          chip.classList.toggle("is-active", chip === button);
        });
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = form.querySelector("#plan-title").value.trim();
      if (!title) {
        form.querySelector("#plan-title").focus();
        showToast("先写下计划内容吧");
        return;
      }
      if (mediaEditor.isProcessing()) {
        showToast("图片/视频还在处理中，稍等一下");
        return;
      }
      const dueDate = dateInput.value;
      const dueTime = dueDate ? timeInput.value : "";
      const notes = form.querySelector("#plan-notes").value.trim();
      const media = mediaEditor.getMedia();
      if (isEdit) {
        plan.title = title;
        plan.notes = notes;
        plan.dueDate = parseDateKey(dueDate) ? dueDate : "";
        plan.dueTime = formatTimeValue(dueTime);
        plan.important = important;
        plan.media = media;
        plan.updatedAt = nowISO();
      } else {
        appState.plans.push({
          id: newId(),
          title,
          notes,
          dueDate: parseDateKey(dueDate) ? dueDate : "",
          dueTime: formatTimeValue(dueTime),
          important,
          completed: false,
          completedAt: "",
          media,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        });
      }
      persist();
      closeSheet(true);
      navigate("plan");
      showToast(isEdit ? "计划已更新" : "计划已添加");
    });
  }

  function openDailyForm(entry = null) {
    const isEdit = Boolean(entry);
    const current = entry || {
      text: "",
      date: localDateKey(),
      media: [],
    };
    const content = `<form class="sheet-form" id="daily-form" novalidate>
      <div class="sheet-body">
        <label class="field">
          <span class="field-label">日期</span>
          <input class="text-input" id="daily-date" name="date" type="date" value="${escapeHTML(
            current.date
          )}" aria-label="记录日期">
        </label>
        <label class="field">
          <span class="field-label">今天发生了什么 <em>选填</em></span>
          <textarea class="text-area large" id="daily-text" name="text" maxlength="6000"
            placeholder="今天发生了什么？有什么想记住的？" data-autofocus>${escapeHTML(
              current.text
            )}</textarea>
        </label>
        <div class="image-uploader">
          <div class="field-label">
            <span>图片 / 视频 <em>${mediaLimitLabel()}</em></span>
          </div>
          <div class="image-grid" id="daily-media-grid"></div>
          <input class="hidden" id="daily-media-input" type="file" accept="image/*,video/*" multiple>
          <div class="upload-status" id="daily-media-status" role="status"></div>
        </div>
      </div>
      <div class="sheet-footer">
        <button class="primary-button" type="submit">${isEdit ? "保存修改" : "收进日常"}</button>
      </div>
    </form>`;

    const sheet = showSheet({
      kicker: "日常记录",
      title: isEdit ? "编辑记录" : "记下今天",
      subtitle: "写几句话，或者留下几张照片和视频。",
      content,
    });

    const form = sheet.sheet.querySelector("#daily-form");
    const mediaEditor = setupMediaEditor({
      grid: form.querySelector("#daily-media-grid"),
      input: form.querySelector("#daily-media-input"),
      status: form.querySelector("#daily-media-status"),
      initialMedia: current.media || [],
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = form.querySelector("#daily-text").value.trim();
      const media = mediaEditor.getMedia();
      if (mediaEditor.isProcessing()) {
        showToast("图片/视频还在处理中，稍等一下");
        return;
      }
      if (!text && !media.length) {
        form.querySelector("#daily-text").focus();
        showToast("写一点文字，或者添加图片/视频");
        return;
      }
      const dateValue = form.querySelector("#daily-date").value;
      const date = parseDateKey(dateValue) ? dateValue : localDateKey();
      if (isEdit) {
        entry.text = text;
        entry.date = date;
        entry.media = media;
        entry.updatedAt = nowISO();
      } else {
        appState.daily.unshift({
          id: newId(),
          text,
          date,
          media,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        });
      }
      persist();
      closeSheet(true);
      navigate("daily");
      showToast(isEdit ? "记录已更新" : "今天，已经收好");
    });
  }

  function openFavoriteForm(favorite = null) {
    const isEdit = Boolean(favorite);
    const current = favorite || {
      title: "",
      notes: "",
      link: "",
      media: [],
    };
    const content = `<form class="sheet-form" id="favorite-form" novalidate>
      <div class="sheet-body">
        <label class="field">
          <span class="field-label">好物名称 <em>必填</em></span>
          <input class="text-input" id="favorite-title" name="title" type="text" maxlength="120"
            placeholder="例如：那只有点贵的杯子" value="${escapeHTML(
              current.title
            )}" data-autofocus autocomplete="off">
        </label>
        <label class="field">
          <span class="field-label">为什么喜欢 <em>选填</em></span>
          <textarea class="text-area" id="favorite-notes" name="notes" maxlength="4000"
            placeholder="颜色、质感，或者它让你想起的某个瞬间…">${escapeHTML(
              current.notes
            )}</textarea>
        </label>
        <div class="image-uploader">
          <div class="field-label">
            <span>图片 / 视频 <em>${mediaLimitLabel()}</em></span>
          </div>
          <div class="image-grid" id="favorite-media-grid"></div>
          <input class="hidden" id="favorite-media-input" type="file" accept="image/*,video/*" multiple>
          <div class="upload-status" id="favorite-media-status" role="status"></div>
        </div>
        <label class="field">
          <span class="field-label">相关链接 <em>选填</em></span>
          <div class="input-suffix-wrap">
            <input class="text-input" id="favorite-link" name="link" type="text" inputmode="url"
              placeholder="https://…" value="${escapeHTML(current.link || "")}" autocomplete="off">
            <span class="input-suffix" aria-hidden="true">${icon("link")}</span>
          </div>
        </label>
      </div>
      <div class="sheet-footer">
        <button class="primary-button" type="submit" id="favorite-submit">${isEdit ? "保存修改" : "收进收藏夹"}</button>
      </div>
    </form>`;

    const sheet = showSheet({
      kicker: "好物收藏",
      title: isEdit ? "编辑好物" : "收藏一件好物",
      subtitle: "文字、图片、视频和链接，都可以一起留下。",
      content,
    });

    const form = sheet.sheet.querySelector("#favorite-form");
    const submitButton = form.querySelector("#favorite-submit");
    const mediaEditor = setupMediaEditor({
      grid: form.querySelector("#favorite-media-grid"),
      input: form.querySelector("#favorite-media-input"),
      status: form.querySelector("#favorite-media-status"),
      initialMedia: current.media || [],
      onProcessingChange: (processing) => {
        submitButton.disabled = processing;
      },
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (mediaEditor.isProcessing()) {
        showToast("图片/视频还在处理中，稍等一下");
        return;
      }
      const title = form.querySelector("#favorite-title").value.trim();
      if (!title) {
        form.querySelector("#favorite-title").focus();
        showToast("给这件好物起个名字吧");
        return;
      }
      const rawLink = form.querySelector("#favorite-link").value.trim();
      const link = rawLink ? safeLink(rawLink) : "";
      if (rawLink && !link) {
        form.querySelector("#favorite-link").focus();
        showToast("链接格式不太对，试试 https:// 开头");
        return;
      }
      const notes = form.querySelector("#favorite-notes").value.trim();
      const media = mediaEditor.getMedia();
      if (isEdit) {
        favorite.title = title;
        favorite.notes = notes;
        favorite.link = link;
        favorite.media = media;
        favorite.updatedAt = nowISO();
      } else {
        appState.favorites.unshift({
          id: newId(),
          title,
          notes,
          link,
          media,
          pinned: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        });
      }
      persist();
      closeSheet(true);
      navigate("favorites");
      showToast(isEdit ? "好物已更新" : "已收进收藏夹");
    });
  }

  /* ---------------- Item actions ---------------- */

  function completePlan(id, options = {}) {
    const plan = findPlan(id);
    if (!plan || plan.completed) return;
    plan.completed = true;
    plan.completedAt = nowISO();
    plan.updatedAt = nowISO();
    persist();
    render();
    haptic();
    if (!options.silent) {
      showToast("完成一件，真棒 ✨", {
        actionLabel: "撤销",
        onAction: () => {
          const target = findPlan(id);
          if (!target) return;
          target.completed = false;
          target.completedAt = "";
          target.updatedAt = nowISO();
          persist();
          render();
          showToast("已恢复为待办");
        },
      });
    }
  }

  function restorePlan(id) {
    const plan = findPlan(id);
    if (!plan) return;
    plan.completed = false;
    plan.completedAt = "";
    plan.updatedAt = nowISO();
    persist();
    render();
    showToast("已恢复为待办", {
      actionLabel: "撤销",
      onAction: () => {
        const target = findPlan(id);
        if (!target) return;
        target.completed = true;
        target.completedAt = nowISO();
        target.updatedAt = nowISO();
        persist();
        render();
        showToast("已重新标记为完成");
      },
    });
  }

  function deletePlan(id) {
    const index = appState.plans.findIndex((item) => item.id === id);
    if (index < 0) return;
    const [removed] = appState.plans.splice(index, 1);
    persist();
    render();
    showToast("计划已删除", {
      actionLabel: "撤销",
      onAction: () => {
        appState.plans.splice(Math.min(index, appState.plans.length), 0, removed);
        persist();
        render();
        showToast("已撤销删除");
      },
    });
  }

  function deleteDaily(id) {
    const index = appState.daily.findIndex((item) => item.id === id);
    if (index < 0) return;
    const [removed] = appState.daily.splice(index, 1);
    persist();
    render();
    showToast("记录已删除", {
      actionLabel: "撤销",
      onAction: () => {
        appState.daily.splice(Math.min(index, appState.daily.length), 0, removed);
        persist();
        render();
        showToast("已撤销删除");
      },
    });
  }

  function deleteFavorite(id) {
    const index = appState.favorites.findIndex((item) => item.id === id);
    if (index < 0) return;
    const [removed] = appState.favorites.splice(index, 1);
    persist();
    render();
    showToast("收藏已删除", {
      actionLabel: "撤销",
      onAction: () => {
        appState.favorites.splice(Math.min(index, appState.favorites.length), 0, removed);
        persist();
        render();
        showToast("已撤销删除");
      },
    });
  }

  /* ---------------- Search ---------------- */

  function openSearchSheet() {
    const content = `<div class="sheet-body">
      <div class="search-bar">
        ${icon("search")}
        <input class="search-input" id="global-search-input" type="search" inputmode="search"
          placeholder="搜索计划、日常或好物…" autocomplete="off" enterkeyhint="search" aria-label="搜索全部记录">
        <button class="search-clear" id="search-clear" type="button" aria-label="清空搜索">${icon(
          "close"
        )}</button>
      </div>
      <div id="search-results"></div>
    </div>`;
    const sheet = showSheet({
      kicker: "查找",
      title: "搜索",
      subtitle: "所有记录都能在这里找到。",
      content,
    });

    const input = sheet.sheet.querySelector("#global-search-input");
    const clearButton = sheet.sheet.querySelector("#search-clear");
    const results = sheet.sheet.querySelector("#search-results");

    const update = () => {
      const query = input.value.trim().toLowerCase();
      clearButton.classList.toggle("is-visible", Boolean(input.value));
      if (!query) {
        results.innerHTML = `<div class="search-hint">
          <div class="search-hint-icon" aria-hidden="true">${icon("search")}</div>
          <p>输入关键词，计划、日常和收藏都会一起找。</p>
        </div>`;
        return;
      }

      const planMatches = appState.plans.filter((item) =>
        `${item.title} ${item.notes}`.toLowerCase().includes(query)
      );
      const dailyMatches = appState.daily.filter((item) =>
        `${item.text}`.toLowerCase().includes(query)
      );
      const favoriteMatches = appState.favorites.filter((item) =>
        `${item.title} ${item.notes} ${item.link || ""}`.toLowerCase().includes(query)
      );
      const total = planMatches.length + dailyMatches.length + favoriteMatches.length;
      if (!total) {
        results.innerHTML = `<div class="search-no-result">
          <strong>没有找到相关记录</strong>
          <p>换个关键词试试，或者记下此刻的新想法。</p>
        </div>`;
        return;
      }

      const groups = [];
      if (planMatches.length) {
        groups.push(`<div class="search-group">
          <p class="search-group-title">计划 <span>${planMatches.length}</span></p>
          <div class="search-results-card">${planMatches
            .slice(0, 40)
            .map(
              (item) => `<button class="search-result" type="button" data-result-type="plan" data-id="${escapeHTML(
                item.id
              )}">
                <span class="search-result-icon recent-icon ${
                  item.completed ? "done" : "plan"
                }" aria-hidden="true">${icon(item.completed ? "check" : "calendar")}</span>
                <span class="search-result-copy">
                  <span class="search-result-title">${escapeHTML(item.title)}</span>
                  <span class="search-result-snippet">${escapeHTML(
                    item.completed
                      ? "已完成"
                      : item.dueDate
                      ? `计划 · ${formatDateLabel(item.dueDate)}`
                      : "计划"
                  )}${item.media.length ? ` · ${item.media.length} 个附件` : ""}${
                    item.notes ? ` · ${escapeHTML(truncateText(item.notes, 36))}` : ""
                  }</span>
                </span>
                ${icon("chevronRight", "recent-arrow")}
              </button>`
            )
            .join("")}</div>
        </div>`);
      }
      if (dailyMatches.length) {
        groups.push(`<div class="search-group">
          <p class="search-group-title">日常记录 <span>${dailyMatches.length}</span></p>
          <div class="search-results-card">${dailyMatches
            .slice(0, 40)
            .map(
              (item) => `<button class="search-result" type="button" data-result-type="daily" data-id="${escapeHTML(
                item.id
              )}">
                <span class="search-result-icon recent-icon daily" aria-hidden="true">${icon(
                  "note"
                )}</span>
                <span class="search-result-copy">
                  <span class="search-result-title">${escapeHTML(
                    item.text.trim() ? truncateText(item.text, 50) : "图片/视频日常"
                  )}</span>
                  <span class="search-result-snippet">${escapeHTML(
                    `${formatFriendlyDate(item.date)}${
                      item.media.length ? ` · ${item.media.length} 个附件` : ""
                    }`
                  )}</span>
                </span>
                ${icon("chevronRight", "recent-arrow")}
              </button>`
            )
            .join("")}</div>
        </div>`);
      }
      if (favoriteMatches.length) {
        groups.push(`<div class="search-group">
          <p class="search-group-title">好物收藏 <span>${favoriteMatches.length}</span></p>
          <div class="search-results-card">${favoriteMatches
            .slice(0, 40)
            .map(
              (item) => `<button class="search-result" type="button" data-result-type="favorite" data-id="${escapeHTML(
                item.id
              )}">
                <span class="search-result-icon recent-icon favorite" aria-hidden="true">${icon(
                  "heart"
                )}</span>
                <span class="search-result-copy">
                  <span class="search-result-title">${escapeHTML(item.title)}</span>
                  <span class="search-result-snippet">${escapeHTML(
                    item.notes
                      ? truncateText(item.notes, 40)
                      : item.media.length
                      ? mediaSummary(item.media)
                      : "好物收藏"
                  )}</span>
                </span>
                ${icon("chevronRight", "recent-arrow")}
              </button>`
            )
            .join("")}</div>
        </div>`);
      }
      results.innerHTML = groups.join("");
      results.querySelectorAll("[data-result-type]").forEach((button) => {
        button.addEventListener("click", () => {
          const type = button.dataset.resultType;
          const id = button.dataset.id;
          if (type === "plan") openPlanForm(findPlan(id));
          if (type === "daily") openDailyForm(findDaily(id));
          if (type === "favorite") openFavoriteForm(findFavorite(id));
        });
      });
    };

    input.addEventListener("input", update);
    clearButton.addEventListener("click", () => {
      input.value = "";
      update();
      input.focus();
    });
    update();
    window.setTimeout(() => input.focus({ preventScroll: true }), 260);
  }

  /* ---------------- Data sheet ---------------- */

  function itemMergeTime(item) {
    const value = item && (item.updatedAt || item.completedAt || item.createdAt);
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
  }

  function mergeImportedState(current, incoming) {
    const stats = { added: 0, updated: 0, skipped: 0 };
    const mergeCollection = (currentItems, incomingItems) => {
      const map = new Map(currentItems.map((item) => [item.id, item]));
      incomingItems.forEach((item) => {
        const existing = map.get(item.id);
        if (!existing) {
          map.set(item.id, item);
          stats.added += 1;
          return;
        }
        if (itemMergeTime(item) > itemMergeTime(existing)) {
          map.set(item.id, item);
          stats.updated += 1;
        } else {
          stats.skipped += 1;
        }
      });
      return [...map.values()];
    };
    const state = {
      version: DATA_VERSION,
      plans: mergeCollection(current.plans, incoming.plans),
      daily: mergeCollection(current.daily, incoming.daily),
      favorites: mergeCollection(current.favorites, incoming.favorites),
      updatedAt: nowISO(),
    };
    return { state, stats };
  }

  function showImportChoiceDialog({ currentCount, backupCount }) {
    return new Promise((resolve) => {
      const layer = document.createElement("div");
      layer.className = "confirm-layer import-choice-layer";
      layer.innerHTML = `
        <button class="confirm-backdrop" type="button" data-import-cancel aria-label="取消导入"></button>
        <div class="confirm-card import-choice-card" role="dialog" aria-modal="true" aria-labelledby="import-choice-title">
          <div class="confirm-icon import-choice-icon" aria-hidden="true">${icon("download")}</div>
          <h2 class="confirm-title" id="import-choice-title">导入备份</h2>
          <p class="confirm-text">备份中有 ${backupCount} 条记录，本机现有 ${currentCount} 条。请选择导入方式。</p>
          <div class="import-choice-list">
            <button class="import-choice-option" type="button" data-import-mode="merge">
              <span class="import-choice-icon" aria-hidden="true">${icon("plus")}</span>
              <span class="import-choice-copy">
                <strong>合并导入</strong>
                <span>保留本机，补入备份；同一条取较新版本</span>
              </span>
              ${icon("chevronRight", "recent-arrow")}
            </button>
            <button class="import-choice-option is-danger" type="button" data-import-mode="overwrite">
              <span class="import-choice-icon" aria-hidden="true">${icon("rotate")}</span>
              <span class="import-choice-copy">
                <strong>覆盖导入</strong>
                <span>用备份完全替换本机数据</span>
              </span>
              ${icon("chevronRight", "recent-arrow")}
            </button>
          </div>
          <button class="cancel-button import-choice-cancel" type="button" data-import-cancel>取消</button>
        </div>`;
      document.body.appendChild(layer);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => layer.classList.add("is-open"));
      });

      let settled = false;
      const finish = (mode) => {
        if (settled) return;
        settled = true;
        activeConfirm = null;
        layer.classList.remove("is-open");
        window.setTimeout(() => layer.remove(), 240);
        resolve(mode);
      };
      layer.querySelectorAll("[data-import-cancel]").forEach((button) => {
        button.addEventListener("click", () => finish(null));
      });
      layer.querySelectorAll("[data-import-mode]").forEach((button) => {
        button.addEventListener("click", () => finish(button.dataset.importMode));
      });
      activeConfirm = { close: () => finish(null) };
      window.setTimeout(() => {
        const firstChoice = layer.querySelector("[data-import-mode]");
        if (firstChoice) firstChoice.focus({ preventScroll: true });
      }, 160);
    });
  }

  function openDataSheet() {
    const doneCount = appState.plans.filter((item) => item.completed).length;
    const content = `<div class="sheet-body">
      <div class="privacy-card">
        <span class="privacy-card-icon" aria-hidden="true">${icon("lock")}</span>
        <div>
          <strong>数据只保存在这台设备</strong>
          <p>不上传服务器，也不经过任何账号。换手机或清理浏览器前，请先导出一份备份。</p>
        </div>
      </div>
      <div class="data-stats">
        <div class="data-stat"><strong>${appState.plans.length}</strong><span>计划</span></div>
        <div class="data-stat"><strong>${appState.daily.length}</strong><span>日常</span></div>
        <div class="data-stat"><strong>${appState.favorites.length}</strong><span>收藏</span></div>
      </div>
      <p class="data-section-label">备份与迁移</p>
      <div class="data-actions">
        <button class="data-action" type="button" id="export-data">
          <span class="data-action-icon" aria-hidden="true">${icon("download")}</span>
          <span class="data-action-copy"><strong>导出备份</strong><span>固定文件名 · 可存到「文件」或「备忘录」</span></span>
          ${icon("chevronRight", "recent-arrow")}
        </button>
        <button class="data-action" type="button" id="import-data">
          <span class="data-action-icon" aria-hidden="true">${icon("upload")}</span>
          <span class="data-action-copy"><strong>导入备份</strong><span>支持合并导入或覆盖导入</span></span>
          ${icon("chevronRight", "recent-arrow")}
        </button>
        <button class="data-action" type="button" id="install-app">
          <span class="data-action-icon" aria-hidden="true">${icon("sparkles")}</span>
          <span class="data-action-copy"><strong>添加到主屏幕</strong><span>像 App 一样打开，也能离线使用</span></span>
          ${icon("chevronRight", "recent-arrow")}
        </button>
      </div>
      <p class="data-tip">导出时会打开系统保存面板，可以选择「存储到文件」或「备忘录」。文件名固定为 <strong>${BACKUP_FILENAME}</strong>，再次导出时请覆盖旧文件。</p>
      <div class="export-status" id="export-status" role="status" aria-live="polite" hidden></div>
      <p class="data-section-label">管理</p>
      <div class="data-actions">
        <button class="data-action danger" type="button" id="clear-data">
          <span class="data-action-icon" aria-hidden="true">${icon("trash")}</span>
          <span class="data-action-copy"><strong>清空全部数据</strong><span>此操作不可恢复，请先导出备份</span></span>
          ${icon("chevronRight", "recent-arrow")}
        </button>
      </div>
      <p class="version-line">拾光备忘 v${APP_VERSION} · 本地优先<br><span id="storage-usage">正在读取本机存储…</span></p>
      <input class="hidden" id="import-file-input" type="file" accept=".json,application/json">
    </div>`;

    const sheet = showSheet({
      kicker: "本机数据",
      title: "数据与备份",
      subtitle: `${totalRecordCount()} 条记录，${doneCount} 件已完成。`,
      content,
    });

    const usage = sheet.sheet.querySelector("#storage-usage");
    storageUsageText().then((text) => {
      if (usage && usage.isConnected) usage.textContent = text;
    });

    sheet.sheet
      .querySelector("#install-app")
      .addEventListener("click", () => handleInstall());
    sheet.sheet.querySelector("#export-data").addEventListener("click", () => exportBackup());
    sheet.sheet
      .querySelector("#clear-data")
      .addEventListener("click", async () => {
        const accepted = await confirmDialog({
          title: "清空全部数据？",
          text: `计划、日常和收藏共 ${totalRecordCount()} 条记录都会被删除，且无法恢复。建议先导出备份。`,
          confirmLabel: "确认清空",
          danger: true,
        });
        if (!accepted) return;
        appState = emptyState();
        persist();
        closeSheet(true);
        navigate("home");
        render();
        showToast("所有数据已清空");
      });

    const importInput = sheet.sheet.querySelector("#import-file-input");
    sheet.sheet.querySelector("#import-data").addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", async () => {
      const file = importInput.files && importInput.files[0];
      importInput.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error("备份文件不是有效的 JSON");
        }
        const payload = parsed && parsed.data ? parsed.data : parsed;
        if (
          !payload ||
          typeof payload !== "object" ||
          !Array.isArray(payload.plans) ||
          !Array.isArray(payload.daily) ||
          !Array.isArray(payload.favorites)
        ) {
          throw new Error("这不是拾光备忘的备份文件");
        }
        const imported = normalizeState(payload);
        const backupCount = totalRecordCountOf(imported);
        if (!backupCount) {
          throw new Error("这份备份里没有可导入的记录");
        }
        const currentCount = totalRecordCount();
        const mode = await showImportChoiceDialog({
          currentCount,
          backupCount,
        });
        if (!mode) return;

        if (mode === "overwrite") {
          const accepted = await confirmDialog({
            title: "确认覆盖当前数据？",
            text: `备份中的 ${backupCount} 条记录将替换本机的 ${currentCount} 条记录，且无法撤销。建议先导出当前数据。`,
            confirmLabel: "确认覆盖",
            danger: true,
          });
          if (!accepted) return;
          appState = imported;
          persist();
          closeSheet(true);
          navigate("home");
          render();
          showToast(`覆盖导入完成，共 ${backupCount} 条记录`, { duration: 4200 });
          return;
        }

        const merged = mergeImportedState(appState, imported);
        appState = merged.state;
        persist();
        closeSheet(true);
        navigate("home");
        render();
        const { added, updated, skipped } = merged.stats;
        let message = `合并完成：新增 ${added} 条，更新 ${updated} 条`;
        if (skipped) message += `，保留本机较新版本 ${skipped} 条`;
        showToast(message, { duration: 5000 });
      } catch (error) {
        showToast(error.message || "导入失败，请检查备份文件", { duration: 4200 });
      }
    });
  }

  function totalRecordCountOf(state) {
    return state.plans.length + state.daily.length + state.favorites.length;
  }

  function isAppleMobileDevice() {
    if (/android/i.test(navigator.userAgent)) return false;
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
    return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }

  function setExportStatus(kind, message) {
    const status = document.getElementById("export-status");
    if (!status) return;
    const iconName =
      kind === "success" ? "checkCircle" : kind === "error" ? "alert" : "clock";
    status.className = `export-status is-${kind}`;
    status.innerHTML = `${icon(iconName)}<span>${escapeHTML(message)}</span>`;
    status.hidden = false;
  }

  function downloadBackup(blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = BACKUP_FILENAME;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function exportBackup() {
    try {
      const payload = {
        app: "shiguang-memo",
        schema: DATA_VERSION,
        appVersion: APP_VERSION,
        exportedAt: nowISO(),
        data: appState,
      };
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const file =
        typeof File === "function"
          ? new File([blob], BACKUP_FILENAME, { type: "application/json" })
          : null;

      let canShareFile = false;
      if (
        file &&
        isAppleMobileDevice() &&
        typeof navigator.share === "function"
      ) {
        try {
          canShareFile =
            typeof navigator.canShare === "function" &&
            navigator.canShare({ files: [file] });
        } catch {
          canShareFile = false;
        }
      }

      if (canShareFile) {
        try {
          await navigator.share({
            files: [file],
            title: "拾光备忘备份",
          });
          setExportStatus("success", "备份已导出，可在「文件」或「备忘录」中查看。");
          showToast("备份已导出", { duration: 4200 });
          return;
        } catch (error) {
          if (error && error.name === "AbortError") {
            setExportStatus("neutral", "已取消导出。");
            showToast("已取消导出");
            return;
          }
          console.warn("Web Share failed, falling back to download.", error);
        }
      }

      downloadBackup(blob);
      setExportStatus(
        "success",
        "备份已生成并开始下载。请在「文件 → 下载」中查看；如果无法保存，请重新打开应用后再试。"
      );
      showToast("备份已开始下载，请到「文件」中查看", { duration: 5000 });
    } catch (error) {
      console.warn("Backup export failed:", error);
      setExportStatus("error", "导出失败，请稍后再试。");
      showToast("导出失败，请稍后再试", { duration: 4000 });
    }
  }

  function handleInstall() {
    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      promptEvent.prompt();
      promptEvent.userChoice
        .then((choice) => {
          if (choice.outcome === "accepted") {
            closeSheet(true);
            showToast("已添加到主屏幕");
          }
        })
        .catch(() => {});
      return;
    }
    openInstallHelp();
  }

  function isAndroidDevice() {
    return /android/i.test(navigator.userAgent);
  }

  function isStandaloneMode() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.navigator.standalone === true
    );
  }

  function shouldOfferInstall() {
    if (!isAppleMobileDevice() && !isAndroidDevice()) return false;
    if (isStandaloneMode()) return false;
    return true;
  }

  function scheduleInstallPrompt() {
    if (!shouldOfferInstall()) return;
    if (installPromptTimer) window.clearTimeout(installPromptTimer);
    installPromptTimer = window.setTimeout(() => {
      if (installPromptShownThisSession) return;
      if (!shouldOfferInstall()) return;
      if (currentSheet || activeConfirm || activeLightbox) return;
      if (document.visibilityState !== "visible") return;
      installPromptShownThisSession = true;
      showInstallNudge();
    }, 2200);
  }

  function showInstallNudge() {
    const isIOS = isAppleMobileDevice();
    const hint = isIOS
      ? "在 Safari 底部点「共享」，选择「添加到主屏幕」"
      : "在 Chrome 右上角菜单选择「添加到主屏幕」或「安装应用」";
    const content = `<div class="sheet-body">
      <div class="install-nudge-card">
        <span class="install-nudge-app" aria-hidden="true">${BRAND_MARK}</span>
        <div class="install-nudge-copy">
          <strong>拾光备忘</strong>
          <span>添加到主屏幕，打开更快，也能离线使用。</span>
        </div>
      </div>
      <div class="install-benefits">
        <div class="install-benefit">
          <span aria-hidden="true">${icon("sparkles")}</span>
          <div><strong>免去找网址</strong><span>从桌面图标直接打开</span></div>
        </div>
        <div class="install-benefit">
          <span aria-hidden="true">${icon("lock")}</span>
          <div><strong>数据仍然只在手机本地</strong><span>不会上传到服务器</span></div>
        </div>
        <div class="install-benefit">
          <span aria-hidden="true">${icon("download")}</span>
          <div><strong>断网也能打开</strong><span>已缓存的内容离线可查看</span></div>
        </div>
      </div>
      <p class="install-nudge-hint">${escapeHTML(hint)}</p>
    </div>
    <div class="sheet-footer">
      <div class="sheet-footer-row">
        <button class="secondary-button" id="install-nudge-later" type="button">暂不</button>
        <button class="primary-button" id="install-nudge-confirm" type="button">去添加</button>
      </div>
      <p class="sheet-helper">以后也可以在「数据与备份 → 添加到主屏幕」再次打开</p>
    </div>`;
    const sheet = showSheet({
      kicker: "安装",
      title: "把拾光放到主屏幕",
      subtitle: "像 App 一样打开，记录会更顺手。",
      content,
    });
    sheet.sheet
      .querySelector("#install-nudge-later")
      .addEventListener("click", () => sheet.close());
    sheet.sheet
      .querySelector("#install-nudge-confirm")
      .addEventListener("click", () => handleInstall());
  }

  function openInstallHelp() {
    const isIOS = isAppleMobileDevice();
    const isStandalone = isStandaloneMode();
    if (isStandalone) {
      showToast("已经添加到主屏幕了");
      return;
    }
    const steps = isIOS
      ? [
          "点击 Safari 底部的「共享」按钮",
          "向下找到「添加到主屏幕」并点击",
          "确认名称后点「添加」，之后从桌面图标打开",
        ]
      : [
          "点击浏览器右上角的菜单按钮",
          "选择「添加到主屏幕」或「安装应用」",
          "确认后，之后从桌面图标打开即可",
        ];
    const content = `<div class="sheet-body">
      <div class="privacy-card" style="background:var(--blue-soft);color:#3d7ca9">
        <span class="privacy-card-icon" aria-hidden="true" style="background:var(--blue)">${icon(
          "sparkles"
        )}</span>
        <div style="color:inherit">
          <strong style="color:#356b94">从桌面直接打开</strong>
          <p style="color:#6c93ac">添加后更像一个 App，也能在离线时打开。</p>
        </div>
      </div>
      <div class="data-section-label">添加步骤</div>
      <div class="action-group">
        ${steps
          .map(
            (step, index) => `<div class="action-item" style="cursor:default">
              <span class="action-item-icon" style="color:var(--blue-deep);background:var(--blue-soft)">${
                index + 1
              }</span>
              <span class="action-item-label">${escapeHTML(step)}</span>
            </div>`
          )
          .join("")}
      </div>
      <button class="cancel-button" type="button" data-close-help>知道了</button>
    </div>`;
    const sheet = showSheet({
      kicker: "安装",
      title: "添加到主屏幕",
      content,
    });
    sheet.sheet
      .querySelector("[data-close-help]")
      .addEventListener("click", () => sheet.close());
  }

  /* ---------------- Confirm dialog ---------------- */

  function confirmDialog({
    title,
    text,
    confirmLabel = "确认",
    cancelLabel = "取消",
    danger = true,
    tone = "",
  }) {
    return new Promise((resolve) => {
      const layer = document.createElement("div");
      layer.className = "confirm-layer";
      if (tone) layer.dataset.tone = tone;
      layer.innerHTML = `
        <button class="confirm-backdrop" type="button" data-confirm-cancel aria-label="取消"></button>
        <div class="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
          <div class="confirm-icon" aria-hidden="true">${icon(danger ? "trash" : "upload")}</div>
          <h2 class="confirm-title" id="confirm-title">${escapeHTML(title)}</h2>
          <p class="confirm-text" id="confirm-text">${escapeHTML(text)}</p>
          <div class="confirm-actions">
            <button class="confirm-cancel" type="button" data-confirm-cancel>${escapeHTML(cancelLabel)}</button>
            <button class="confirm-ok" type="button" data-confirm-ok>${escapeHTML(confirmLabel)}</button>
          </div>
        </div>`;
      document.body.appendChild(layer);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => layer.classList.add("is-open"));
      });

      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        activeConfirm = null;
        layer.classList.remove("is-open");
        window.setTimeout(() => layer.remove(), 240);
        resolve(value);
      };
      layer.querySelectorAll("[data-confirm-cancel]").forEach((button) => {
        button.addEventListener("click", () => finish(false));
      });
      layer.querySelector("[data-confirm-ok]").addEventListener("click", () => finish(true));
      activeConfirm = { close: () => finish(false) };
      window.setTimeout(() => {
        const cancelButton = layer.querySelector(".confirm-cancel");
        if (cancelButton) cancelButton.focus({ preventScroll: true });
      }, 160);
    });
  }

  /* ---------------- Image lightbox ---------------- */

  function openLightbox(mediaItems, startIndex = 0) {
    const items = Array.isArray(mediaItems) ? mediaItems.filter(Boolean) : [];
    if (!items.length) return;
    const layer = document.createElement("div");
    layer.className = "lightbox";
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-label", "媒体预览");
    layer.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="关闭预览">${icon("close")}</button>
      <div class="lightbox-figure">
        <div class="lightbox-media"></div>
      </div>
      <button class="lightbox-nav prev" type="button" aria-label="上一个">${icon("chevronLeft")}</button>
      <button class="lightbox-nav next" type="button" aria-label="下一个">${icon("chevronRight")}</button>
      <span class="lightbox-count"></span>`;
    document.body.appendChild(layer);
    document.body.classList.add("lightbox-open");
    const mediaContainer = layer.querySelector(".lightbox-media");
    const counter = layer.querySelector(".lightbox-count");
    const prev = layer.querySelector(".prev");
    const next = layer.querySelector(".next");
    let index = Math.min(Math.max(0, startIndex), items.length - 1);
    let currentVideo = null;
    let currentVideoUrl = "";

    const stopVideo = () => {
      if (currentVideo) {
        try {
          currentVideo.pause();
          currentVideo.removeAttribute("src");
          currentVideo.load();
        } catch {
          /* noop */
        }
        currentVideo = null;
      }
      if (currentVideoUrl) {
        URL.revokeObjectURL(currentVideoUrl);
        currentVideoUrl = "";
      }
    };

    const draw = () => {
      stopVideo();
      mediaContainer.innerHTML = "";
      const item = items[index];
      const isVideo = item.type === "video";
      if (isVideo) {
        const video = document.createElement("video");
        video.className = "lightbox-video";
        video.controls = false;
        video.playsInline = true;
        video.preload = "metadata";
        if (item.poster) video.poster = item.poster;
        const videoBlob = dataUrlToBlob(item.src);
        currentVideoUrl = videoBlob ? URL.createObjectURL(videoBlob) : "";
        video.src = currentVideoUrl || item.src;
        const playButton = document.createElement("button");
        playButton.type = "button";
        playButton.className = "lightbox-video-play";
        playButton.setAttribute("aria-label", "播放视频");
        playButton.innerHTML = icon("play");
        const startPlayback = () => {
          if (!video.isConnected) return;
          video.controls = true;
          playButton.remove();
          video.play().catch(() => {
            /* 用户也可以通过原生控件继续操作 */
          });
        };
        playButton.addEventListener("click", startPlayback);
        mediaContainer.appendChild(video);
        mediaContainer.appendChild(playButton);
        currentVideo = video;
      } else {
        const image = document.createElement("img");
        image.className = "lightbox-img";
        image.alt = `图片 ${index + 1} / ${items.length}`;
        image.src = item.src;
        mediaContainer.appendChild(image);
      }
      counter.textContent = `${isVideo ? "视频" : "图片"} · ${index + 1} / ${items.length}`;
      prev.hidden = items.length < 2;
      next.hidden = items.length < 2;
    };
    const step = (delta) => {
      index = (index + delta + items.length) % items.length;
      draw();
    };
    const close = () => {
      if (activeLightbox !== handle) return;
      activeLightbox = null;
      stopVideo();
      layer.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      window.setTimeout(() => layer.remove(), 240);
    };
    const handle = { close, next: () => step(1), prev: () => step(-1) };
    activeLightbox = handle;

    layer.querySelector(".lightbox-close").addEventListener("click", close);
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    layer.addEventListener("click", (event) => {
      if (
        event.target === layer ||
        event.target.classList.contains("lightbox-figure") ||
        event.target.classList.contains("lightbox-media")
      ) {
        close();
      }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    layer.addEventListener(
      "touchstart",
      (event) => {
        if (event.target.closest("video")) return;
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true }
    );
    layer.addEventListener(
      "touchend",
      (event) => {
        if (event.target.closest("video")) return;
        if (currentVideo) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          step(dx < 0 ? 1 : -1);
        }
      },
      { passive: true }
    );

    draw();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => layer.classList.add("is-open"));
    });
    window.setTimeout(() => {
      const closeButton = layer.querySelector(".lightbox-close");
      if (closeButton) closeButton.focus({ preventScroll: true });
    }, 120);
  }

  /* ---------------- Toast ---------------- */

  function getToastContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("role", "status");
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, options = {}) {
    const { actionLabel = "", onAction = null, duration = 3000 } = options;
    const container = getToastContainer();
    if (toastEl) {
      toastEl.remove();
      toastEl = null;
    }
    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }

    const element = document.createElement("div");
    element.className = "toast";
    const messageEl = document.createElement("span");
    messageEl.className = "toast-message";
    messageEl.textContent = message;
    element.appendChild(messageEl);

    let dismiss;
    if (actionLabel && typeof onAction === "function") {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "toast-action";
      action.textContent = actionLabel;
      action.addEventListener("click", () => {
        dismiss(true);
        onAction();
      });
      element.appendChild(action);
    }
    container.appendChild(element);
    toastEl = element;

    dismiss = (immediate = false) => {
      if (toastTimer) {
        window.clearTimeout(toastTimer);
        toastTimer = null;
      }
      if (!element.isConnected) return;
      if (immediate) {
        element.remove();
        if (toastEl === element) toastEl = null;
        return;
      }
      element.classList.add("is-leaving");
      window.setTimeout(() => {
        element.remove();
        if (toastEl === element) toastEl = null;
      }, 220);
    };

    toastTimer = window.setTimeout(() => dismiss(false), duration);
  }

  /* ---------------- Image compression ---------------- */

  function supportsWebp() {
    if (webpSupport !== null) return webpSupport;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      webpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
    } catch {
      webpSupport = false;
    }
    return webpSupport;
  }

  function loadImageElement(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("图片无法读取"));
      };
      image.src = url;
    });
  }

  async function compressImage(file, maxDimension = 1600, quality = 0.82) {
    if (!file.type.startsWith("image/")) {
      throw new Error("不是图片文件");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("单张图片请小于 30MB");
    }
    let source;
    try {
      source = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        source = await createImageBitmap(file);
      } catch {
        source = await loadImageElement(file);
      }
    }
    const width = source.width || source.naturalWidth;
    const height = source.height || source.naturalHeight;
    if (!width || !height) throw new Error("图片尺寸无法识别");
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("无法处理图片");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(source, 0, 0, targetWidth, targetHeight);
    if (source.close) {
      try {
        source.close();
      } catch {
        /* noop */
      }
    }
    const type = supportsWebp() ? "image/webp" : "image/jpeg";
    const dataUrl = canvas.toDataURL(type, quality);
    if (!dataUrl.startsWith("data:image/")) {
      throw new Error("图片压缩失败");
    }
    return dataUrl;
  }

  /* ---------------- Event delegation ---------------- */

  function handleDelegatedClick(event) {
    const navElement = event.target.closest("[data-nav]");
    if (navElement) {
      const route = navElement.dataset.nav;
      if (route) navigate(route);
      return;
    }

    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;
    const action = actionElement.dataset.action;
    const id = actionElement.dataset.id;

    if (action === "open-search") {
      openSearchSheet();
      return;
    }
    if (action === "open-data") {
      openDataSheet();
      return;
    }
    if (action === "fab") {
      if (currentRoute === "plan") openPlanBatchForm();
      else if (currentRoute === "daily") openDailyForm();
      else if (currentRoute === "favorites") openFavoriteForm();
      else openCreateSheet();
      return;
    }
    if (action === "new-plan") {
      openPlanBatchForm();
      return;
    }
    if (action === "new-daily") {
      openDailyForm();
      return;
    }
    if (action === "new-favorite") {
      openFavoriteForm();
      return;
    }
    if (action === "edit-plan") {
      openPlanForm(findPlan(id));
      return;
    }
    if (action === "edit-daily") {
      openDailyForm(findDaily(id));
      return;
    }
    if (action === "edit-favorite") {
      openFavoriteForm(findFavorite(id));
      return;
    }
    if (action === "toggle-plan") {
      const button = actionElement;
      if (button.disabled) return;
      button.disabled = true;
      button.classList.add("is-checking");
      window.setTimeout(() => completePlan(id), 190);
      return;
    }
    if (action === "plan-menu") {
      openPlanMenu(findPlan(id));
      return;
    }
    if (action === "daily-menu") {
      openDailyMenu(findDaily(id));
      return;
    }
    if (action === "favorite-menu") {
      openFavoriteMenu(findFavorite(id));
      return;
    }
    if (action === "add-plan-media") {
      pickPlanMedia(id);
      return;
    }
    if (action === "view-media") {
      const scope = actionElement.dataset.scope;
      let media = [];
      if (scope === "plan") {
        const plan = findPlan(id);
        media = plan ? plan.media : [];
      } else if (scope === "daily") {
        const entry = findDaily(id);
        media = entry ? entry.media : [];
      } else if (scope === "favorite") {
        const item = findFavorite(id);
        media = item ? item.media : [];
      }
      if (!media.length) return;
      openLightbox(media, Number(actionElement.dataset.index) || 0);
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      if (activeConfirm) {
        activeConfirm.close();
        return;
      }
      if (activeLightbox) {
        activeLightbox.close();
        return;
      }
      if (currentSheet) {
        closeSheet();
      }
      return;
    }
    if (activeLightbox) {
      const mediaElement =
        event.target && event.target.closest
          ? event.target.closest("video")
          : null;
      if (!mediaElement && event.key === "ArrowLeft") {
        activeLightbox.prev();
        return;
      }
      if (!mediaElement && event.key === "ArrowRight") {
        activeLightbox.next();
        return;
      }
    }
    if (event.key === "Tab" && currentSheet) {
      const focusable = [
        ...currentSheet.layer.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function preventPageZoom() {
    const preventGesture = (event) => {
      if (event.cancelable) event.preventDefault();
    };
    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });
    document.addEventListener("gestureend", preventGesture, { passive: false });
    document.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches && event.touches.length > 1 && event.cancelable) {
          event.preventDefault();
        }
      },
      { passive: false }
    );
    document.addEventListener("dblclick", preventGesture, { passive: false });
  }

  function setupEvents() {
    preventPageZoom();
    document.addEventListener("click", handleDelegatedClick);
    document.addEventListener("keydown", handleKeydown);

    window.addEventListener("hashchange", () => {
      if (currentSheet) closeSheet(true);
      if (activeConfirm) activeConfirm.close();
      if (activeLightbox) activeLightbox.close();
      render();
      window.scrollTo({ top: 0, behavior: "auto" });
    });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      showToast("已安装到主屏幕");
    });
  }

  /* ---------------- Boot ---------------- */

  async function init() {
    setupEvents();
    ensureInitialRoute();
    try {
      appState = await loadState();
    } catch (error) {
      console.error("Failed to load state", error);
      appState = emptyState();
      storageMode = "none";
    }
    render();
    if (storageMode === "none") {
      showToast("浏览器禁用了本地存储，记录将无法保存", { duration: 5000 });
    }
    requestPersistentStorage();
    registerServiceWorker();
    scheduleInstallPrompt();
  }

  function requestPersistentStorage() {
    if (storageMode !== "idb") return;
    if (!navigator.storage || typeof navigator.storage.persist !== "function") return;
    navigator.storage.persist().catch(() => {
      /* 浏览器可能拒绝持久化请求，此时依旧可以正常使用 */
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "http:" && window.location.protocol !== "https:") return;
    const start = () => {
      navigator.serviceWorker
        .register("./sw.js", { updateViaCache: "none" })
        .catch((error) => {
          console.warn("Service worker registration failed:", error);
        });
    };
    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
