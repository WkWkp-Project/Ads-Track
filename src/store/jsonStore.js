// src/store/jsonStore.js — ที่เก็บข้อมูลแบบไฟล์ JSON (เขียนแบบ atomic ป้องกันไฟล์เสีย)
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { join } from "path";
import { DATA_DIR } from "../config.js";

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * สร้างที่เก็บข้อมูลผูกกับไฟล์ JSON หนึ่งไฟล์
 * @param {string} filename ชื่อไฟล์ใน data/
 * @param {*} fallback ค่าเริ่มต้นเมื่อไฟล์ยังไม่มี
 */
export function createStore(filename, fallback) {
  const file = join(DATA_DIR, filename);

  function read() {
    try {
      if (!existsSync(file)) return structuredClone(fallback);
      return JSON.parse(readFileSync(file, "utf8"));
    } catch {
      return structuredClone(fallback);
    }
  }

  function write(data) {
    ensureDataDir();
    const tmp = file + ".tmp";
    writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    renameSync(tmp, file); // atomic replace
    return data;
  }

  return { read, write };
}

let seq = 0;
/** สร้าง id สั้นที่ไม่ซ้ำ */
export function newId(prefix = "id") {
  seq = (seq + 1) % 1000;
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36).padStart(2, "0")}`;
}
