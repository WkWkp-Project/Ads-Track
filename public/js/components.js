// public/js/components.js — คอมโพเนนต์ที่ใช้ซ้ำ (การ์ดงาน + Modal)

/** ชุดไอคอนเส้น (stroke) ทำเอง — คม สะอาด คุมโทนทั้งแอป แทน emoji/ของสำเร็จรูป */
function Icon({ name, size = 20, className = "", strokeWidth = 1.9 }) {
  const P = {
    today: <><circle cx="12" cy="13" r="3.2" /><path d="M12 4v2M4.5 13H6M18 13h1.5M6.8 7.8l1.1 1.1M17.2 7.8l-1.1 1.1M12 17.4V19" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /><circle cx="8.5" cy="14" r="1.1" fill="currentColor" stroke="none" /></>,
    chart: <><path d="M4 20h16" /><rect x="5.5" y="11" width="3.2" height="6" rx="1" /><rect x="10.4" y="7" width="3.2" height="10" rx="1" /><rect x="15.3" y="13" width="3.2" height="4" rx="1" /></>,
    tag: <><path d="M4 13.3V5.5A1.5 1.5 0 0 1 5.5 4h7.8a2 2 0 0 1 1.4.6l5.2 5.2a2 2 0 0 1 0 2.8l-6.5 6.5a2 2 0 0 1-2.8 0L4.6 14.7A2 2 0 0 1 4 13.3Z" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /></>,
    settings: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2.3" /><circle cx="8" cy="17" r="2.3" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.8-3.8" /></>,
    chevron: <path d="M6 9l6 6 6-6" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {P[name] || null}
    </svg>
  );
}

/** จุดสีแบรนด์ */
function BrandDot({ color }) {
  return <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color || "#94a3b8" }} />;
}

/** สัญลักษณ์แบรนด์: มีโลโก้แสดงโลโก้ ไม่มีแสดงจุดสี (size: "sm" | "lg") */
function BrandMark({ brand, size }) {
  if (brand && brand.logo) {
    const px = size === "lg" ? "w-8 h-8" : "w-5 h-5";
    return <img src={brand.logo} alt="" className={px + " rounded-full object-cover shrink-0 border border-slate-200 bg-white"} />;
  }
  if (size === "lg") {
    return <span className="w-8 h-8 rounded-full shrink-0 inline-flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brand ? brand.color : "#94a3b8" }}>{brand && brand.name ? brand.name[0].toUpperCase() : "?"}</span>;
  }
  return <BrandDot color={brand ? brand.color : "#94a3b8"} />;
}

