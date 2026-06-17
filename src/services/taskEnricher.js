// src/services/taskEnricher.js — แนบข้อมูลแบรนด์ (ชื่อ/สี) เข้ากับงาน เพื่อส่งให้หน้าเว็บ
import { listBrands } from "../store/brands.js";

/** แนบข้อมูลแบรนด์เข้ากับงานทุกชิ้น */
export function enrichTasks(tasks) {
  const map = new Map(listBrands().map((b) => [b.id, b]));
  return tasks.map((t) => {
    const b = map.get(t.brandId);
    return {
      ...t,
      brand: b ? { id: b.id, name: b.name, color: b.color, logo: b.logo || "", rateCard: b.rateCard || {} } : null,
    };
  });
}
