// src/store/settings.js — การตั้งค่าระบบ + รายการลิงก์ Google Sheet (หลายลิงก์)
import { createStore, newId } from "./jsonStore.js";

const DEFAULTS = {
  lineToken: "",      // Channel access token ของ LINE OA
  notifyTime: "08:00",
  appPin: "",         // PIN เข้าระบบ (จำเป็นเมื่อเปิดใช้งานออนไลน์ — เว้นว่าง = ไม่ล็อก)
  sources: [],        // [{ id, name, brandId, url, replaceMode, lastSyncAt, lastCount }]
  // ราคามาตรฐานต่อผลลัพธ์ (บาท) — ใช้คำนวณเป้า KPI จากงบ
  // impression/reach = ราคาต่อ 1,000 หน่วย / ที่เหลือ = ราคาต่อ 1 หน่วย
  rateCard: {
    impression: 18,
    reach: 30,
    engagement: 3.5,
    click: 8,
    view: 0.1,
    lead: 50,
    message: 15,
    conversion: 100,
    roas: 4,        // เป้า ROAS (กี่เท่า) — ใช้คำนวณเป้ายอดขาย = งบ × roas
  },
};

/** ค่าที่ตั้งได้ใน rate card (ราคาต่อผลลัพธ์ + เป้า ROAS) */
export const RATE_KEYS = ["impression", "reach", "engagement", "click", "view", "lead", "message", "conversion", "roas"];

/**
 * ทำความสะอาด rate card — เก็บเฉพาะ key ที่รู้จักและเป็นตัวเลข > 0
 * @param {object} input ราคาที่ส่งมา
 * @param {boolean} sparse true = เก็บเฉพาะที่กรอก (ใช้กับ override รายแบรนด์, เว้นว่าง = สืบทอดค่ากลาง)
 */
export function cleanRateCard(input, { sparse = false } = {}) {
  const out = {};
  for (const k of RATE_KEYS) {
    const n = Number(input?.[k]);
    if (Number.isFinite(n) && n > 0) out[k] = n;
    else if (!sparse) { /* ไม่ใช่ sparse: ข้าม ปล่อยให้ caller เติมค่าเดิม */ }
  }
  return out;
}

const store = createStore("settings.json", {});

export function getSettings() {
  const stored = store.read();
  // merge rateCard แบบลึก เพื่อให้ key ใหม่ (เช่น roas) ได้ค่า default แม้ settings เก่าไม่มี
  return { ...DEFAULTS, ...stored, rateCard: { ...DEFAULTS.rateCard, ...(stored.rateCard || {}) } };
}

export function updateSettings(patch) {
  const next = { ...getSettings(), ...patch };
  store.write(next);
  return next;
}

// ---------- จัดการลิงก์นำเข้า (sources) ----------

export function listSources() {
  return getSettings().sources;
}

export function getSource(id) {
  return listSources().find((s) => s.id === id) || null;
}

export function addSource({ name, url, brandId = "", replaceMode = true }) {
  const settings = getSettings();
  const source = {
    id: newId("src"),
    name: String(name || "").trim() || "ลิงก์ใหม่",
    url: String(url || "").trim(),
    brandId,
    replaceMode,           // true = sync แล้วแทนที่งานเก่าของลิงก์นี้ / false = เพิ่มต่อท้าย
    lastSyncAt: null,
    lastCount: 0,
  };
  settings.sources = [...settings.sources, source];
  store.write(settings);
  return source;
}

export function updateSource(id, patch) {
  const settings = getSettings();
  const i = settings.sources.findIndex((s) => s.id === id);
  if (i === -1) return null;
  settings.sources[i] = { ...settings.sources[i], ...patch, id };
  store.write(settings);
  return settings.sources[i];
}

export function removeSource(id) {
  const settings = getSettings();
  const next = settings.sources.filter((s) => s.id !== id);
  if (next.length === settings.sources.length) return false;
  settings.sources = next;
  store.write(settings);
  return true;
}
