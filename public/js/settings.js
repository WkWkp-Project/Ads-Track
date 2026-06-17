// public/js/settings.js — นำเข้าข้อมูล + ตั้งค่า รวมที่เดียว (ไม่มีทางเข้าซ้ำซ้อน)

function SettingsView({ brands, onDataChanged }) {
  return (
    <div className="max-w-2xl space-y-5">
      <RateCardSection brands={brands} onDataChanged={onDataChanged} />
      <OnlineSection />
      <LineSection />
      <ImportSection brands={brands} onDataChanged={onDataChanged} />
    </div>
  );
}

// ---------- Rate Card: ราคาต่อผลลัพธ์ — ค่ากลาง + ราคาเฉพาะแบรนด์ ----------
function RateCardSection({ brands, onDataChanged }) {
  const [scope, setScope] = useState("");        // "" = ค่ากลาง | brandId = ราคาเฉพาะแบรนด์
  const [global, setGlobal] = useState(null);    // ราคากลาง (ค่าจริงทุกช่อง)
  const [rates, setRates] = useState({});        // ค่าที่กำลังแก้ของ scope ปัจจุบัน
  const [msg, setMsg] = useState("");
  const brand = brands.find((b) => b.id === scope);

  // โหลดค่ากลางครั้งแรก
  useEffect(() => { api.get("/api/settings").then((s) => setGlobal({ ...(s.rateCard || {}) })); }, []);
  // เปลี่ยน scope -> โหลดค่าของ scope นั้น
  useEffect(() => {
    if (!global) return;
    if (!scope) setRates({ ...global });
    else setRates({ ...((brand && brand.rateCard) || {}) });  // sparse: ว่าง = สืบทอดค่ากลาง
  }, [scope, global, brand && brand.rateCard]);

  if (!global) return null;
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };

  const save = async () => {
    if (!scope) {
      const s = await api.put("/api/settings", { rateCard: rates });
      setGlobal({ ...(s.rateCard || {}) });
      flash("บันทึกราคากลางแล้ว");
    } else {
      await api.put("/api/brands/" + scope, { rateCard: rates });
      flash(`บันทึกราคาของ ${brand ? brand.name : ""} แล้ว`);
      onDataChanged && onDataChanged();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 surface">
      <h3 className="font-semibold mb-1">ราคาต่อผลลัพธ์ (Rate Card)</h3>
      <p className="text-xs text-slate-500 mb-3">ตั้งราคาต่อผลลัพธ์ที่คาดหวัง — เวลาเปิดงาน กด "วางแผนเป้าจากงบ" ในหน้า KPI จะคำนวณเป้าให้ (เป้า = งบ ÷ ราคา) · เลือกแบรนด์เพื่อตั้งราคาเฉพาะแบรนด์นั้น (เว้นว่าง = ใช้ค่ากลาง)</p>

      {/* เลือกขอบเขตราคา — ต้องเลือกก่อนตั้งราคา */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-slate-600">ตั้งราคาสำหรับ:</span>
        <select value={scope} onChange={(e) => setScope(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white">
          <option value="">ค่ากลาง (ทุกแบรนด์)</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2.5">
        {RATE_CARD_FIELDS.map(({ k, label, per, unit, noBaht }) => (
          <div key={k} className={"flex items-center gap-2 " + (k === "roas" ? "sm:col-span-2 border-t border-slate-100 pt-2.5 mt-0.5" : "")}>
            <label className={"text-sm flex-1 " + (k === "roas" ? "text-slate-700 font-medium" : "text-slate-600")}>{label}</label>
            <span className={"text-slate-400 text-sm " + (noBaht ? "invisible" : "")}>฿</span>
            <input type="number" step="any" value={rates[k] ?? ""} onChange={(e) => setRates({ ...rates, [k]: e.target.value })}
              placeholder={scope ? (global[k] ?? "") : ""}
              className="w-20 text-sm text-right border border-slate-300 rounded-lg px-2 py-1.5 tnum focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-300" />
            <span className="text-xs text-slate-400 w-14">{unit || (per === 1000 ? "/1,000" : "/ผล")}</span>
          </div>
        ))}
      </div>
      {scope && <p className="text-xs text-slate-400 mt-2">เลขจาง = ค่ากลาง (ปล่อยว่าง = ใช้ค่ากลาง) · ใส่ตัวเลขเพื่อกำหนดราคาเฉพาะ {brand ? brand.name : ""}</p>}

      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">{scope ? `บันทึกราคา ${brand ? brand.name : ""}` : "บันทึกราคากลาง"}</button>
        {msg && <span className="text-sm text-emerald-600">{msg}</span>}
      </div>
    </div>
  );
}

const RATE_CARD_FIELDS = [
  { k: "impression", label: "Impression", per: 1000 },
  { k: "reach", label: "Reach", per: 1000 },
  { k: "engagement", label: "Engagement", per: 1 },
  { k: "click", label: "Link Click", per: 1 },
  { k: "view", label: "Video View", per: 1 },
  { k: "lead", label: "Lead", per: 1 },
  { k: "message", label: "Message", per: 1 },
  { k: "conversion", label: "Conversion", per: 1 },
  { k: "roas", label: "เป้า ROAS", unit: "เท่า", noBaht: true },  // ตัวคูณ ไม่ใช่ราคา
];

// ---------- ใช้งานออนไลน์ (PIN + วิธีเปิด) ----------
function OnlineSection() {
  const [cfg, setCfg] = useState(null);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState(null);
  const inp = "w-full text-sm border border-slate-300 rounded-lg px-3 py-2";
  useEffect(() => { api.get("/api/settings").then(setCfg); }, []);
  if (!cfg) return null;
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(null), 3000); };

  const savePin = async () => {
    const res = await api.put("/api/settings", { appPin: pin });
    setCfg(res); setPin("");
    flash(res.appPin ? "ตั้ง PIN แล้ว — ทุกคนต้องใส่ PIN ก่อนเข้าระบบ" : "ปิดการล็อกแล้ว");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 surface">
      <h3 className="font-semibold mb-1">ใช้งานออนไลน์ (ให้ทีมเข้าจากมือถือ/ที่อื่น)</h3>
      <ol className="text-xs text-slate-500 mb-3 list-decimal pl-4 space-y-1">
        <li>ตั้ง <b>PIN</b> ด้านล่างก่อน (กันคนนอกเข้าระบบ)</li>
        <li>ปิดหน้าต่างเซิร์ฟเวอร์เดิม แล้วดับเบิลคลิก <b>เปิดออนไลน์.bat</b> แทน</li>
        <li>ระบบจะสร้างลิงก์ <b>https://...trycloudflare.com</b> และส่งเข้า LINE ให้ทีมอัตโนมัติ (ถ้าตั้ง token ไว้)</li>
      </ol>
      <label className="text-xs text-slate-500 mb-1 block">PIN เข้าระบบ (ตัวเลข/ตัวอักษรก็ได้ — เว้นว่างแล้วบันทึก = ปิดการล็อก)</label>
      <div className="flex gap-2">
        <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder={cfg.appPin || "เช่น 2468"} className={inp + " max-w-[200px]"} />
        <button onClick={savePin} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">บันทึก PIN</button>
      </div>
      <p className="text-xs text-slate-400 mt-2">ลิงก์ออนไลน์ใช้ได้ตอนคอมเครื่องนี้เปิดอยู่เท่านั้น และลิงก์เปลี่ยนทุกครั้งที่เปิดใหม่ (ระบบส่งลิงก์ใหม่เข้า LINE ให้เอง)</p>
      {msg && <div className="text-sm mt-2 text-slate-600">{msg}</div>}
    </div>
  );
}

// ---------- นำเข้าข้อมูล (ที่เดียวจบ: ลิงก์ประจำ + วางครั้งเดียว) ----------
function ImportSection({ brands, onDataChanged }) {
  const [sources, setSources] = useState([]);
  const [draft, setDraft] = useState({ name: "", url: "", brandId: "", replaceMode: true });
  const [showPaste, setShowPaste] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [pasteBrandId, setPasteBrandId] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const inp = "w-full text-sm border border-slate-300 rounded-lg px-3 py-2";

  const reload = () => api.get("/api/settings/sources").then(setSources);
  useEffect(() => { reload(); }, []);
  const brandName = (id) => (brands.find((b) => b.id === id) || {}).name || "ตามคอลัมน์ในตาราง";
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(null), 4000); };

  const addSource = async () => {
    if (!draft.url) return flash("กรุณาใส่ลิงก์");
    await api.post("/api/settings/sources", draft);
    setDraft({ name: "", url: "", brandId: "", replaceMode: true });
    reload();
    flash("เพิ่มลิงก์แล้ว — กด sync เพื่อดึงข้อมูล");
  };
  const syncOne = async (id) => {
    setBusy(id);
    const res = await api.post("/api/import/sync/" + id);
    setBusy("");
    flash(res.error ? res.error : `${res.source}: นำเข้า ${res.count} งาน`);
    reload(); onDataChanged();
  };
  const syncAll = async () => {
    setBusy("all");
    const res = await api.post("/api/import/sync-all");
    setBusy("");
    const ok = (res.results || []).filter((r) => r.ok).reduce((s, r) => s + r.count, 0);
    const fail = (res.results || []).filter((r) => !r.ok);
    flash(`sync เสร็จ: ${ok} งาน` + (fail.length ? ` · ${fail.length} ลิงก์มีปัญหา` : ""));
    reload(); onDataChanged();
  };
  const removeSource = async (id) => {
    if (!confirm("ลบลิงก์นี้? (งานที่นำเข้าแล้วยังอยู่)")) return;
    await api.del("/api/settings/sources/" + id);
    reload();
  };
  const importPaste = async () => {
    setBusy("paste");
    const res = await api.post("/api/import/text", { csvText, brandId: pasteBrandId });
    setBusy("");
    if (res.error) flash(res.error);
    else { flash(`นำเข้า ${res.count} งาน`); setCsvText(""); onDataChanged(); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 surface">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">นำเข้าจาก Google Sheets</h3>
        {sources.length > 0 && <button onClick={syncAll} disabled={busy === "all"} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50">{busy === "all" ? "กำลัง sync..." : "Sync ทุกลิงก์"}</button>}
      </div>
      <p className="text-xs text-slate-500 mb-4">บันทึกลิงก์ชีตของแต่ละแบรนด์ไว้ครั้งเดียว แล้วกด sync ดึงข้อมูลล่าสุดได้ตลอด (sync ซ้ำไม่ทำให้ข้อมูลซ้ำ)</p>

      {/* รายการลิงก์ */}
      <div className="space-y-2 mb-4">
        {sources.length === 0 && <div className="text-sm text-slate-300 text-center py-3">ยังไม่มีลิงก์ — เพิ่มด้านล่าง</div>}
        {sources.map((s) => (
          <div key={s.id} className="flex items-center gap-2 border border-slate-200 rounded-lg p-2.5">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-700 truncate">{s.name} <span className="text-xs text-slate-400">· {brandName(s.brandId)}</span></div>
              <div className="text-xs text-slate-400 truncate">{s.url}</div>
              {s.lastSyncAt && <div className="text-xs text-emerald-600">sync ล่าสุด {fmtThai(s.lastSyncAt.slice(0, 10))} · {s.lastCount} งาน</div>}
            </div>
            <button onClick={() => syncOne(s.id)} disabled={busy === s.id} className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium disabled:opacity-50">{busy === s.id ? "..." : "sync"}</button>
            <button onClick={() => removeSource(s.id)} className="px-2 py-1 text-xs text-slate-400 hover:text-red-600">ลบ</button>
          </div>
        ))}
      </div>

      {/* เพิ่มลิงก์ */}
      <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 mb-3">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="ชื่อลิงก์ (เช่น Thychef Phase 2)" className={inp} />
        <select value={draft.brandId} onChange={(e) => setDraft({ ...draft, brandId: e.target.value })} className={inp}>
          <option value="">แบรนด์: ตามคอลัมน์ในตาราง</option>
          {brands.map((b) => <option key={b.id} value={b.id}>แบรนด์: {b.name}</option>)}
        </select>
        <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="ลิงก์ CSV (File → Share → Publish to web → CSV)" className={inp + " col-span-2"} />
        <div className="col-span-2"><button onClick={addSource} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">+ เพิ่มลิงก์</button></div>
      </div>

      {/* วางครั้งเดียว (ซ่อนไว้ ไม่ให้สับสนกับลิงก์ประจำ) */}
      <button onClick={() => setShowPaste(!showPaste)} className="text-xs text-indigo-600 hover:underline">
        {showPaste ? "▾ ซ่อน" : "▸ นำเข้าครั้งเดียวด้วยการวางข้อมูล (สำหรับชีตที่ไม่ได้ใช้ประจำ)"}
      </button>
      {showPaste && (
        <div className="mt-2 space-y-2">
          <select value={pasteBrandId} onChange={(e) => setPasteBrandId(e.target.value)} className={inp}>
            <option value="">แบรนด์: ตามคอลัมน์ในตาราง</option>
            {brands.map((b) => <option key={b.id} value={b.id}>แบรนด์: {b.name}</option>)}
          </select>
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="คัดลอกทั้งตารางจาก Sheet (รวมหัวคอลัมน์) มาวางที่นี่" className={inp + " font-mono text-xs"} rows="5" />
          <button onClick={importPaste} disabled={busy === "paste" || !csvText} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50">{busy === "paste" ? "กำลังนำเข้า..." : "นำเข้า"}</button>
        </div>
      )}

      {msg && <div className="text-sm mt-3 text-slate-600">{msg}</div>}
    </div>
  );
}

// ---------- LINE ----------
function LineSection() {
  const [cfg, setCfg] = useState(null);
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState(null);
  const inp = "w-full text-sm border border-slate-300 rounded-lg px-3 py-2";
  useEffect(() => { api.get("/api/settings").then(setCfg); }, []);
  if (!cfg) return null;
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(null), 3000); };

  const save = async () => {
    const body = { notifyTime: cfg.notifyTime };
    if (token) body.lineToken = token;
    const res = await api.put("/api/settings", body);
    setCfg(res); setToken(""); flash("บันทึกแล้ว");
  };
  const test = async () => {
    flash("กำลังส่ง...");
    const res = await api.post("/api/notify/test");
    flash(res.error ? res.error : "ส่งเข้า LINE สำเร็จ");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 surface">
      <h3 className="font-semibold mb-1">การแจ้งเตือน LINE</h3>
      <p className="text-xs text-slate-500 mb-3">ใส่ Channel Access Token ของ LINE Official Account (วิธีดูใน README)</p>
      <label className="text-xs text-slate-500 mb-1 block">LINE Channel Access Token</label>
      <input value={token} onChange={(e) => setToken(e.target.value)} placeholder={cfg.lineToken || "วาง token ที่นี่"} className={inp + " mb-3"} />
      <label className="text-xs text-slate-500 mb-1 block">เวลาแจ้งเตือนทุกเช้า</label>
      <input type="time" value={cfg.notifyTime} onChange={(e) => setCfg({ ...cfg, notifyTime: e.target.value })} className={inp + " mb-3 w-32"} />
      <div className="flex gap-2">
        <button onClick={save} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">บันทึก</button>
        <button onClick={test} className="px-4 py-2 rounded-lg border border-slate-300 text-sm">ทดสอบส่ง LINE ตอนนี้</button>
      </div>
      {msg && <div className="text-sm mt-3 text-slate-600">{msg}</div>}
    </div>
  );
}
