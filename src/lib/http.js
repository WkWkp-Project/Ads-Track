// src/lib/http.js — ตัวช่วยสำหรับ route

/** ครอบ async handler ให้ส่ง error ไปที่ error middleware อัตโนมัติ */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** ปิดบัง token ก่อนส่งกลับหน้าเว็บ */
export function maskToken(token) {
  return token ? "•••••• (ตั้งค่าแล้ว)" : "";
}

/** ตรวจว่าค่าที่ส่งมาเป็น token จริง (ไม่ใช่ค่าที่ถูกปิดบัง) */
export function isRealToken(value) {
  return typeof value === "string" && value && !value.includes("••");
}
