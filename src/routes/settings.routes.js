// src/routes/settings.routes.js — การตั้งค่า + จัดการลิงก์นำเข้า
import { Router } from "express";
import * as Settings from "../store/settings.js";
import { cleanRateCard } from "../store/settings.js";
import { maskToken, isRealToken } from "../lib/http.js";

const router = Router();

function publicView(settings) {
  return {
    ...settings,
    lineToken: maskToken(settings.lineToken),
    appPin: maskToken(settings.appPin),
  };
}

router.get("/", (req, res) => {
  res.json(publicView(Settings.getSettings()));
});

router.put("/", (req, res) => {
  const body = req.body || {};
  const patch = {};
  if (typeof body.notifyTime === "string") patch.notifyTime = body.notifyTime;
  if (isRealToken(body.lineToken)) patch.lineToken = body.lineToken.trim();
  // PIN: ค่าใหม่ = ตั้ง, สตริงว่าง = ปิดการล็อก (ค่าที่ปิดบังไว้ = ไม่เปลี่ยน)
  if (typeof body.appPin === "string" && !body.appPin.includes("••")) {
    patch.appPin = body.appPin.trim();
  }
  // Rate card กลาง: merge ทับของเดิม (เก็บค่าเดิมไว้ถ้าช่องไหนไม่ได้ส่ง/ไม่ถูกต้อง)
  if (body.rateCard && typeof body.rateCard === "object") {
    patch.rateCard = { ...(Settings.getSettings().rateCard || {}), ...cleanRateCard(body.rateCard) };
  }
  res.json(publicView(Settings.updateSettings(patch)));
});

// ---------- ลิงก์นำเข้า (sources) ----------
router.get("/sources", (req, res) => {
  res.json(Settings.listSources());
});

router.post("/sources", (req, res) => {
  res.status(201).json(Settings.addSource(req.body || {}));
});

router.put("/sources/:id", (req, res) => {
  const updated = Settings.updateSource(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: "ไม่พบลิงก์นี้" });
  res.json(updated);
});

router.delete("/sources/:id", (req, res) => {
  if (!Settings.removeSource(req.params.id)) return res.status(404).json({ error: "ไม่พบลิงก์นี้" });
  res.json({ ok: true });
});

export default router;
