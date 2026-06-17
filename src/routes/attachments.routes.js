// src/routes/attachments.routes.js — เอกสาร & ลิงก์ประจำแบรนด์
import { Router } from "express";
import * as Attachments from "../store/attachments.js";

const router = Router();

// ?brandId=... เพื่อกรองเฉพาะแบรนด์
router.get("/", (req, res) => {
  res.json(Attachments.listAttachments(req.query.brandId || ""));
});

// body: { brandId, name, url } = ลิงก์ | { brandId, name, fileData } = ไฟล์ (base64)
router.post("/", (req, res) => {
  const body = req.body || {};
  const item = body.fileData ? Attachments.addFile(body) : Attachments.addLink(body);
  res.status(201).json(item);
});

router.delete("/:id", (req, res) => {
  if (!Attachments.removeAttachment(req.params.id)) return res.status(404).json({ error: "ไม่พบรายการนี้" });
  res.json({ ok: true });
});

export default router;
