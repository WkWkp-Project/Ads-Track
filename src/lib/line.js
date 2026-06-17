// src/lib/line.js — ส่งข้อความผ่าน LINE Messaging API

const BROADCAST_URL = "https://api.line.me/v2/bot/message/broadcast";

/**
 * ส่งข้อความแบบ broadcast ไปยังเพื่อนทุกคนของ LINE Official Account
 * (ไม่ต้องตั้ง webhook สาธารณะ จึงรันบนเครื่องตัวเองได้)
 * @param {string} token  Channel access token ของ LINE OA
 * @param {string} message  ข้อความ (สูงสุด 5000 ตัวอักษร)
 */
export async function sendBroadcast(token, message) {
  if (!token) throw new Error("ยังไม่ได้ตั้งค่า LINE token");

  const res = await fetch(BROADCAST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      messages: [{ type: "text", text: message.slice(0, 5000) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LINE ส่งไม่สำเร็จ (${res.status}): ${body}`);
  }
  return true;
}
