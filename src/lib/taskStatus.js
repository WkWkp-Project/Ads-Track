// src/lib/taskStatus.js — ตรรกะสถานะ/ความเร่งด่วนของงาน (ใช้ร่วมทั้งฝั่ง API และแจ้งเตือน)
import { parseDate } from "./dates.js";

/** สถานะที่ถือว่า "ปิดงานแล้ว" */
export const CLOSED_STATUSES = ["เสร็จแล้ว", "ยกเลิก", "done", "cancelled", "cancel"];

/** วันที่ที่ใช้เป็น "วันต้องลงมือ" = วันเริ่มยิงแอด ถ้าไม่มีใช้วันโพสต์ */
export function actionDate(task) {
  return parseDate(task.startAds) || parseDate(task.postDate) || "";
}

/** งานนี้ปิดแล้วหรือยัง */
export function isClosed(task) {
  const s = String(task.status || "").toLowerCase().trim();
  return CLOSED_STATUSES.some((c) => c.toLowerCase() === s);
}

/** งานที่ต้องลงมือในวันที่กำหนด และยังไม่ปิด */
export function tasksDueOn(tasks, dateStr) {
  return tasks.filter((t) => actionDate(t) === dateStr && !isClosed(t));
}

/** งานที่เลยกำหนดแล้วแต่ยังไม่ปิด */
export function overdueTasks(tasks, dateStr) {
  return tasks.filter((t) => {
    const a = actionDate(t);
    return a && a < dateStr && !isClosed(t);
  });
}

/** งานที่แอด "จบในวันนี้" และยังไม่ปิด — เตือนให้ไปดูผล/ปิดงาน */
export function endingOn(tasks, dateStr) {
  return tasks.filter((t) => parseDate(t.endAds) === dateStr && !isClosed(t));
}

/** งบรวมตามแผน (รวมค่าธรรมเนียม) ของงาน 1 ชิ้น */
export function plannedTotal(task) {
  const budget = Number(task.budget) || 0;
  const fee = Number(task.feePercent) || 0;
  return budget * (1 + fee / 100);
}

/** งานที่ใช้งบจริงเกินงบแผน (รวมค่าฟี) — เตือนงบบานปลาย */
export function overspentTasks(tasks) {
  return tasks.filter((t) => {
    const spend = t.kpi && t.kpi.spend;
    const total = plannedTotal(t);
    return spend != null && total > 0 && spend > total;
  });
}
