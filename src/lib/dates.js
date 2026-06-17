// src/lib/dates.js — จัดการวันที่ (รองรับ พ.ศ. และหลายรูปแบบ)

const THAI_MONTHS_SHORT = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const EN_MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** วันที่วันนี้ในรูปแบบ YYYY-MM-DD ตามเวลาเครื่อง */
export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** บวก/ลบจำนวนวันจากสตริง YYYY-MM-DD */
export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayStr(d);
}

/**
 * แปลงข้อความวันที่หลายรูปแบบ -> YYYY-MM-DD
 * รองรับ: 2026-06-06, 6/6/2026, 6/6/2569 (พ.ศ.), "7 Apr 2026", "Apr 7, 2026"
 * คืนค่า "" ถ้าแปลงไม่ได้
 */
export function parseDate(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return build(+m[1], +m[2], +m[3]);

  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) return build(+m[3], +m[2], +m[1]);

  m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{2,4})/);
  if (m) {
    const mo = monthNum(m[2]);
    if (mo) return build(+m[3], mo, +m[1]);
  }

  m = s.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{2,4})/);
  if (m) {
    const mo = monthNum(m[1]);
    if (mo) return build(+m[3], mo, +m[2]);
  }

  return "";
}

function build(year, month, day) {
  if (year > 2400) year -= 543;       // พ.ศ. -> ค.ศ.
  else if (year < 100) year += 2000;  // ปี 2 หลัก
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function monthNum(name) {
  return EN_MONTHS[name.slice(0, 3).toLowerCase()] || 0;
}

/** แสดงวันที่แบบไทยสั้น เช่น "6 มิ.ย. 2569" */
export function formatThaiDate(dateStr) {
  const m = String(dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr || "-";
  return `${+m[3]} ${THAI_MONTHS_SHORT[+m[2]]} ${+m[1] + 543}`;
}
