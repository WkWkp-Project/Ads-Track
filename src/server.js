// src/server.js — จุดเริ่มต้นเว็บเซิร์ฟเวอร์
import express from "express";
import api from "./routes/index.js";
import { PORT, PUBLIC_DIR } from "./config.js";
import { pinGuard, mountLogin } from "./lib/auth.js";
import { LOGO_DIR } from "./store/logos.js";
import { FILES_DIR } from "./store/attachments.js";

const app = express();

app.use(express.json({ limit: "30mb" }));   // เผื่อแนบไฟล์ base64 (สูงสุด 15MB ต่อไฟล์)
mountLogin(app);
app.use(pinGuard);            // ล็อกด้วย PIN เมื่อตั้งไว้ (จำเป็นตอนเปิดออนไลน์)
app.use(express.static(PUBLIC_DIR));
app.use("/logos", express.static(LOGO_DIR));   // ไฟล์โลโก้แบรนด์
app.use("/files", express.static(FILES_DIR)); // เอกสารแนบของแบรนด์

app.use("/api", api);

// health check (ใช้กับ Docker)
app.get("/healthz", (req, res) => res.json({ ok: true }));

// error handler รวมศูนย์
app.use((err, req, res, next) => {
  console.error("[error]", err.message);
  res.status(err.status || 400).json({ error: err.message || "เกิดข้อผิดพลาด" });
});

app.listen(PORT, () => {
  console.log("\n  ✅ Ad Ops Dashboard พร้อมใช้งานแล้ว");
  console.log("  👉 เปิดเบราว์เซอร์ไปที่:  http://localhost:" + PORT + "\n");
});
