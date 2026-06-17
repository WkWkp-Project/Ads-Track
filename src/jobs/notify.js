// src/jobs/notify.js — สคริปต์แจ้งเตือนตอนเช้า (ให้ Task Scheduler / cron เรียก)
import { sendDailyNotification } from "../services/notifyService.js";
import { getSettings } from "../store/settings.js";
import { buildTodayMessage } from "../services/notifyService.js";

async function main() {
  const message = buildTodayMessage();
  console.log(message);

  if (!getSettings().lineToken) {
    console.error("\n⚠️ ยังไม่ได้ตั้งค่า LINE token (ไปที่หน้า ตั้งค่า ในเว็บ) — ข้ามการส่ง");
    process.exit(1);
  }

  try {
    await sendDailyNotification();
    console.log("\n✅ ส่งแจ้งเตือนเข้า LINE สำเร็จ");
  } catch (e) {
    console.error("\n❌ " + e.message);
    process.exit(1);
  }
}

main();
