// src/store/logos.js — เก็บไฟล์โลโก้แบรนด์ใน data/logos/ (รับเป็น base64 data URL จากหน้าเว็บ)
import { writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from "fs";
import { join } from "path";
import { DATA_DIR } from "../config.js";

export const LOGO_DIR = join(DATA_DIR, "logos");

const MIME_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const MAX_BYTES = 2 * 1024 * 1024; // 2MB (หน้าเว็บย่อรูปมาก่อนแล้ว เผื่อไว้สำหรับ SVG/GIF)

/**
 * บันทึกโลโก้ของแบรนด์ คืน URL สำหรับใช้ในหน้าเว็บ
 * @param {string} brandId
 * @param {string} dataUrl  รูปแบบ data:image/...;base64,...
 */
export function saveLogo(brandId, dataUrl) {
  const m = String(dataUrl).match(/^data:(image\/[a-z+.\-]+);base64,(.+)$/i);
  if (!m) throw new Error("รูปไม่ถูกต้อง");
  const ext = MIME_EXT[m[1].toLowerCase()];
  if (!ext) throw new Error("รองรับเฉพาะไฟล์ PNG / JPG / WebP / GIF / SVG");

  const buf = Buffer.from(m[2], "base64");
  if (buf.length > MAX_BYTES) throw new Error("ไฟล์ใหญ่เกิน 2MB");

  if (!existsSync(LOGO_DIR)) mkdirSync(LOGO_DIR, { recursive: true });
  deleteLogo(brandId); // ลบไฟล์เดิม (กันค้างคนละนามสกุล)

  const name = `${brandId}.${ext}`;
  writeFileSync(join(LOGO_DIR, name), buf);
  // ?v= กันเบราว์เซอร์จำรูปเก่า (cache) ตอนเปลี่ยนโลโก้
  return `/logos/${name}?v=${Date.now()}`;
}

/** ลบไฟล์โลโก้ของแบรนด์ (ทุกนามสกุล) */
export function deleteLogo(brandId) {
  if (!existsSync(LOGO_DIR)) return;
  for (const f of readdirSync(LOGO_DIR)) {
    if (f.startsWith(brandId + ".")) unlinkSync(join(LOGO_DIR, f));
  }
}
