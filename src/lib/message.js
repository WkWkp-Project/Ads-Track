// src/lib/message.js — สร้างข้อความสรุปงานประจำวัน (แยกตามแบรนด์)
import { formatThaiDate, addDays } from "./dates.js";
import { tasksDueOn, overdueTasks, endingOn, overspentTasks } from "./taskStatus.js";

/**
 * สร้างข้อความสรุปงานยิงแอดของวัน — ครบวงจร:
 *   ต้องยิงวันนี้ / เลยกำหนด / แอดจบวันนี้ (ไปดูผล) / งบเกิน / พรุ่งนี้เตรียม
 * @param {Array} tasks  รายการงาน
 * @param {Array} brands รายการแบรนด์ (ใช้แสดงชื่อ)
 * @param {string} dateStr วันที่ YYYY-MM-DD
 */
export function buildDailyMessage(tasks, brands, dateStr) {
  const brandName = makeBrandLookup(brands);
  const due = tasksDueOn(tasks, dateStr);
  const overdue = overdueTasks(tasks, dateStr);
  const ending = endingOn(tasks, dateStr);
  const overspent = overspentTasks(tasks);
  const tomorrow = tasksDueOn(tasks, addDays(dateStr, 1));
  const thaiDate = formatThaiDate(dateStr);

  const nothing = !due.length && !overdue.length && !ending.length && !overspent.length;
  if (nothing) {
    let m = `📋 ${thaiDate}\nวันนี้ไม่มีงานยิงแอดที่ต้องทำ ✅`;
    if (tomorrow.length) m += `\n\n📅 พรุ่งนี้เตรียมยิง ${tomorrow.length} งาน`;
    return m;
  }

  let msg = `📋 สรุปงานยิงแอด ${thaiDate}`;

  if (due.length) {
    msg += `\n\n🔴 วันนี้ต้องยิง ${due.length} งาน`;
    msg += renderByBrand(due, brandName);
  }
  if (overdue.length) {
    msg += `\n\n⚠️ เลยกำหนดแล้ว ${overdue.length} งาน (ยังไม่ปิด)`;
    msg += renderByBrand(overdue, brandName);
  }
  if (ending.length) {
    msg += `\n\n🏁 แอดจบวันนี้ ${ending.length} งาน — ไปดูผล/ปิดงาน`;
    msg += renderByBrand(ending, brandName);
  }
  if (overspent.length) {
    msg += `\n\n💸 งบใช้เกินแผน ${overspent.length} งาน`;
    overspent.forEach((t, i) => {
      const spend = Number(t.kpi.spend).toLocaleString();
      const plan = Number(t.budget || 0).toLocaleString();
      msg += `\n  ${i + 1}. ${t.title || "(ไม่มีชื่อ)"} — ใช้ ฿${spend} / งบ ฿${plan}`;
    });
  }
  if (tomorrow.length) {
    msg += `\n\n📅 พรุ่งนี้เตรียมยิงอีก ${tomorrow.length} งาน`;
  }

  return msg.trim();
}

function makeBrandLookup(brands) {
  const map = new Map((brands || []).map((b) => [b.id, b.name]));
  return (id) => map.get(id) || "ไม่ระบุแบรนด์";
}

/** จัดกลุ่มงานตามแบรนด์ แล้วเรนเดอร์เป็นข้อความ */
function renderByBrand(tasks, brandName) {
  const groups = new Map();
  for (const t of tasks) {
    const key = t.brandId || "_none";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }

  let out = "";
  for (const [brandId, items] of groups) {
    out += `\n\n🏷️ ${brandName(brandId)}`;
    items.forEach((t, i) => {
      const obj = t.objective ? ` · ${t.objective}` : "";
      const ch = t.channel ? ` (${t.channel})` : "";
      const budget = t.budget ? ` · ฿${Number(t.budget).toLocaleString()}` : "";
      out += `\n  ${i + 1}. ${t.title || "(ไม่มีชื่องาน)"}${ch}${obj}${budget}`;
    });
  }
  return out;
}
