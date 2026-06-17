// public/js/views.js — หน้าจอแต่ละแท็บ (วันนี้ / ปฏิทิน / รายการ / แบรนด์)

// ---------- วันนี้ — โชว์เฉพาะลิสต์งานที่ต้องยิง ----------
function TodayView({ tasks, today, onEdit, onDelete, onQuickStatus, onKpi }) {
  const overdue = tasks.filter((t) => urgency(t, today) === "overdue").sort((a, b) => actionDate(a).localeCompare(actionDate(b)));
  const due = tasks.filter((t) => urgency(t, today) === "today");
  const soon = tasks.filter((t) => urgency(t, today) === "soon").sort((a, b) => actionDate(a).localeCompare(actionDate(b)));
  const props = { today, onEdit, onDelete, onQuickStatus, onKpi };

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <section>
          <h2 className="section-label text-red-700 mb-2.5 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-600" />เลยกำหนดแล้ว <span className="text-red-400 font-medium tnum">{overdue.length}</span></h2>
          <div className="grid md:grid-cols-2 gap-3">{overdue.map((t) => <TaskCard key={t.id} t={t} {...props} />)}</div>
        </section>
      )}

      {due.length > 0 && (
        <section>
          <h2 className="section-label text-slate-700 mb-2.5 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />ต้องยิงวันนี้ <span className="text-slate-400 font-medium tnum">{due.length}</span></h2>
          <div className="grid md:grid-cols-2 gap-3">{due.map((t) => <TaskCard key={t.id} t={t} {...props} />)}</div>
        </section>
      )}

      {soon.length > 0 && (
        <section>
          <h2 className="section-label text-slate-500 mb-2.5 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" />7 วันข้างหน้า <span className="text-slate-400 font-medium tnum">{soon.length}</span></h2>
          <div className="grid md:grid-cols-2 gap-3">{soon.map((t) => <TaskCard key={t.id} t={t} {...props} />)}</div>
        </section>
      )}
    </div>
  );
}

// ---------- ปฏิทิน (เห็นชื่องานในช่องวันเลย) ----------
function CalendarView({ tasks, today, onEdit, onKpi }) {
  const [cursor, setCursor] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const [y, m] = cursor.split("-").map(Number);
  const startPad = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();

  const byDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => { const a = actionDate(t); if (a) (map[a] = map[a] || []).push(t); });
    return map;
  }, [tasks]);

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);

  const move = (delta) => {
    let nm = m + delta, ny = y;
    if (nm < 1) { nm = 12; ny--; } if (nm > 12) { nm = 1; ny++; }
    setCursor(`${ny}-${String(nm).padStart(2, "0")}`);
  };

  /** ป้ายชื่องานในช่องวัน — จุดสีหน้าชื่อ = แบรนด์, พื้นชิป = ความด่วน */
  const chip = (t, d) => {
    const closed = isClosed(t);
    const late = !closed && d < today;
    const bg = closed ? "bg-slate-100 text-slate-400 line-through" : late ? "bg-red-100 text-red-800" : d === today ? "bg-red-50 text-red-900" : "bg-slate-100 text-slate-700";
    return (
      <div key={t.id} onClick={(e) => { e.stopPropagation(); onEdit(t); }}
        title={(t.brand ? t.brand.name + " · " : "") + t.title}
        className={"flex items-center gap-1 text-[10px] leading-tight rounded px-1 py-0.5 cursor-pointer hover:opacity-75 " + bg}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.brand ? t.brand.color : "#94a3b8" }} />
        {/* จอเล็กเหลือแค่จุดสี — แตะวันเพื่อดูรายละเอียดด้านล่าง */}
        <span className="truncate hidden sm:inline">{t.title || "(ไม่มีชื่อ)"}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => move(-1)} className="px-3 py-1 rounded hover:bg-slate-100 text-lg">‹</button>
          <span className="font-semibold">{THAI_MONTHS_FULL[m]} {y + 543}</span>
          <button onClick={() => move(1)} className="px-3 py-1 rounded hover:bg-slate-100 text-lg">›</button>
        </div>
        {/* หัววันตามธรรมเนียมไทย: อาทิตย์แดง เสาร์ม่วง */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
          {THAI_DOW.map((d, i) => (
            <div key={d} className={i === 0 ? "text-red-400 font-medium" : i === 6 ? "text-violet-400 font-medium" : "text-slate-400"}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const items = byDate[d] || [];
            const open = items.filter((t) => !isClosed(t));
            const isToday = d === today;
            let bg = "bg-slate-50 hover:bg-slate-100";
            if (open.length) bg = d < today ? "bg-red-50 hover:bg-red-100" : "bg-amber-50 hover:bg-amber-100";
            return (
              <div key={i} onClick={() => setSelected(d)}
                className={"min-h-[56px] sm:min-h-[92px] rounded-lg p-1 cursor-pointer flex flex-col gap-0.5 " + bg + (selected === d ? " ring-2 ring-indigo-500" : "")}>
                {isToday
                  ? <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold inline-flex items-center justify-center tnum">{+d.slice(8)}</span>
                  : <span className="text-xs px-0.5 text-slate-500 tnum">{+d.slice(8)}</span>}
                {items.slice(0, 3).map((t) => chip(t, d))}
                {items.length > 3 && <span className="text-[10px] text-slate-400 px-1">+{items.length - 3} งาน</span>}
              </div>
            );
          })}
        </div>
      </div>
      {/* รายละเอียดวันที่เลือก */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">{fmtThaiLong(selected)} — {(byDate[selected] || []).length} งาน</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {(byDate[selected] || []).map((t) => <TaskCard key={t.id} t={t} today={today} onEdit={onEdit} onKpi={onKpi} />)}
          {(byDate[selected] || []).length === 0 && <div className="text-sm text-slate-300 py-4">ไม่มีงานในวันนี้</div>}
        </div>
      </div>
    </div>
  );
}

