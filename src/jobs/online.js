// src/jobs/online.js — เปิดระบบแบบออนไลน์: รันเซิร์ฟเวอร์ + Cloudflare Tunnel (ฟรี)
// ได้ลิงก์ https://xxxx.trycloudflare.com แล้วส่งเข้า LINE ให้ทีมอัตโนมัติ
import { spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { ROOT_DIR, PORT } from "../config.js";
import { getSettings } from "../store/settings.js";
import { sendBroadcast } from "../lib/line.js";
import { buildTodayMessage } from "../services/notifyService.js";

const CLOUDFLARED = join(ROOT_DIR, "cloudflared.exe");
const URL_PATTERN = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;

function startServer() {
  const child = spawn(process.execPath, [join(ROOT_DIR, "src", "server.js")], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  child.on("exit", (code) => {
    console.error(`\n❌ เซิร์ฟเวอร์หยุดทำงาน (code ${code})`);
    process.exit(code || 1);
  });
  return child;
}

function startTunnel(onUrl) {
  const child = spawn(CLOUDFLARED, ["tunnel", "--url", `http://localhost:${PORT}`], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let found = false;
  const watch = (chunk) => {
    if (found) return;
    const m = String(chunk).match(URL_PATTERN);
    if (m) { found = true; onUrl(m[0]); }
  };
  child.stdout.on("data", watch);
  child.stderr.on("data", watch);
  child.on("exit", (code) => {
    console.error(`\n❌ Tunnel หยุดทำงาน (code ${code})`);
    process.exit(code || 1);
  });
  return child;
}

async function announce(url) {
  const { appPin, lineToken } = getSettings();

  console.log("\n==============================================");
  console.log("  🌐 ระบบออนไลน์แล้ว! เข้าได้จากทุกที่ที่ลิงก์:");
  console.log(`  👉 ${url}`);
  console.log("==============================================");
  if (!appPin) {
    console.log("  ⚠️ ยังไม่ได้ตั้ง PIN — ใครมีลิงก์ก็เข้าได้");
    console.log("     แนะนำ: เปิดเว็บ → นำเข้า & ตั้งค่า → ตั้ง PIN ก่อนแชร์ลิงก์");
  }
  console.log("  (ลิงก์ใช้ได้จนกว่าจะปิดหน้าต่างนี้ — เปิดใหม่ลิงก์จะเปลี่ยน)\n");

  if (lineToken) {
    try {
      const msg = `🌐 Ad Ops Dashboard ออนไลน์แล้ว\nเข้าระบบ: ${url}${appPin ? "\n(ต้องใส่ PIN ทีมตามที่ตกลงกัน)" : ""}\n\n${buildTodayMessage()}`;
      await sendBroadcast(lineToken, msg);
      console.log("  ✅ ส่งลิงก์เข้า LINE ให้ทีมแล้ว\n");
    } catch (e) {
      console.error("  ⚠️ ส่งลิงก์เข้า LINE ไม่สำเร็จ: " + e.message + "\n");
    }
  } else {
    console.log("  💡 ตั้งค่า LINE token ไว้ ระบบจะส่งลิงก์นี้ให้ทีมอัตโนมัติทุกครั้งที่เปิด\n");
  }
}

function main() {
  if (!existsSync(CLOUDFLARED)) {
    console.error("❌ ไม่พบ cloudflared.exe — กรุณาเปิดผ่านไฟล์ เปิดออนไลน์.bat (จะดาวน์โหลดให้อัตโนมัติ)");
    process.exit(1);
  }

  console.log("⏳ กำลังเปิดเซิร์ฟเวอร์ + สร้างลิงก์ออนไลน์...");
  const server = startServer();
  const tunnel = startTunnel(announce);

  const stop = () => { tunnel.kill(); server.kill(); process.exit(0); };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main();
