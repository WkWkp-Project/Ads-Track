// src/services/notifyService.js — รวมตรรกะการแจ้งเตือนประจำวัน
import { listTasks } from "../store/tasks.js";
import { listBrands } from "../store/brands.js";
import { getSettings } from "../store/settings.js";
import { buildDailyMessage } from "../lib/message.js";
import { sendBroadcast } from "../lib/line.js";
import { todayStr } from "../lib/dates.js";

/** สร้างข้อความสรุปงานของวันนี้ */
export function buildTodayMessage(dateStr = todayStr()) {
  return buildDailyMessage(listTasks(), listBrands(), dateStr);
}

/** สร้างข้อความแล้วส่งเข้า LINE ทันที */
export async function sendDailyNotification(dateStr = todayStr()) {
  const message = buildTodayMessage(dateStr);
  const { lineToken } = getSettings();
  await sendBroadcast(lineToken, message);
  return message;
}
