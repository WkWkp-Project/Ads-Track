// src/lib/auth.js — ล็อกระบบด้วย PIN (ทำงานเฉพาะเมื่อตั้ง PIN ไว้ในหน้าตั้งค่า)
import { getSettings } from "../store/settings.js";

const COOKIE_NAME = "adops_pin";
const OPEN_PATHS = ["/login", "/healthz"];

function cookiePin(req) {
  const raw = req.headers.cookie || "";
  const hit = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(COOKIE_NAME + "="));
  return hit ? decodeURIComponent(hit.slice(COOKIE_NAME.length + 1)) : "";
}

/** middleware: ถ้าตั้ง PIN ไว้ ทุก request ต้องมี cookie PIN ที่ถูกต้อง */
export function pinGuard(req, res, next) {
  const { appPin } = getSettings();
  if (!appPin) return next();                       // ไม่ได้ตั้ง PIN = ใช้ในเครื่องปกติ
  if (OPEN_PATHS.includes(req.path)) return next();
  if (cookiePin(req) === appPin) return next();
  if (req.path.startsWith("/api")) return res.status(401).json({ error: "ต้องใส่ PIN ก่อนใช้งาน" });
  res.status(401).send(LOGIN_PAGE);                 // หน้าเว็บ -> แสดงหน้าใส่ PIN
}

/** ติดตั้ง route สำหรับล็อกอิน */
export function mountLogin(app) {
  app.post("/login", (req, res) => {
    const { pin } = req.body || {};
    const { appPin } = getSettings();
    if (appPin && pin === appPin) {
      res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(pin)}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`);
      return res.json({ ok: true });
    }
    res.status(401).json({ error: "PIN ไม่ถูกต้อง" });
  });
}

const LOGIN_PAGE = `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ad Ops Dashboard — ใส่ PIN</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body{font-family:'Sarabun',sans-serif;background:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .card{background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.08);padding:32px;width:90%;max-width:340px;text-align:center}
  h1{font-size:18px;color:#1e293b;margin:0 0 4px}
  p{font-size:13px;color:#94a3b8;margin:0 0 20px}
  input{width:100%;box-sizing:border-box;font-size:22px;text-align:center;letter-spacing:6px;padding:10px;border:1px solid #cbd5e1;border-radius:10px;outline:none}
  input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15)}
  button{width:100%;margin-top:14px;padding:11px;font-size:15px;font-weight:600;font-family:inherit;color:#fff;background:#4f46e5;border:none;border-radius:10px;cursor:pointer}
  button:hover{background:#4338ca}
  .err{color:#dc2626;font-size:13px;margin-top:10px;min-height:18px}
</style></head>
<body><div class="card">
  <h1>📊 Ad Ops Dashboard</h1>
  <p>ใส่ PIN เพื่อเข้าใช้งาน</p>
  <input id="pin" type="password" inputmode="numeric" autocomplete="off" autofocus>
  <button onclick="go()">เข้าใช้งาน</button>
  <div class="err" id="err"></div>
</div>
<script>
  const pinEl = document.getElementById('pin');
  pinEl.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  async function go() {
    const r = await fetch('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: pinEl.value }) });
    if (r.ok) location.reload();
    else { document.getElementById('err').textContent = 'PIN ไม่ถูกต้อง ลองใหม่'; pinEl.value = ''; pinEl.focus(); }
  }
</script></body></html>`;
