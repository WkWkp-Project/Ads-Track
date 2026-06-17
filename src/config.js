// src/config.js — ค่าตั้งระดับแอป (อ่านจาก environment variable ได้)
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** โฟลเดอร์รากของโปรเจกต์ */
export const ROOT_DIR = join(__dirname, "..");

/** โฟลเดอร์เก็บข้อมูล (override ด้วย DATA_DIR ได้ — สำคัญตอนรันใน Docker volume) */
export const DATA_DIR = process.env.DATA_DIR || join(ROOT_DIR, "data");

/** โฟลเดอร์หน้าเว็บ */
export const PUBLIC_DIR = join(ROOT_DIR, "public");

/** พอร์ตเซิร์ฟเวอร์ */
export const PORT = Number(process.env.PORT) || 3200;

/** เขตเวลา (ใช้แสดงผล/คำนวณ "วันนี้") */
export const TIMEZONE = process.env.TZ || "Asia/Bangkok";
