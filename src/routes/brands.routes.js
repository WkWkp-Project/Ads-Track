// src/routes/brands.routes.js
import { Router } from "express";
import * as Brands from "../store/brands.js";
import { saveLogo, deleteLogo } from "../store/logos.js";
import { removeByBrand } from "../store/attachments.js";
import { cleanRateCard } from "../store/settings.js";

/** rate card รายแบรนด์เป็น sparse — เก็บเฉพาะที่กรอก (ช่องว่าง = สืบทอดค่ากลาง) */
function brandFields(body) {
  const { logoData, logoRemove, rateCard, ...fields } = body || {};
  if (rateCard && typeof rateCard === "object") fields.rateCard = cleanRateCard(rateCard, { sparse: true });
  return { fields, logoData, logoRemove };
}

const router = Router();

/** แยกข้อมูลโลโก้ออกจาก body แล้วคืน patch สำหรับ field logo */
function logoPatch(brandId, body) {
  if (body.logoRemove) {
    deleteLogo(brandId);
    return { logo: "" };
  }
  if (body.logoData) return { logo: saveLogo(brandId, body.logoData) };
  return {};
}

router.get("/", (req, res) => {
  res.json(Brands.listBrands());
});

router.post("/", (req, res) => {
  const { fields, logoData } = brandFields(req.body);
  let brand = Brands.createBrand(fields);
  if (logoData) brand = Brands.updateBrand(brand.id, logoPatch(brand.id, { logoData }));
  res.status(201).json(brand);
});

router.put("/:id", (req, res) => {
  const { fields, logoData, logoRemove } = brandFields(req.body);
  const updated = Brands.updateBrand(req.params.id, {
    ...fields,
    ...logoPatch(req.params.id, { logoData, logoRemove }),
  });
  if (!updated) return res.status(404).json({ error: "ไม่พบแบรนด์นี้" });
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  if (!Brands.deleteBrand(req.params.id)) return res.status(404).json({ error: "ไม่พบแบรนด์นี้" });
  deleteLogo(req.params.id);       // เก็บกวาดไฟล์โลโก้
  removeByBrand(req.params.id);    // เก็บกวาดเอกสารแนบของแบรนด์
  res.json({ ok: true });
});

export default router;
