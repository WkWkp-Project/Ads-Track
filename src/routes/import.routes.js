// src/routes/import.routes.js — นำเข้าจาก CSV / ลิงก์ / sync หลายลิงก์
import { Router } from "express";
import * as Import from "../services/importService.js";
import { asyncHandler } from "../lib/http.js";

const router = Router();

// นำเข้าจากข้อความ CSV ที่ paste มา
router.post("/text", (req, res) => {
  const { csvText, brandId } = req.body || {};
  const added = Import.importFromText(csvText || "", { brandId: brandId || "" });
  res.json({ count: added.length });
});

// นำเข้าจากลิงก์ครั้งเดียว (ไม่บันทึกลิงก์)
router.post("/url", asyncHandler(async (req, res) => {
  const { url, brandId } = req.body || {};
  const added = await Import.importFromUrl(url || "", { brandId: brandId || "" });
  res.json({ count: added.length });
}));

// sync ลิงก์ที่บันทึกไว้รายการเดียว
router.post("/sync/:sourceId", asyncHandler(async (req, res) => {
  const result = await Import.syncSource(req.params.sourceId);
  res.json({ count: result.count, source: result.source.name });
}));

// sync ทุกลิงก์ที่บันทึกไว้
router.post("/sync-all", asyncHandler(async (req, res) => {
  res.json({ results: await Import.syncAll() });
}));

export default router;
