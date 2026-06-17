// public/js/utils.js — ตัวช่วย, ค่าคงที่, ตรรกะวันที่/สถานะ/KPI (ฝั่งเบราว์เซอร์)

const { useState, useEffect, useMemo, useCallback } = React;

// ---------- API ----------
const api = {
  get: (u) => fetch(u).then((r) => r.json()),
  post: (u, b) => fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b || {}) }).then((r) => r.json()),
  put: (u, b) => fetch(u, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b || {}) }).then((r) => r.json()),
  del: (u) => fetch(u, { method: "DELETE" }).then((r) => r.json()),
};

// ---------- วันที่ ----------
function todayStr(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayStr(d);
}
const THAI_MONTHS = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const THAI_MONTHS_FULL = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const THAI_DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const THAI_DOW_FULL = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

function fmtThai(dateStr) {
  const m = (dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr || "-";
  return `${+m[3]} ${THAI_MONTHS[+m[2]]} ${+m[1] + 543}`;
}
function fmtThaiLong(dateStr) {
  const m = (dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr || "-";
  const d = new Date(dateStr + "T00:00:00");
  return `วัน${THAI_DOW_FULL[d.getDay()]}ที่ ${+m[3]} ${THAI_MONTHS_FULL[+m[2]]} ${+m[1] + 543}`;
}

// ---------- สถานะงาน ----------
function actionDate(t) { return t.startAds || t.postDate || ""; }
const CLOSED = ["เสร็จแล้ว", "ยกเลิก", "done", "cancelled", "cancel"];
function isClosed(t) {
  const s = String(t.status || "").toLowerCase().trim();
  return CLOSED.some((c) => c.toLowerCase() === s);
}
function urgency(t, today) {
  if (isClosed(t)) return "closed";
  const a = actionDate(t);
  if (!a) return "none";
  if (a < today) return "overdue";
  if (a === today) return "today";
  if (a <= addDays(today, 7)) return "soon";
  return "future";
}

// ---------- KPI ----------
// per = หน่วยของราคา (1000 = ราคาต่อ 1,000 หน่วย เช่น CPM) / money = เมตริกที่เป็นเงิน (ไม่มีราคาต่อหน่วย)
const KPI_METRICS = [
  { k: "impression", label: "Impression", per: 1000, cost: "CPM" },
  { k: "reach", label: "Reach", per: 1000, cost: "CPR/1K" },
  { k: "engagement", label: "Engagement", per: 1, cost: "CPE" },
  { k: "click", label: "Link Click", per: 1, cost: "CPC" },
  { k: "view", label: "Video View", per: 1, cost: "CPV" },
  { k: "lead", label: "Lead", per: 1, cost: "CPL" },
  { k: "message", label: "Message", per: 1, cost: "ราคา/ข้อความ" },
  { k: "conversion", label: "Conversion", per: 1, cost: "CPA" },
  { k: "revenue", label: "ยอดขาย (฿)", money: true },
];

/** เมตริกหลักของแต่ละ objective — ใช้ไฮไลต์ + คำนวณเป้าอัตโนมัติ */
const OBJ_METRICS = {
  "Awareness": ["impression", "reach"],
  "Reach": ["reach", "impression"],
  "Traffic": ["click", "impression"],
  "Engagement": ["engagement", "impression"],
  "Video Views": ["view", "impression"],
  "Lead": ["lead", "click"],
  "Messages": ["message"],
  "Conversion": ["conversion", "revenue", "click"],
  "Sales": ["conversion", "revenue"],
  "GMV Max": ["revenue", "conversion"],
  "App Promotion": ["conversion", "click"],
  "Live Shopping": ["view", "revenue"],
  "Boost Post": ["engagement", "reach"],
};
function primaryMetrics(objective) {
  return OBJ_METRICS[objective] || ["impression", "reach"];
}

function getKpi(t) {
  const k = t.kpi || {};
  return { plan: k.plan || {}, actual: k.actual || {}, spend: k.spend ?? null };
}

/** ต้นทุนต่อผลลัพธ์ของเมตริกเดียว (เช่น CPM = spend/imp*1000) */
function unitCost(money, value, per) {
  if (money == null || money <= 0 || value == null || value <= 0) return null;
  return (money / value) * (per || 1);
}

/** คำนวณต้นทุนทุกเมตริก + ROAS/ROI จากเงินที่ใช้จริง (spend) */
function calcDerived(money, m) {
  const out = {};
  for (const { k, per, money: isMoney } of KPI_METRICS) {
    if (isMoney) continue;
    out[k] = unitCost(money, m[k], per);
  }
  // ตัวย่อเดิม (ใช้ในตาราง/export)
  out.cpm = out.impression;
  out.cpc = out.click;
  out.cpe = out.engagement;
  // ROAS = ยอดขาย ÷ เงินที่ใช้ (กี่เท่า) · ROI = (ยอดขาย − เงินที่ใช้) ÷ เงินที่ใช้ (กำไร %)
  const hasBoth = money > 0 && m.revenue != null;
  out.roas = hasBoth ? m.revenue / money : null;
  out.roi = hasBoth ? ((m.revenue - money) / money) * 100 : null;
  out.profit = hasBoth ? m.revenue - money : null;
  return out;
}

/** สีของ ROI: บวก=เขียว / ลบ=แดง / ศูนย์=เทา */
function roiColor(roi) {
  if (roi == null) return "bg-slate-100 text-slate-400";
  if (roi > 0) return "bg-emerald-100 text-emerald-700";
  if (roi < 0) return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-500";
}
function fmtRoi(roi) { return roi == null ? "–" : (roi > 0 ? "+" : "") + Math.round(roi) + "%"; }

/** % บรรลุเป้าเฉลี่ยของงาน (เทียบ actual กับ plan เฉพาะเมตริกที่ตั้งเป้าไว้) */
function achievement(t) {
  const { plan, actual } = getKpi(t);
  const pcts = KPI_METRICS
    .map(({ k }) => (plan[k] > 0 && actual[k] != null ? (actual[k] / plan[k]) * 100 : null))
    .filter((v) => v != null);
  if (!pcts.length) return null;
  return pcts.reduce((s, v) => s + v, 0) / pcts.length;
}

/** งานนี้มีการกรอกผลจริงแล้วหรือยัง */
function hasActuals(t) {
  const { actual, spend } = getKpi(t);
  return spend != null || Object.keys(actual).length > 0;
}

// ---------- งบ + ค่าธรรมเนียม ----------
function feeAmount(t) {
  const b = Number(t.budget) || 0;
  const f = Number(t.feePercent) || 0;
  return b * f / 100;
}
function totalWithFee(t) {
  return (Number(t.budget) || 0) + feeAmount(t);
}

function fmtNum(n) {
  if (n == null || n === "") return "–";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 });
}
function fmtPct(n) { return n == null ? "–" : Math.round(n) + "%"; }
function pctColor(n) {
  if (n == null) return "bg-slate-100 text-slate-400";
  if (n >= 100) return "bg-emerald-100 text-emerald-700";
  if (n >= 70) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

// ---------- ค่าคงที่ ----------
const STATUSES = ["วางแผน", "กำลังรัน", "เสร็จแล้ว", "Hold", "ยกเลิก"];
const STATUS_STYLE = {
  "วางแผน": "bg-slate-100 text-slate-700 border-slate-300",
  "กำลังรัน": "bg-blue-100 text-blue-700 border-blue-300",
  "เสร็จแล้ว": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Hold": "bg-amber-100 text-amber-700 border-amber-300",
  "ยกเลิก": "bg-slate-100 text-slate-400 border-slate-200 line-through",
};
/** ตัวเลือก Objective ครบทุกแบบ (Meta + TikTok + งานบูสต์) — ล็อกเป็น dropdown เพื่อให้เช็ค/กรองงานได้ตรงกัน */
const OBJECTIVES = [
  "Awareness",
  "Reach",
  "Traffic",
  "Engagement",
  "Video Views",
  "Lead",
  "Messages",
  "Conversion",
  "Sales",
  "GMV Max",
  "App Promotion",
  "Live Shopping",
  "Boost Post",
];
const CHANNELS = ["Facebook", "TikTok", "Instagram", "Shopee", "Lazada", "Line", "YouTube", "Google"];
const CHANNEL_STYLE = {
  Facebook: "bg-blue-600", TikTok: "bg-black", Instagram: "bg-pink-600",
  Shopee: "bg-orange-600", Lazada: "bg-indigo-600", Line: "bg-green-600",
  YouTube: "bg-red-600", Google: "bg-yellow-500",
};
function channelColor(c) {
  for (const k in CHANNEL_STYLE) if (String(c || "").toLowerCase().includes(k.toLowerCase())) return CHANNEL_STYLE[k];
  return "bg-slate-500";
}

// ---------- ส่งออก Excel (CSV รองรับภาษาไทยใน Excel ด้วย BOM) ----------
function csvCell(v) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportTasksCSV(tasks, filename) {
  const headers = [
    "แบรนด์", "ชื่องาน", "ช่องทาง", "Objective", "สถานะ", "วันเริ่มยิง", "วันจบ",
    "งบแผน", "ค่าฟี %", "รวมมีค่าฟี", "ใช้จริง", "% งบ",
    "Imp แผน", "Imp จริง", "Reach แผน", "Reach จริง", "Eng แผน", "Eng จริง",
    "Click แผน", "Click จริง", "View แผน", "View จริง",
    "CPM", "CPC", "CPE", "% บรรลุเป้า", "Gencode", "ผู้รับผิดชอบ", "ลิงก์", "หมายเหตุ",
  ];
  const rows = tasks.map((t) => {
    const { plan, actual, spend } = getKpi(t);
    const dv = calcDerived(spend, actual);
    const total = totalWithFee(t);
    return [
      t.brand ? t.brand.name : "",
      t.title, t.channel, t.objective, t.status,
      t.startAds, t.endAds,
      t.budget, t.feePercent || 0, total ? Math.round(total) : "",
      spend ?? "", total > 0 && spend != null ? Math.round((spend / total) * 100) + "%" : "",
      plan.impression ?? "", actual.impression ?? "",
      plan.reach ?? "", actual.reach ?? "",
      plan.engagement ?? "", actual.engagement ?? "",
      plan.click ?? "", actual.click ?? "",
      plan.view ?? "", actual.view ?? "",
      dv.cpm != null ? dv.cpm.toFixed(1) : "", dv.cpc != null ? dv.cpc.toFixed(1) : "", dv.cpe != null ? dv.cpe.toFixed(1) : "",
      achievement(t) != null ? Math.round(achievement(t)) + "%" : "",
      t.code, t.owner, t.link, t.remark,
    ];
  });
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "ad-ops-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}
