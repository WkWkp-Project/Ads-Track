// src/routes/notify.routes.js — ดูตัวอย่าง/ทดสอบส่งแจ้งเตือน
import { Router } from "express";
import * as Notify from "../services/notifyService.js";
import { asyncHandler } from "../lib/http.js";

const router = Router();

// ดูตัวอย่างข้อความที่จะส่ง (ไม่ส่งจริง)
router.get("/preview", (req, res) => {
  res.json({ message: Notify.buildTodayMessage() });
});

// ทดสอบส่งเข้า LINE ทันที
router.post("/test", asyncHandler(async (req, res) => {
  const message = await Notify.sendDailyNotification();
  res.json({ ok: true, message });
}));

export default router;