// ---------- รายการ + KPI (ตารางรวม แผน vs จริง) ----------
function ListView({ tasks, today, onEdit, onDelete, onKpi, onDuplicate }) {
  const [q, setQ] = useState("");
  const [fChannel, setFChannel] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fObj, setFObj] = useState("");
  const channels = [...new Set(tasks.map((t) => t.channel).filter(Boolean))];
  const objectives = [...new Set([...OBJECTIVES, ...tasks.map((t) => t.objective).filter(Boolean)])];

  const filtered = tasks.filter((t) => {
    if (fChannel && t.channel !== fChannel) return false;
    if (fStatus && t.status !== fStatus) return false;
    if (fObj && t.objective !== fObj) return false;
    if (q) { const s = (t.title + " " + (t.brand ? t.brand.name : "") + " " + t.remark + " " + t.code).toLowerCase(); if (!s.includes(q.toLowerCase())) return false; }
    return true;
  }).sort((a, b) => actionDate(a).localeCompare(actionDate(b)));

  // คอลัมน์ผลลัพธ์จริง (ตามชีต: Impression/Reach/Interaction/Link Clicks/View)
  const RESULT_COLS = [
    { k: "impression", h: "Imp." },
    { k: "reach", h: "Reach" },
    { k: "engagement", h: "Eng." },
    { k: "click", h: "Link Click" },
    { k: "view", h: "View" },
  ];

  // ผลรวมท้ายตาราง (งบ + ผลลัพธ์จริงทุกเมตริก)
  const totals = filtered.reduce((acc, t) => {
    acc.budget += Number(t.budget) || 0;
    const { actual, spend } = getKpi(t);
    acc.spend += spend || 0;
    RESULT_COLS.forEach(({ k }) => { acc[k] = (acc[k] || 0) + (actual[k] || 0); });
    return acc;
  }, { budget: 0, spend: 0 });

  const sel = "text-sm border border-slate-300 rounded-lg px-2 py-1.5 bg-white";
  const num = "px-2 py-2 text-right text-zinc-700 whitespace-nowrap num";

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหา..." className={sel + " flex-1 min-w-[150px]"} />
        <select value={fChannel} onChange={(e) => setFChannel(e.target.value)} className={sel}><option value="">ทุกช่องทาง</option>{channels.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={fObj} onChange={(e) => setFObj(e.target.value)} className={sel}><option value="">ทุก Obj</option>{objectives.map((o) => <option key={o}>{o}</option>)}</select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className={sel}><option value="">ทุกสถานะ</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <button onClick={() => exportTasksCSV(filtered, `ad-ops-${today}.csv`)} disabled={filtered.length === 0}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 whitespace-nowrap">⬇ Export Excel</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto surface">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-2 py-2">วันยิง</th>
              <th className="text-left px-2 py-2">งาน</th>
              <th className="text-left px-2 py-2">Obj</th>
              <th className="text-left px-2 py-2">สถานะ</th>
              <th className="text-right px-2 py-2">งบแผน</th>
              <th className="text-right px-2 py-2">ใช้จริง</th>
              {RESULT_COLS.map((c) => <th key={c.k} className="text-right px-2 py-2 whitespace-nowrap">{c.h}</th>)}
              <th className="text-right px-2 py-2">% เป้า</th>
              <th className="text-right px-2 py-2">CPM</th>
              <th className="text-right px-2 py-2">CPC</th>
              <th className="text-right px-2 py-2">CPE</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const u = urgency(t, today);
              const rowBg = u === "overdue" ? "bg-red-50" : u === "today" ? "bg-amber-50" : "";
              const { actual, spend } = getKpi(t);
              const dv = calcDerived(spend, actual);
              return (
                <tr key={t.id} className={"border-t border-slate-100 hover:bg-slate-50 " + rowBg}>
                  <td className="px-2 py-2 whitespace-nowrap text-slate-600">{fmtThai(actionDate(t))}</td>
                  <td className="px-2 py-2 min-w-[160px]">
                    <div className="font-medium text-slate-800 flex items-center gap-1.5">
                      {t.brand && <BrandMark brand={t.brand} />}
                      <span className="truncate max-w-[220px]">{t.title || "-"}</span>
                    </div>
                    <div className="text-xs text-slate-400">{t.brand ? t.brand.name : ""}{t.channel ? " · " + t.channel : ""}</div>
                  </td>
                  <td className="px-2 py-2 text-slate-600 text-xs whitespace-nowrap">{t.objective}</td>
                  <td className="px-2 py-2"><span className={"text-xs px-2 py-0.5 rounded-md border whitespace-nowrap " + (STATUS_STYLE[t.status] || STATUS_STYLE["วางแผน"])}>{t.status}</span></td>
                  <td className={num}>{t.budget !== "" && t.budget != null ? Number(t.budget).toLocaleString() : "–"}</td>
                  <td className={num}>{fmtNum(spend)}</td>
                  {RESULT_COLS.map((c) => <td key={c.k} className={num}>{fmtNum(actual[c.k])}</td>)}
                  <td className="px-2 py-2 text-right"><PctBadge value={achievement(t)} /></td>
                  <td className={num}>{fmtNum(dv.cpm)}</td>
                  <td className={num}>{fmtNum(dv.cpc)}</td>
                  <td className={num}>{fmtNum(dv.cpe)}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-right">
                    <button onClick={() => onKpi(t)} className="text-xs text-violet-600 hover:text-violet-800 font-semibold mr-2">KPI</button>
                    <button onClick={() => onEdit(t)} className="text-xs text-slate-400 hover:text-indigo-600 mr-2">แก้</button>
                    {onDuplicate && <button onClick={() => onDuplicate(t.id)} title="ทำซ้ำงานนี้" className="text-xs text-slate-400 hover:text-indigo-600 mr-2">⧉</button>}
                    <button onClick={() => onDelete(t.id)} className="text-xs text-slate-400 hover:text-red-600">ลบ</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={11 + RESULT_COLS.length} className="text-center py-10 text-slate-300">ไม่มีข้อมูล</td></tr>}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-slate-50 font-semibold text-slate-700 text-xs">
              <tr>
                <td colSpan="4" className="px-2 py-2">รวม {filtered.length} งาน</td>
                <td className={num}>{totals.budget.toLocaleString()}</td>
                <td className={num}>{totals.spend.toLocaleString()}</td>
                {RESULT_COLS.map((c) => <td key={c.k} className={num}>{totals[c.k] ? totals[c.k].toLocaleString() : "–"}</td>)}
                <td colSpan="4"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ---------- แบรนด์ (สรุป KPI แผน vs จริง + เอกสารแนบ ต่อแบรนด์) ----------
function BrandsView({ tasks, brands, showOrphan, today, onAddBrand, onEditBrand, onDeleteBrand }) {
  const [attachments, setAttachments] = useState([]);
  const loadAtts = useCallback(() => api.get("/api/attachments").then(setAttachments), []);
  useEffect(() => { loadAtts(); }, [loadAtts]);

  const groups = brands.map((b) => ({ brand: b, items: tasks.filter((t) => t.brandId === b.id) }));
  if (showOrphan) {
    const orphan = tasks.filter((t) => !t.brandId || !brands.some((b) => b.id === t.brandId));
    if (orphan.length) groups.push({ brand: { id: "", name: "ไม่ระบุแบรนด์", color: "#94a3b8" }, items: orphan });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">แต่ละแบรนด์ทำอะไรอยู่ ยิง obj อะไร — แผน vs ผลจริง + เอกสารประจำแบรนด์</p>
        <button onClick={onAddBrand} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium">+ เพิ่มแบรนด์</button>
      </div>
      {groups.length === 0 ? <div className="text-center py-16 bg-white rounded-xl border text-slate-400">ยังไม่มีแบรนด์ — กด "เพิ่มแบรนด์" เพื่อเริ่ม</div> : (
        <div className={"grid gap-4 " + (brands.length === 1 ? "max-w-2xl" : "md:grid-cols-2")}>
          {groups.map(({ brand, items }) => (
            <BrandSummaryCard key={brand.id || "none"} brand={brand} items={items} today={today}
              attachments={attachments.filter((a) => a.brandId === brand.id)}
              onAttachmentsChanged={loadAtts}
              onEdit={onEditBrand} onDelete={onDeleteBrand} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- เอกสาร & ลิงก์ประจำแบรนด์ ----------
function AttachmentsPanel({ brandId, items, onChanged }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inp = "text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none";

  const flashErr = (m) => { setErr(m); setTimeout(() => setErr(""), 4000); };

  const addLink = async () => {
    if (!url.trim()) return flashErr("ใส่ลิงก์ก่อน");
    setBusy(true);
    const res = await api.post("/api/attachments", { brandId, name, url });
    setBusy(false);
    if (res.error) return flashErr(res.error);
    setName(""); setUrl(""); onChanged();
  };

  const pickFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return flashErr("ไฟล์ใหญ่เกิน 15MB");
    setBusy(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await api.post("/api/attachments", { brandId, name: file.name, fileData: reader.result });
      setBusy(false);
      if (res.error) return flashErr(res.error);
      onChanged();
    };
    reader.onerror = () => { setBusy(false); flashErr("อ่านไฟล์ไม่ได้"); };
    reader.readAsDataURL(file);
  };

  const remove = async (id) => {
    if (!confirm("ลบรายการนี้?")) return;
    await api.del("/api/attachments/" + id);
    onChanged();
  };

  const fmtSize = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");

  return (
    <div className="border-t border-slate-100 mt-3 pt-3">
      <div className="text-xs font-semibold text-slate-600 mb-2">เอกสาร & ลิงก์ <span className="text-slate-400 font-normal tnum">({items.length})</span></div>

      {items.length > 0 && (
        <ul className="space-y-1 mb-2">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-xs group">
              <span className="shrink-0">{a.type === "file" ? "" : ""}</span>
              <a href={a.url} target="_blank" className="text-indigo-600 hover:underline truncate flex-1 min-w-0" title={a.name}>{a.name}</a>
              {a.size != null && <span className="text-slate-400 shrink-0 tnum">{fmtSize(a.size)}</span>}
              <button onClick={() => remove(a.id)} className="text-slate-300 hover:text-red-600 shrink-0">ลบ</button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-1.5 items-center">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ (ไม่บังคับ)" className={inp + " w-28"} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="วางลิงก์ Drive / Sheet / Canva..." className={inp + " flex-1 min-w-[140px]"} />
        <button onClick={addLink} disabled={busy} className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 disabled:opacity-50">+ ลิงก์</button>
        <label className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer">
          {busy ? "กำลังอัป..." : "แนบไฟล์"}
          <input type="file" onChange={pickFile} className="hidden" disabled={busy} />
        </label>
      </div>
      {err && <div className="text-xs text-red-600 mt-1.5">{err}</div>}
    </div>
  );
}

function BrandSummaryCard({ brand, items, today, attachments, onAttachmentsChanged, onEdit, onDelete }) {
  const open = items.filter((t) => !isClosed(t));
  const dueToday = open.filter((t) => actionDate(t) === today).length;
  const overdue = open.filter((t) => { const a = actionDate(t); return a && a < today; }).length;

  // รวมงบ + KPI แผน vs จริง ทั้งแบรนด์ (รวมงานที่ปิดแล้วด้วย เพื่อเห็นผลงานสะสม)
  const zero = () => Object.fromEntries(KPI_METRICS.map(({ k }) => [k, 0]));
  const sum = items.reduce((acc, t) => {
    const { plan, actual, spend } = getKpi(t);
    acc.budget += totalWithFee(t);   // งบรวมค่าธรรมเนียม
    acc.spend += spend || 0;
    for (const { k } of KPI_METRICS) {
      acc.plan[k] += plan[k] || 0;
      acc.actual[k] += actual[k] || 0;
    }
    return acc;
  }, { budget: 0, spend: 0, plan: zero(), actual: zero() });
  // ROAS/ROI ทั้งแบรนด์ เทียบกับเงินที่ใช้จริงรวม
  const brandRoas = sum.spend > 0 && sum.actual.revenue > 0 ? sum.actual.revenue / sum.spend : null;
  const brandRoi = sum.spend > 0 && sum.actual.revenue > 0 ? ((sum.actual.revenue - sum.spend) / sum.spend) * 100 : null;

  const byObj = {};
  open.forEach((t) => { const o = t.objective || "ไม่ระบุ"; byObj[o] = (byObj[o] || 0) + 1; });

  const budgetPct = sum.budget > 0 ? (sum.spend / sum.budget) * 100 : null;
  const metricRows = KPI_METRICS.filter(({ k }) => sum.plan[k] > 0 || sum.actual[k] > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden surface surface-hover" style={{ borderTopColor: brand.color, borderTopWidth: 3 }}>
      {/* หัวการ์ดอาบสีแบรนด์จาง ๆ — เห็นปุ๊บรู้ว่าโซนของใคร */}
      <div className="flex items-start justify-between px-4 py-3" style={{ backgroundColor: brand.color + "14" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <BrandMark brand={brand} size="lg" />
          <span className="display font-bold text-zinc-950 text-[15px]">{brand.name}</span>
          <span className="text-xs text-zinc-500 num">{open.length} งานเปิดอยู่</span>
          {dueToday > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-red-600 text-white font-semibold num">วันนี้ {dueToday}</span>}
          {overdue > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 num">เลยกำหนด {overdue}</span>}
        </div>
        {brand.id && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onEdit(brand)} className="text-xs text-zinc-500 hover:text-zinc-900">แก้ไข</button>
            <button onClick={() => onDelete(brand.id)} className="text-xs text-zinc-500 hover:text-red-600">ลบ</button>
          </div>
        )}
      </div>
      <div className="p-4 pt-3">

      {/* งบ: ใช้จริง vs แผน + ROAS (ถ้ามียอดขาย) */}
      <div className="mb-3">
        <div className="flex justify-between items-center text-xs text-zinc-500 mb-1.5">
          <span className="num">ใช้ไป {sum.spend.toLocaleString()} / แผน {sum.budget.toLocaleString()} บาท</span>
          <div className="flex items-center gap-1.5">
            {brandRoas != null && <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-white font-bold num">ROAS {brandRoas.toFixed(2)}x</span>}
            {brandRoi != null && <span className={"px-1.5 py-0.5 rounded font-semibold num " + roiColor(brandRoi)}>ROI {fmtRoi(brandRoi)}</span>}
            <PctBadge value={budgetPct} />
          </div>
        </div>
        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: Math.min(100, budgetPct || 0) + "%", backgroundColor: brand.color }} />
        </div>
        {sum.actual.revenue > 0 && (
          <div className="text-xs text-zinc-500 mt-1 num">ยอดขายรวม ฿{sum.actual.revenue.toLocaleString()} · กำไร ฿{Math.round(sum.actual.revenue - sum.spend).toLocaleString()}</div>
        )}
      </div>

      {/* KPI แผน vs จริง */}
      {metricRows.length > 0 && (
        <table className="w-full text-xs mb-3 num">
          <thead><tr className="text-zinc-400"><th className="text-left font-semibold py-0.5">KPI</th><th className="text-right font-semibold">เป้า</th><th className="text-right font-semibold">จริง</th><th className="text-right font-semibold w-12">%</th></tr></thead>
          <tbody>
            {metricRows.map(({ k, label }) => (
              <tr key={k} className="border-t border-slate-50">
                <td className="py-1 text-slate-600">{label}</td>
                <td className="py-1 text-right text-slate-500">{fmtNum(sum.plan[k])}</td>
                <td className="py-1 text-right font-medium text-slate-700">{fmtNum(sum.actual[k])}</td>
                <td className="py-1 text-right"><PctBadge value={sum.plan[k] > 0 ? (sum.actual[k] / sum.plan[k]) * 100 : null} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(byObj).sort((a, b) => b[1] - a[1]).map(([obj, n]) => (
          <span key={obj} className="text-xs px-2 py-1 rounded-md bg-violet-50 text-violet-700 font-medium">{obj} · {n}</span>
        ))}
        {open.length === 0 && <span className="text-xs text-slate-300">ไม่มีงานเปิดอยู่</span>}
      </div>

      {/* เอกสาร & ลิงก์ของแบรนด์ (เฉพาะแบรนด์จริง ไม่รวมกลุ่ม "ไม่ระบุแบรนด์") */}
      {brand.id && <AttachmentsPanel brandId={brand.id} items={attachments || []} onChanged={onAttachmentsChanged} />}
      </div>
    </div>
  );
}
