// src/lib/csv.js — แปลงข้อความ CSV เป็นแถวข้อมูล + จับคู่หัวคอลัมน์อัตโนมัติ (ไทย/อังกฤษ)

/**
 * parser CSV รองรับ comma, เครื่องหมายคำพูด และการขึ้นบรรทัดใหม่ภายในเซลล์
 * @returns {string[][]} ตาราง 2 มิติ
 */
export function parseCSV(text) {
  const rows = [];
  let row = [], field = "", i = 0, inQuotes = false;
  text = String(text).replace(/^﻿/, ""); // ตัด BOM

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}

/** ตารางจับคู่ชื่อหัวคอลัมน์ -> ชื่อฟิลด์ภายในระบบ */
const HEADER_ALIASES = {
  brandName: ["brand", "แบรนด์", "project", "campaign", "โปรเจกต์", "โครงการ", "แคมเปญ", "ลูกค้า", "client"],
  title: ["title", "content", "คอนเทนต์", "ชื่องาน", "งาน", "ชิ้นงาน", "topic", "name", "kols name", "kol", "subject"],
  channel: ["channel", "platform", "ช่องทาง", "แพลตฟอร์ม", "media"],
  objective: ["objective", "obj", "obj.", "วัตถุประสงค์", "เป้าหมาย"],
  budget: ["budget", "งบ", "งบประมาณ", "boosting cost", "boosting budget", "ค่าบูสต์", "int. budget"],
  feePercent: ["fee", "fee %", "ค่าฟี", "ค่าธรรมเนียม", "management fee", "mgt fee", "ค่าบริหาร"],
  postDate: ["postdate", "post date", "วันโพสต์", "วันลง", "วันที่โพสต์", "post"],
  startAds: ["startads", "start ads", "start", "วันเริ่มยิง", "เริ่มยิง", "วันเริ่ม", "วันเริ่มแอด"],
  endAds: ["endads", "end ads", "end", "วันจบ", "วันสิ้นสุด", "วันจบแอด"],
  period: ["period", "ระยะเวลา", "duration"],
  code: ["code", "gencode", "gen code", "โค้ด"],
  link: ["link", "ลิงก์", "link posed", "link posted", "ads links", "url", "profile link"],
  owner: ["owner", "ผู้รับผิดชอบ", "responsible", "pic", "คนทำ"],
  status: ["status", "สถานะ", "status boost", "ads status"],
  remark: ["remark", "หมายเหตุ", "note", "notes", "remarks"],
  // เมตริก KPI จากชีต -> เก็บเป็น "เป้าตามแผน" (รองรับสะกดเพี้ยน เช่น Rach)
  impression: ["impression", "impressions", "อิมเพรสชัน"],
  reach: ["reach", "rach", "รีช"],
  engagement: ["engagement", "interaction", "เอนเกจเมนต์", "เอนเกจ"],
  click: ["click", "clicks", "link click", "link clicks", "คลิก"],
  view: ["view", "views", "video view", "video views", "วิว"],
  lead: ["lead", "leads", "ลีด"],
  message: ["message", "messages", "ข้อความ", "conversation", "conversations"],
  conversion: ["conversion", "conversions", "purchase", "purchases", "result", "results", "ผลลัพธ์", "order", "orders", "ออเดอร์"],
  revenue: ["revenue", "ยอดขาย", "รายได้", "sales value", "gmv"],
};

function matchHeader(header) {
  const norm = String(header).toLowerCase().trim();
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(norm)) return field;
  }
  return null;
}

/**
 * แปลงข้อความ CSV (แถวแรกเป็นหัวคอลัมน์) เป็น array ของ object ฟิลด์ดิบ
 * ยังไม่ normalize วันที่/งบ (ปล่อยให้ store จัดการ)
 */
export function csvToRows(text) {
  const table = parseCSV(text);
  if (table.length < 2) return [];

  const colMap = table[0].map(matchHeader);
  const rows = [];

  for (let r = 1; r < table.length; r++) {
    const cells = table[r];
    const obj = {};
    let hasData = false;

    for (let c = 0; c < cells.length; c++) {
      const field = colMap[c];
      if (!field) continue;
      const val = String(cells[c] ?? "").trim();
      if (val) { obj[field] = val; hasData = true; }
    }

    // ต้องมีอย่างน้อยชื่องานหรือวันที่ ถึงนับเป็นงาน
    if (hasData && (obj.title || obj.postDate || obj.startAds)) rows.push(obj);
  }

  return rows;
}
