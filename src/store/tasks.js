// src/store/tasks.js — จัดการข้อมูลงานยิงแอด (รวม KPI แผน vs จริง, ค่าธรรมเนียม, ประวัติสถานะ)
import { createStore, newId } from "./jsonStore.js";
import { parseDate } from "../lib/dates.js";

const store = createStore("tasks.json", []);

/** ฟิลด์ข้อความ/ตัวเลขทั่วไปของงาน 1 ชิ้น */
export const TASK_FIELDS = [
  "brandId", "title", "channel", "objective", "budget", "feePercent",
  "postDate", "startAds", "endAds", "period", "code",
  "link", "owner", "status", "remark", "sourceId",
];

/** เมตริก KPI ที่เก็บทั้ง "แผน" และ "ผลจริง" — ครอบคลุมทุก objective */
export const KPI_KEYS = [
  "impression", "reach", "engagement", "click", "view",
  "lead", "message", "conversion", "revenue",
];

const DATE_FIELDS = ["postDate", "startAds", "endAds"];

function toNum(value) {
  if (value === "" || value == null) return null;
  const n = Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** เก็บเฉพาะเมตริกที่เป็นตัวเลขจริง */
function normalizeKpiSide(side = {}) {
  const out = {};
  for (const k of KPI_KEYS) {
    const n = toNum(side[k]);
    if (n != null) out[k] = n;
  }
  return out;
}

/**
 * ทำให้ข้อมูลเข้ารูปมาตรฐาน
 * - วันที่ -> YYYY-MM-DD, งบ/ค่าฟี -> ตัวเลข, สถานะมีค่าเริ่มต้น
 * - kpi: { plan: {impression,...}, actual: {impression,...}, spend }
 *   (รับค่าเมตริกแบบ flat จาก CSV import มาเป็น "แผน" ด้วย)
 */
function normalize(input) {
  const t = {};
  for (const f of TASK_FIELDS) t[f] = input[f] ?? "";

  const budget = toNum(t.budget);
  if (budget != null) t.budget = budget;

  const fee = toNum(t.feePercent);
  t.feePercent = fee != null ? fee : 0;

  for (const f of DATE_FIELDS) {
    const iso = parseDate(t[f]);
    if (iso) t[f] = iso;
  }

  if (!t.status) t.status = "วางแผน";

  const kpiIn = input.kpi || {};
  const flatPlan = {};
  for (const k of KPI_KEYS) if (input[k] != null) flatPlan[k] = input[k];
  t.kpi = {
    plan: normalizeKpiSide({ ...flatPlan, ...(kpiIn.plan || {}) }),
    actual: normalizeKpiSide(kpiIn.actual || {}),
    spend: toNum(kpiIn.spend ?? input.spend),
  };

  return t;
}

export function listTasks() {
  return store.read();
}

export function getTask(id) {
  return listTasks().find((t) => t.id === id) || null;
}

export function createTask(input) {
  const tasks = listTasks();
  const now = new Date().toISOString();
  const norm = normalize(input);
  const task = {
    id: newId("task"),
    ...norm,
    history: [{ at: now, status: norm.status, note: "สร้างงาน" }],
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  store.write(tasks);
  return task;
}

export function updateTask(id, patch) {
  const tasks = listTasks();
  const i = tasks.findIndex((t) => t.id === id);
  if (i === -1) return null;
  const prev = tasks[i];
  const merged = { ...prev, ...patch };
  const norm = normalize(merged);
  const now = new Date().toISOString();

  // บันทึกประวัติเมื่อสถานะเปลี่ยน (ไว้ track ว่างานเดินถึงไหนเมื่อไร)
  const history = Array.isArray(prev.history) ? [...prev.history] : [];
  if (norm.status !== prev.status) {
    history.push({ at: now, status: norm.status, from: prev.status });
  }

  tasks[i] = { ...norm, id, history, createdAt: prev.createdAt, updatedAt: now };
  store.write(tasks);
  return tasks[i];
}

export function deleteTask(id) {
  const tasks = listTasks();
  const next = tasks.filter((t) => t.id !== id);
  if (next.length === tasks.length) return false;
  store.write(next);
  return true;
}

/**
 * ทำซ้ำงาน: คัดลอกข้อมูลแผนทั้งหมด แต่ล้างผลจริง + รีเซ็ตสถานะเป็น "วางแผน"
 * (ไว้เปิดคอนเทนต์/รอบใหม่ที่หน้าตาเหมือนเดิมโดยไม่ต้องกรอกซ้ำ)
 */
export function duplicateTask(id) {
  const src = getTask(id);
  if (!src) return null;
  const clone = { ...src };
  delete clone.id;
  delete clone.createdAt;
  delete clone.updatedAt;
  delete clone.history;
  clone.status = "วางแผน";
  clone.title = src.title ? src.title + " (สำเนา)" : "(สำเนา)";
  clone.kpi = { plan: { ...(src.kpi?.plan || {}) }, actual: {}, spend: null };
  return createTask(clone);
}

/** ลบทุกงานของ source ที่กำหนด (ใช้ตอน sync ใหม่แบบแทนที่) */
export function deleteBySource(sourceId) {
  const tasks = listTasks();
  const next = tasks.filter((t) => t.sourceId !== sourceId);
  store.write(next);
  return tasks.length - next.length;
}

/** เพิ่มงานหลายชิ้นพร้อมกัน (ใช้ตอนนำเข้า) */
export function createMany(rows) {
  const tasks = listTasks();
  const now = new Date().toISOString();
  const added = rows.map((r) => {
    const norm = normalize(r);
    return {
      id: newId("task"),
      ...norm,
      history: [{ at: now, status: norm.status, note: "นำเข้า" }],
      createdAt: now, updatedAt: now,
    };
  });
  tasks.push(...added);
  store.write(tasks);
  return added;
}
