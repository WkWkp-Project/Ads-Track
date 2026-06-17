// src/store/attachments.js — เอกสาร & ลิงก์ประจำแบรนด์
// ลิงก์ = url ออนไลน์ (Drive, Canva, Sheet ฯลฯ) / ไฟล์ = อัปโหลดเก็บใน data/files/<brandId>/
import { writeFileSync, mkdirSync, existsSync, unlinkSync, rmSync } from "fs";
import { join } from "path";
import { createStore, newId } from "./jsonStore.js";
import { DATA_DIR } from "../config.js";

export const FILES_DIR = join(DATA_DIR, "files");

const store = createStore("attachments.json", []);

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB ต่อไฟล์

/** ชื่อไฟล์ปลอดภัย: คงไทย/อังกฤษ/ตัวเลข ตัดอักขระอันตรายออก */
function safeName(name) {
  const clean = String(name || "file").replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").trim();
  return clean.slice(0, 120) || "file";
}

export function listAttachments(brandId) {
  const all = store.read();
  return brandId ? all.filter((a) => a.brandId === brandId) : all;
}

/** เพิ่มลิงก์ออนไลน์ */
export function addLink({ brandId, name, url }) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) throw new Error("กรุณาใส่ลิงก์");
  const all = store.read();
  const item = {
    id: newId("att"),
    brandId: brandId || "",
    type: "link",
    name: String(name || "").trim() || cleanUrl,
    url: cleanUrl,
    createdAt: new Date().toISOString(),
  };
  all.push(item);
  store.write(all);
  return item;
}

/** เพิ่มไฟล์ (รับ base64 data URL จากหน้าเว็บ) */
export function addFile({ brandId, name, fileData }) {
  const m = String(fileData || "").match(/^data:([^;]*);base64,(.+)$/);
  if (!m) throw new Error("ไฟล์ไม่ถูกต้อง");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > MAX_FILE_BYTES) throw new Error("ไฟล์ใหญ่เกิน 15MB");

  const id = newId("att");
  const fname = `${id}_${safeName(name)}`;
  const dir = join(FILES_DIR, brandId || "_none");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, fname), buf);

  const all = store.read();
  const item = {
    id,
    brandId: brandId || "",
    type: "file",
    name: safeName(name),
    url: `/files/${brandId || "_none"}/${encodeURIComponent(fname)}`,
    size: buf.length,
    storedAs: fname,
    createdAt: new Date().toISOString(),
  };
  all.push(item);
  store.write(all);
  return item;
}

export function removeAttachment(id) {
  const all = store.read();
  const item = all.find((a) => a.id === id);
  if (!item) return false;
  if (item.type === "file" && item.storedAs) {
    const f = join(FILES_DIR, item.brandId || "_none", item.storedAs);
    try { if (existsSync(f)) unlinkSync(f); } catch {}
  }
  store.write(all.filter((a) => a.id !== id));
  return true;
}

/** ลบทุกรายการของแบรนด์ (เรียกตอนลบแบรนด์) */
export function removeByBrand(brandId) {
  const all = store.read();
  store.write(all.filter((a) => a.brandId !== brandId));
  try { rmSync(join(FILES_DIR, brandId), { recursive: true, force: true }); } catch {}
}
