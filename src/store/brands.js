// src/store/brands.js — จัดการข้อมูลแบรนด์
import { createStore, newId } from "./jsonStore.js";

const store = createStore("brands.json", []);

/** สีเริ่มต้นหมุนเวียนให้แบรนด์ใหม่ */
const PALETTE = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"];

export function listBrands() {
  return store.read();
}

export function getBrand(id) {
  return listBrands().find((b) => b.id === id) || null;
}

export function createBrand({ name, color, note = "", rateCard = {} }) {
  const brands = listBrands();
  // กันสร้างแบรนด์ชื่อซ้ำ — ถ้ามีอยู่แล้วคืนตัวเดิม (ไม่งั้นการ์ดแบรนด์จะแตกเป็นสองใบ)
  const clean = String(name || "").trim();
  const existing = brands.find((b) => b.name.toLowerCase() === clean.toLowerCase());
  if (existing) return existing;
  const now = new Date().toISOString();
  const brand = {
    id: newId("brand"),
    name: clean || "แบรนด์ใหม่",
    color: color || PALETTE[brands.length % PALETTE.length],
    logo: "",
    note,
    rateCard: rateCard && typeof rateCard === "object" ? rateCard : {},
    createdAt: now,
    updatedAt: now,
  };
  brands.push(brand);
  store.write(brands);
  return brand;
}

export function updateBrand(id, patch) {
  const brands = listBrands();
  const i = brands.findIndex((b) => b.id === id);
  if (i === -1) return null;
  brands[i] = { ...brands[i], ...patch, id, updatedAt: new Date().toISOString() };
  store.write(brands);
  return brands[i];
}

export function deleteBrand(id) {
  const brands = listBrands();
  const next = brands.filter((b) => b.id !== id);
  if (next.length === brands.length) return false;
  store.write(next);
  return true;
}

/** หาแบรนด์จากชื่อ (ไม่สนตัวพิมพ์/ช่องว่าง) ถ้าไม่มีให้สร้างใหม่ — ใช้ตอนนำเข้า */
export function findOrCreateByName(name) {
  const clean = String(name || "").trim();
  if (!clean) return null;
  const existing = listBrands().find(
    (b) => b.name.toLowerCase() === clean.toLowerCase()
  );
  return existing || createBrand({ name: clean });
}
