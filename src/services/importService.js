// src/services/importService.js — นำเข้างานจาก Google Sheets (รองรับหลายลิงก์)
import { csvToRows } from "../lib/csv.js";
import * as Tasks from "../store/tasks.js";
import * as Brands from "../store/brands.js";
import * as Settings from "../store/settings.js";

/**
 * แปลงแถวดิบจาก CSV -> งาน โดยผูกแบรนด์
 * - ถ้าระบุ brandId มา ใช้ค่านั้นกับทุกแถว
 * - ไม่งั้นใช้คอลัมน์ brand/project ในแถว (สร้างแบรนด์ใหม่อัตโนมัติถ้ายังไม่มี)
 */
function attachBrand(rows, defaultBrandId) {
  return rows.map((row) => {
    const { brandName, ...rest } = row;
    let brandId = defaultBrandId || "";
    if (!brandId && brandName) {
      const brand = Brands.findOrCreateByName(brandName);
      if (brand) brandId = brand.id;
    }
    return { ...rest, brandId };
  });
}

/** นำเข้าจากข้อความ CSV โดยตรง */
export function importFromText(text, { brandId = "", sourceId = "" } = {}) {
  const rows = csvToRows(text);
  if (rows.length === 0) {
    throw new Error("ไม่พบงานที่นำเข้าได้ (ตรวจหัวคอลัมน์ให้มีชื่องาน/วันที่)");
  }
  const prepared = attachBrand(rows, brandId).map((r) => ({ ...r, sourceId }));
  return Tasks.createMany(prepared);
}

/** ดึง CSV จากลิงก์แล้วนำเข้า */
export async function importFromUrl(url, opts = {}) {
  const text = await fetchCsv(url);
  return importFromText(text, opts);
}

async function fetchCsv(url) {
  if (!url) throw new Error("ไม่มีลิงก์");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ดึงข้อมูลจากลิงก์ไม่สำเร็จ (${res.status})`);
  return res.text();
}

/**
 * Sync ลิงก์ที่บันทึกไว้ 1 รายการ
 * - replaceMode = true : ลบงานเก่าของลิงก์นี้ก่อน แล้วนำเข้าใหม่ (กันข้อมูลซ้ำ)
 */
export async function syncSource(sourceId) {
  const source = Settings.getSource(sourceId);
  if (!source) throw new Error("ไม่พบลิงก์นี้");

  const text = await fetchCsv(source.url);
  if (source.replaceMode) Tasks.deleteBySource(sourceId);

  const added = importFromText(text, { brandId: source.brandId, sourceId });
  Settings.updateSource(sourceId, {
    lastSyncAt: new Date().toISOString(),
    lastCount: added.length,
  });
  return { source, count: added.length };
}

/** Sync ทุกลิงก์ที่บันทึกไว้ */
export async function syncAll() {
  const sources = Settings.listSources();
  const results = [];
  for (const s of sources) {
    try {
      const r = await syncSource(s.id);
      results.push({ id: s.id, name: s.name, count: r.count, ok: true });
    } catch (e) {
      results.push({ id: s.id, name: s.name, error: e.message, ok: false });
    }
  }
  return results;
}