/** ปุ่มสลับแบรนด์ + ค้นหา — สเกลได้ถึงร้อยแบรนด์โดยไม่ล้น (แทน pill row) */
function BrandSwitcher({ brands, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = brands.find((b) => b.id === value);

  const filtered = q.trim()
    ? brands.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase()))
    : brands;

  const close = () => { setOpen(false); setQ(""); };
  const pick = (id) => { onChange(id); close(); };

  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (e.key === "Enter") {
      if (!q.trim()) pick("");
      else if (filtered.length) pick(filtered[0].id);
    }
  };

  const itemRow = (active, mark, label, onClick, key) => (
    <button key={key} onClick={onClick}
      className={"w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg " + (active ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700 hover:bg-slate-100")}>
      {mark}
      <span className="truncate flex-1">{label}</span>
      {active && <span className="text-indigo-600 shrink-0">✓</span>}
    </button>
  );

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className={"relative z-50 flex items-center gap-2 max-w-[130px] sm:max-w-[200px] pl-2.5 pr-2 py-2 rounded-lg border text-sm " + (open ? "border-zinc-400 bg-zinc-100 text-zinc-900" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50")}>
        {current ? <BrandMark brand={current} /> : <span className="w-4 h-1.5 rounded-full bg-zinc-300 inline-block" />}
        <span className="truncate font-medium">{current ? current.name : "ทุกแบรนด์"}</span>
        <span className="text-zinc-400 shrink-0"><Icon name="chevron" size={14} strokeWidth={2.4} /></span>
      </button>

      {open && (
        <>
          {/* คลิกนอกกรอบเพื่อปิด */}
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="modal-panel absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
                placeholder={`ค้นหาแบรนด์ (${brands.length})...`}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
              {!q.trim() && itemRow(!value, <span className="w-5 text-center" />, "ทุกแบรนด์", () => pick(""), "all")}
              {filtered.map((b) => itemRow(value === b.id, <BrandMark brand={b} />, b.name, () => pick(b.id), b.id))}
              {filtered.length === 0 && <div className="px-3 py-6 text-center text-sm text-slate-400">ไม่พบแบรนด์ "{q}"</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** อ่านไฟล์รูป -> ย่อขนาด (สูงสุด 256px) -> base64 data URL ส่งให้เซิร์ฟเวอร์ */
function fileToLogoData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (file.type === "image/svg+xml" || file.type === "image/gif") return resolve(dataUrl); // คงไฟล์เดิม (ย่อไม่ได้/เสียแอนิเมชัน)
      const img = new Image();
      img.onload = () => {
        const MAX = 256;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("อ่านรูปไม่ได้"));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("อ่านไฟล์ไม่ได้"));
    reader.readAsDataURL(file);
  });
}

/** ป้าย % บรรลุเป้า */
function PctBadge({ value }) {
  return <span className={"text-xs px-1.5 py-0.5 rounded-md font-medium " + pctColor(value)}>{fmtPct(value)}</span>;
}

/** กล่อง Modal ครอบทั่วไป — ปิดได้ทั้งคลิกพื้นหลัง, ปุ่ม X และกด Escape (กันค้าง) */
function Modal({ title, children, onClose, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay fixed inset-0 bg-slate-900/45 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className={"modal-panel bg-white rounded-2xl shadow-xl w-full " + (wide ? "max-w-2xl" : "max-w-lg") + " max-h-[90vh] overflow-y-auto p-6"} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold leading-7">{title}</h2>
          <button onClick={onClose} aria-label="ปิด" className="shrink-0 -mr-1 -mt-1 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center text-lg">✕</button>
        </div>
        {children}
        {footer && <div className="flex justify-end gap-2 mt-5">{footer}</div>}
      </div>
    </div>
  );
}

/** ความด่วนของงาน -> ชิปข้อความ + โทนการ์ด (ไม่พึ่งสีอย่างเดียว มีข้อความกำกับเสมอ) */
function urgencyView(t, today) {
  const u = urgency(t, today);
  const days = (a, b) => Math.round((new Date(a + "T00:00:00") - new Date(b + "T00:00:00")) / 86400000);
  switch (u) {
    case "today":
      return { card: "border-red-300 bg-white shadow-sm", chip: <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-semibold">ยิงวันนี้</span> };
    case "overdue": {
      const d = days(today, actionDate(t));
      return { card: "border-red-200 bg-red-50/70", chip: <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">เลยกำหนด {d} วัน</span> };
    }
    case "soon": {
      const d = days(actionDate(t), today);
      return { card: "border-slate-200 bg-white", chip: <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">อีก {d} วัน</span> };
    }
    case "closed":
      return { card: "border-slate-200 bg-white opacity-70", chip: null };
    default:
      return { card: "border-slate-200 bg-white", chip: null };
  }
}

const btnPrimary = "px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50";
const btnGhost = "px-4 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50";
const inputCls = "w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none";

/** การ์ดงาน 1 ชิ้น (ใช้ในหน้า "วันนี้" และแผงข้างปฏิทิน) */
function TaskCard({ t, today, onEdit, onDelete, onQuickStatus, onKpi }) {
  const { card, chip } = urgencyView(t, today);
  const ach = achievement(t);
  const { spend } = getKpi(t);
  return (
    <div className={"min-w-0 rounded-2xl border p-4 surface surface-hover " + card}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {chip}
            {t.brand && <span className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold"><BrandMark brand={t.brand} />{t.brand.name}</span>}
            {t.channel && <span className={"text-white text-[11px] px-2 py-0.5 rounded-full " + channelColor(t.channel)}>{t.channel}</span>}
          </div>
          <div className="font-bold text-[15.5px] leading-6 text-zinc-950 truncate">{t.title || "(ไม่มีชื่องาน)"}</div>
          <div className="text-xs text-zinc-500 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 num">
            {t.objective && <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold tracking-wide">{t.objective}</span>}
            {t.budget !== "" && t.budget != null && <span>งบ {Number(t.budget).toLocaleString()}{t.feePercent > 0 ? ` (+${t.feePercent}% = ${Math.round(totalWithFee(t)).toLocaleString()})` : ""}</span>}
            {t.period && <span>{t.period}</span>}
            {t.code && <span>#{t.code}</span>}
            {t.owner && <span>{t.owner}</span>}
            {hasActuals(t) && <span className="flex items-center gap-1 text-slate-400">บรรลุเป้า <PctBadge value={ach} /></span>}
          </div>
          {(t.startAds || t.postDate) && (
            <div className="text-xs text-zinc-400 mt-1 num">{fmtThai(t.startAds || t.postDate)}{t.endAds ? " → " + fmtThai(t.endAds) : ""}</div>
          )}
          {/* แถบ pacing งบ: เหลือบเดียวรู้ว่าใช้งบไปถึงไหน (น้ำเงิน=ปกติ เหลือง=ใกล้เต็ม แดง=เกิน) */}
          {spend != null && totalWithFee(t) > 0 && (() => {
            const total = totalWithFee(t);
            const pct = (spend / total) * 100;
            const tone = pct > 100 ? "bg-red-500" : pct >= 85 ? "bg-amber-400" : "bg-zinc-900";
            const toneText = pct > 100 ? "text-red-600 font-semibold" : pct >= 85 ? "text-amber-600" : "text-zinc-500";
            return (
              <div className="mt-2 max-w-xs">
                <div className="flex justify-between text-[10px] num mb-0.5">
                  <span className="text-zinc-400">ใช้งบ {fmtNum(spend)} / {fmtNum(Math.round(total))}</span>
                  <span className={toneText}>{Math.round(pct)}%</span>
                </div>
                <div className="h-1 rounded-full bg-zinc-200 overflow-hidden">
                  <div className={"h-full rounded-full " + tone} style={{ width: Math.min(100, pct) + "%" }} />
                </div>
              </div>
            );
          })()}
          {t.link && <a href={t.link} target="_blank" className="text-xs text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 mt-1 inline-block">เปิดลิงก์</a>}
          {t.remark && <div className="text-xs text-zinc-500 mt-1 italic">{t.remark}</div>}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {onQuickStatus ? (
            <select value={t.status} onChange={(e) => onQuickStatus({ ...t, status: e.target.value })}
              className={"text-xs px-2 py-1 rounded-lg border cursor-pointer " + (STATUS_STYLE[t.status] || STATUS_STYLE["วางแผน"])}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <span className={"text-xs px-2 py-1 rounded-lg border " + (STATUS_STYLE[t.status] || STATUS_STYLE["วางแผน"])}>{t.status}</span>
          )}
          <div className="flex items-center gap-1">
            {onKpi && <button onClick={() => onKpi(t)} className="text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-700 px-2.5 py-1 rounded-md">KPI</button>}
            {onEdit && <button onClick={() => onEdit(t)} title="แก้ไข" className="text-xs text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 px-1.5 py-1 rounded-md">แก้</button>}
            {onDelete && <button onClick={() => onDelete(t.id)} title="ลบ" className="text-xs text-zinc-400 hover:text-red-600 hover:bg-red-50 px-1.5 py-1 rounded-md">ลบ</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- ฟอร์มงาน (เฉพาะข้อมูลงาน — ตัวเลข KPI แยกไปกรอกในปุ่ม "KPI") ----------
const FORM_FIELDS = [
  { k: "title", label: "ชื่องาน / คอนเทนต์", full: true },
  { k: "channel", label: "ช่องทาง", list: "channels" },
  { k: "objective", label: "วัตถุประสงค์ (Obj)", objSelect: true },
  { k: "budget", label: "งบตามแผน (บาท)", type: "number" },
  { k: "feePercent", label: "ค่าธรรมเนียม % (ถ้ามี)", type: "number" },
  { k: "startAds", label: "วันเริ่มยิงแอด", type: "date" },
  { k: "endAds", label: "วันจบแอด", type: "date" },
  { k: "postDate", label: "วันโพสต์ (ถ้ามี)", type: "date" },
  { k: "code", label: "Gen code" },
  { k: "owner", label: "ผู้รับผิดชอบ" },
  { k: "link", label: "ลิงก์โพสต์ / asset", full: true },
  { k: "remark", label: "หมายเหตุ", textarea: true, full: true },
];

function TaskModal({ task, brands, onSave, onClose, onDuplicate }) {
  const [form, setForm] = useState({ status: "วางแผน", ...task });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const history = Array.isArray(task.history) ? task.history : [];
  return (
    <Modal wide title={task.id ? "แก้ไขงาน" : "เพิ่มงานยิงแอด"} onClose={onClose}
      footer={<>
        {task.id && onDuplicate && <button onClick={() => onDuplicate(task.id)} className={btnGhost + " mr-auto"}>⧉ ทำซ้ำงานนี้</button>}
        <button onClick={onClose} className={btnGhost}>ยกเลิก</button>
        <button onClick={() => onSave(form)} className={btnPrimary}>บันทึก</button>
      </>}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">แบรนด์</label>
          <select value={form.brandId || ""} onChange={(e) => set("brandId", e.target.value)} className={inputCls}>
            <option value="">— ไม่ระบุแบรนด์ —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">สถานะ</label>
          <select value={form.status || "วางแผน"} onChange={(e) => set("status", e.target.value)} className={inputCls}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        {FORM_FIELDS.map((f) => (
          <div key={f.k} className={f.full ? "col-span-2" : ""}>
            <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
            {f.objSelect ? (
              <select value={form.objective || ""} onChange={(e) => set("objective", e.target.value)} className={inputCls}>
                <option value="">— เลือก objective —</option>
                {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
                {/* ค่าที่นำเข้ามาแล้วไม่อยู่ในรายการมาตรฐาน — คงไว้ให้ไม่หาย */}
                {form.objective && !OBJECTIVES.includes(form.objective) && <option value={form.objective}>{form.objective} (กำหนดเอง)</option>}
              </select>
            ) : f.textarea ? <textarea value={form[f.k] || ""} onChange={(e) => set(f.k, e.target.value)} className={inputCls} rows="2" /> :
              <input type={f.type || "text"} list={f.list} value={form[f.k] || ""} onChange={(e) => set(f.k, e.target.value)} className={inputCls} />}
          </div>
        ))}
      </div>
      {Number(form.budget) > 0 && Number(form.feePercent) > 0 && (
        <p className="text-xs text-slate-600 mt-2 tnum">งบรวมค่าธรรมเนียม: <b>{Math.round(totalWithFee(form)).toLocaleString()}</b> บาท (งบ {Number(form.budget).toLocaleString()} + ฟี {form.feePercent}%)</p>
      )}
      <p className="text-xs text-slate-400 mt-2">ตัวเลขเป้า/ผลจริง (Impression, Reach ฯลฯ) กรอกได้ที่ปุ่ม <b>KPI</b> ของงานหลังบันทึก</p>

      {history.length > 0 && (
        <details className="mt-3 border-t border-slate-100 pt-3">
          <summary className="text-xs text-slate-500 cursor-pointer select-none">ประวัติสถานะ ({history.length})</summary>
          <ul className="mt-2 space-y-1">
            {history.slice().reverse().map((h, i) => (
              <li key={i} className="text-xs text-slate-500 flex gap-2 tnum">
                <span className="text-slate-400">{fmtHistoryTime(h.at)}</span>
                <span>{h.from ? `${h.from} → ` : ""}<b className="text-slate-700">{h.status}</b>{h.note ? ` · ${h.note}` : ""}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <datalist id="channels">{CHANNELS.map((c) => <option key={c} value={c} />)}</datalist>
    </Modal>
  );
}

function fmtHistoryTime(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return "";
  return `${+m[3]}/${+m[2]} ${m[4]}:${m[5]}`;
}

// ---------- KPI Modal: แพลนเป้าจากงบด้วยราคาต่อผลลัพธ์ + บันทึกผลจริง ----------
function KpiModal({ task, onSave, onClose }) {
  const init = getKpi(task);
  const [plan, setPlan] = useState({ ...init.plan });
  const [actual, setActual] = useState({ ...init.actual });
  const [spend, setSpend] = useState(init.spend ?? "");
  const [rates, setRates] = useState(null);     // ราคาที่ใช้จริง = ราคาแบรนด์ทับค่ากลาง
  const [msg, setMsg] = useState("");
  // แบรนด์นี้มีราคาเฉพาะตัวไหม (override ค่ากลาง)
  const brandRate = (task.brand && task.brand.rateCard) || {};
  const usingBrandRate = Object.keys(brandRate).length > 0;

  useEffect(() => {
    api.get("/api/settings").then((s) => setRates({ ...(s.rateCard || {}), ...brandRate }));
  }, []);

  const setSide = (setter) => (k, v) => setter((s) => ({ ...s, [k]: v }));
  const sP = setSide(setPlan), sA = setSide(setActual);
  const num = (v) => (v === "" || v == null ? null : Number(v));
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };

  const planBudget = totalWithFee(task);                 // งบเป้าหมาย = งบ + ค่าฟี
  const primary = primaryMetrics(task.objective);        // เมตริกหลักของ obj นี้
  const plannable = primary.filter((k) => {
    const def = KPI_METRICS.find((m) => m.k === k);
    return def && !def.money;                            // ยอดขายคิดจากเป้า ROAS แยกต่างหาก
  });
  const wantsRevenue = primary.includes("revenue");      // obj ที่วัดยอดขาย -> ใช้เป้า ROAS

  /** คำนวณเป้าจากงบ: เป้า = งบ ÷ ราคา × (1000 ถ้าเป็นราคาต่อพัน) */
  const previewTarget = (k) => {
    const def = KPI_METRICS.find((m) => m.k === k);
    const price = num(rates && rates[k]);
    if (!def || !price || price <= 0 || planBudget <= 0) return null;
    return Math.round((planBudget / price) * def.per);
  };
  /** เป้ายอดขายจาก ROAS = งบ × ROAS */
  const targetRevenue = () => {
    const r = num(rates && rates.roas);
    if (!r || r <= 0 || planBudget <= 0) return null;
    return Math.round(planBudget * r);
  };
  const applyPlan = () => {
    const next = { ...plan };
    for (const k of plannable) {
      const v = previewTarget(k);
      if (v != null) next[k] = v;
    }
    if (wantsRevenue) { const rev = targetRevenue(); if (rev != null) next.revenue = rev; }
    setPlan(next);
    flash("ใส่เป้าให้แล้ว — แก้ตัวเลขต่อได้เลย");
  };
  const saveRates = async () => {
    if (task.brandId) {
      await api.put("/api/brands/" + task.brandId, { rateCard: rates });
      flash(`บันทึกเป็นราคาของแบรนด์ ${task.brand ? task.brand.name : ""} แล้ว`);
    } else {
      await api.put("/api/settings", { rateCard: rates });
      flash("บันทึกเป็นราคากลาง (ใช้กับงานที่ไม่ระบุแบรนด์)");
    }
  };

  const actDerived = calcDerived(num(spend), Object.fromEntries(KPI_METRICS.map(({ k }) => [k, num(actual[k])])));
  const cell = "w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5 text-right focus:ring-2 focus:ring-indigo-500 outline-none tnum";
  const pct = (k) => (num(plan[k]) > 0 && num(actual[k]) != null ? (num(actual[k]) / num(plan[k])) * 100 : null);

  return (
    <Modal wide title={`KPI — ${task.title || "(ไม่มีชื่องาน)"}`} onClose={onClose}
      footer={<>
        <button onClick={onClose} className={btnGhost}>ยกเลิก</button>
        <button onClick={() => onSave(task, { plan, actual, spend: num(spend) })} className={btnPrimary}>บันทึก KPI</button>
      </>}>

      {/* ⚡ ตัวช่วยแพลน: งบ ÷ ราคาต่อผลลัพธ์ = เป้า */}
      <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="text-sm font-semibold text-indigo-900">วางแผนเป้าจากงบ
            <span className="font-normal text-indigo-700 tnum"> · งบ {fmtNum(planBudget)} บาท{task.feePercent > 0 ? ` (รวมฟี ${task.feePercent}%)` : ""}</span>
            {task.objective && <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">{task.objective}</span>}
          </div>
          {/* บอกชัดว่าราคาที่ใช้มาจากไหน */}
          <span className={"text-xs px-1.5 py-0.5 rounded font-medium " + (usingBrandRate ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600")}>
            {usingBrandRate ? `ราคาแบรนด์ ${task.brand ? task.brand.name : ""}` : "ราคากลาง"}
          </span>
        </div>
        {!rates ? <div className="text-xs text-slate-400">กำลังโหลดราคา...</div> : planBudget <= 0 ? (
          <div className="text-xs text-indigo-700">ใส่ "งบตามแผน" ในหน้าแก้ไขงานก่อน แล้วตัวช่วยจะคำนวณเป้าให้จากราคาต่อผลลัพธ์</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-2">
              {plannable.map((k) => {
                const def = KPI_METRICS.find((m) => m.k === k);
                const target = previewTarget(k);
                return (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-slate-600 shrink-0">{def.label}</span>
                    <span className="text-slate-400 shrink-0">฿</span>
                    <input type="number" step="any" value={rates[k] ?? ""} onChange={(e) => setRates({ ...rates, [k]: e.target.value })}
                      className="w-16 text-xs text-right border border-indigo-200 rounded-md px-1.5 py-1 bg-white tnum" />
                    <span className="text-slate-400 shrink-0">{def.per === 1000 ? "/1,000" : "/ผล"}</span>
                    <span className="ml-auto font-semibold text-indigo-800 tnum">→ {target != null ? target.toLocaleString() : "–"}</span>
                  </div>
                );
              })}
            </div>
            {/* เป้า ROAS -> เป้ายอดขาย = งบ × ROAS */}
            {wantsRevenue && (
              <div className="flex items-center gap-2 text-xs border-t border-indigo-100 pt-2 mb-2">
                <span className="w-20 text-slate-700 font-medium shrink-0">เป้า ROAS</span>
                <input type="number" step="any" value={rates.roas ?? ""} onChange={(e) => setRates({ ...rates, roas: e.target.value })}
                  className="w-16 text-xs text-right border border-indigo-200 rounded-md px-1.5 py-1 bg-white tnum" />
                <span className="text-slate-400 shrink-0">เท่า</span>
                <span className="ml-auto font-semibold text-indigo-800 tnum">→ ยอดขาย {targetRevenue() != null ? targetRevenue().toLocaleString() : "–"}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button onClick={applyPlan} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">ใส่เป้าตามนี้</button>
              <button onClick={saveRates} className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-100">{task.brandId ? `จำเป็นราคาแบรนด์นี้` : "จำเป็นราคากลาง"}</button>
            </div>
          </>
        )}
        {msg && <div className="text-xs text-emerald-700 mt-1.5">{msg}</div>}
      </div>

      {/* ตารางเป้า vs ผลจริง — ⭐ = เมตริกหลักของ obj นี้ */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-400">
            <th className="text-left py-1 font-medium">เมตริก</th>
            <th className="text-right py-1 font-medium w-24">เป้า</th>
            <th className="text-right py-1 font-medium w-24">ผลจริง</th>
            <th className="text-right py-1 font-medium w-14">%</th>
            <th className="text-right py-1 font-medium w-20">ราคา/ผลจริง</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-100 bg-slate-50">
            <td className="py-2 font-medium text-slate-700">งบ (บาท){task.feePercent > 0 ? <span className="text-[10px] text-slate-400 font-normal"> รวมฟี {task.feePercent}%</span> : null}</td>
            <td className="py-2 px-1 text-right text-slate-600 tnum">{fmtNum(planBudget)}</td>
            <td className="py-2 px-1"><input type="number" value={spend} onChange={(e) => setSpend(e.target.value)} className={cell} placeholder="ใช้จริง" /></td>
            <td className="py-2 text-right"><PctBadge value={planBudget > 0 && num(spend) != null ? (num(spend) / planBudget) * 100 : null} /></td>
            <td></td>
          </tr>
          {KPI_METRICS.map(({ k, label, cost, money }) => (
            <tr key={k} className={"border-t border-slate-100 " + (primary.includes(k) ? "bg-violet-50/50" : "")}>
              <td className="py-1.5 text-slate-700">{primary.includes(k) ? "" : ""}{label}</td>
              <td className="py-1.5 px-1"><input type="number" value={plan[k] ?? ""} onChange={(e) => sP(k, e.target.value)} className={cell} /></td>
              <td className="py-1.5 px-1"><input type="number" value={actual[k] ?? ""} onChange={(e) => sA(k, e.target.value)} className={cell} /></td>
              <td className="py-1.5 text-right"><PctBadge value={pct(k)} /></td>
              <td className="py-1.5 text-right text-xs text-slate-500 tnum">
                {money
                  ? (actDerived.roas != null ? <span className="font-semibold text-emerald-700">ROAS {actDerived.roas.toFixed(2)}</span> : "–")
                  : (actDerived[k] != null ? `${cost} ${fmtNum(actDerived[k])}` : "–")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* สรุปความคุ้มค่าเทียบกับงบที่ใช้จริง (โชว์เมื่อมีทั้งยอดขาย + เงินที่ใช้) */}
      {actDerived.roas != null && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-600 mb-2">ความคุ้มค่า (เทียบกับเงินที่ใช้จริง ฿{fmtNum(num(spend))})</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white rounded-lg border border-slate-200 p-2">
              <div className="text-[10px] text-slate-400">ยอดขาย</div>
              <div className="text-sm font-bold text-slate-700 tnum">฿{fmtNum(num(actual.revenue))}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2">
              <div className="text-[10px] text-slate-400">กำไร (ขาย − ใช้)</div>
              <div className={"text-sm font-bold tnum " + (actDerived.profit >= 0 ? "text-emerald-700" : "text-red-600")}>฿{fmtNum(Math.round(actDerived.profit))}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2">
              <div className="text-[10px] text-slate-400">ROAS{num(rates && rates.roas) > 0 ? <span className={actDerived.roas >= num(rates.roas) ? " text-emerald-600" : " text-red-500"}> {actDerived.roas >= num(rates.roas) ? "✓ ถึงเป้า" : "ต่ำกว่าเป้า"}</span> : null}</div>
              <div className="text-sm font-bold text-indigo-700 tnum">{actDerived.roas.toFixed(2)}x</div>
              {num(rates && rates.roas) > 0 && <div className="text-[10px] text-slate-400 tnum">เป้า {num(rates.roas)}x</div>}
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2">
              <div className="text-[10px] text-slate-400">ROI</div>
              <div className={"text-sm font-bold tnum px-1 rounded " + roiColor(actDerived.roi)}>{fmtRoi(actDerived.roi)}</div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2">เมตริกหลักของ objective นี้เน้นพื้นหลังสีม่วง · ทุกช่องไม่บังคับกรอก · ROAS = ยอดขาย ÷ เงินที่ใช้ (กี่เท่า) · ROI = (ยอดขาย − เงินที่ใช้) ÷ เงินที่ใช้ (กำไร %)</p>
    </Modal>
  );
}

// ---------- Brand modal ----------
const BRAND_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"];

function BrandModal({ brand, onSave, onClose }) {
  const [form, setForm] = useState({ color: BRAND_COLORS[0], ...brand });
  const [logoData, setLogoData] = useState("");     // รูปใหม่ที่เพิ่งเลือก (base64)
  const [logoRemove, setLogoRemove] = useState(false);
  const [logoErr, setLogoErr] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const preview = logoRemove ? "" : (logoData || form.logo || "");

  const pickLogo = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setLogoErr("");
    try {
      setLogoData(await fileToLogoData(file));
      setLogoRemove(false);
    } catch (err) {
      setLogoErr(err.message);
    }
    e.target.value = ""; // เลือกไฟล์เดิมซ้ำได้
  };

  const save = () => onSave({ ...form, logoData: logoData || undefined, logoRemove: logoRemove || undefined });

  return (
    <Modal title={brand.id ? "แก้ไขแบรนด์" : "เพิ่มแบรนด์"} onClose={onClose}
      footer={<>
        <button onClick={onClose} className={btnGhost}>ยกเลิก</button>
        <button onClick={save} className={btnPrimary}>บันทึก</button>
      </>}>
      <label className="text-xs text-slate-500 mb-1 block">ชื่อแบรนด์</label>
      <input value={form.name || ""} onChange={(e) => set("name", e.target.value)} className={inputCls + " mb-3"} placeholder="เช่น Thychef, Unif, Molle" />

      <label className="text-xs text-slate-500 mb-1 block">โลโก้แบรนด์ (ไม่บังคับ — PNG / JPG / WebP / SVG)</label>
      <div className="flex items-center gap-3 mb-3">
        {preview
          ? <img src={preview} alt="" className="w-14 h-14 rounded-full object-cover border border-slate-200 bg-white" />
          : <span className="w-14 h-14 rounded-full inline-flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: form.color }}>{(form.name || "?")[0].toUpperCase()}</span>}
        <div className="flex flex-col gap-1.5">
          <label className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm cursor-pointer hover:bg-slate-50 text-center">
            เลือกรูปโลโก้
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={pickLogo} className="hidden" />
          </label>
          {preview && <button onClick={() => { setLogoData(""); setLogoRemove(true); }} className="text-xs text-slate-400 hover:text-red-600">ลบโลโก้ (ใช้จุดสีแทน)</button>}
        </div>
      </div>
      {logoErr && <div className="text-xs text-red-600 mb-2">{logoErr}</div>}

      <label className="text-xs text-slate-500 mb-1 block">สีประจำแบรนด์ (ใช้ในปฏิทิน/กราฟ และตอนไม่มีโลโก้)</label>
      <div className="flex gap-2 mb-3 flex-wrap">
        {BRAND_COLORS.map((c) => (
          <button key={c} onClick={() => set("color", c)} className={"w-8 h-8 rounded-full border-2 " + (form.color === c ? "border-slate-800" : "border-transparent")} style={{ backgroundColor: c }} />
        ))}
      </div>
      <label className="text-xs text-slate-500 mb-1 block">หมายเหตุ (ถ้ามี)</label>
      <textarea value={form.note || ""} onChange={(e) => set("note", e.target.value)} className={inputCls} rows="2" />
    </Modal>
  );
}
