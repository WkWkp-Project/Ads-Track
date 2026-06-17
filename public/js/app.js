// public/js/app.js — คอมโพเนนต์หลัก
// โครงหน้า: วันนี้ / ปฏิทิน / รายการ+KPI / แบรนด์ / นำเข้า & ตั้งค่า (ไม่มีทางเข้าซ้ำ)

function App() {
  const [tasks, setTasks] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tab, setTab] = useState("today");
  const [brandFilter, setBrandFilter] = useState("");
  const [editing, setEditing] = useState(null);        // ฟอร์มข้อมูลงาน
  const [editingKpi, setEditingKpi] = useState(null);  // ฟอร์ม KPI
  const [editingBrand, setEditingBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = todayStr();

  const loadTasks = useCallback(() => api.get("/api/tasks").then(setTasks), []);
  const loadBrands = useCallback(() => api.get("/api/brands").then(setBrands), []);
  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadTasks(), loadBrands()]);
    setLoading(false);
  }, [loadTasks, loadBrands]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const viewTasks = brandFilter ? tasks.filter((t) => t.brandId === brandFilter) : tasks;
  const dueToday = viewTasks.filter((t) => urgency(t, today) === "today").length;
  const overdue = viewTasks.filter((t) => urgency(t, today) === "overdue").length;

  // ---- handlers ----
  const saveTask = async (data) => {
    if (data.id) await api.put("/api/tasks/" + data.id, data);
    else await api.post("/api/tasks", data);
    setEditing(null); loadTasks();
  };
  const saveKpi = async (task, kpi) => {
    await api.put("/api/tasks/" + task.id, { kpi });
    setEditingKpi(null); loadTasks();
  };
  const removeTask = async (id) => {
    if (!confirm("ลบงานนี้?")) return;
    await api.del("/api/tasks/" + id); loadTasks();
  };
  const quickStatus = async (t) => { await api.put("/api/tasks/" + t.id, { status: t.status }); loadTasks(); };
  const duplicateTask = async (id) => {
    const clone = await api.post("/api/tasks/" + id + "/duplicate");
    setEditing(clone);   // เปิดสำเนาให้แก้วันที่/ปรับต่อได้ทันที
    loadTasks();
  };
  const saveBrand = async (data) => {
    if (data.id) await api.put("/api/brands/" + data.id, data);
    else await api.post("/api/brands", data);
    setEditingBrand(null); loadBrands();
  };
  const removeBrand = async (id) => {
    if (!confirm("ลบแบรนด์นี้? (งานของแบรนด์จะยังอยู่ แต่กลายเป็น 'ไม่ระบุแบรนด์')")) return;
    await api.del("/api/brands/" + id); loadAll();
  };

  const TABS = [
    { id: "today", label: "วันนี้", short: "วันนี้", icon: "today", eyebrow: "งานที่ต้องยิง", badge: dueToday + overdue, urgent: dueToday + overdue > 0 },
    { id: "calendar", label: "ปฏิทิน", short: "ปฏิทิน", icon: "calendar", eyebrow: "ภาพรวมทั้งเดือน" },
    { id: "list", label: "รายการ & KPI", short: "รายการ", icon: "chart", eyebrow: "ผลลัพธ์ทุกงาน", badge: viewTasks.length },
    { id: "brands", label: "แบรนด์", short: "แบรนด์", icon: "tag", eyebrow: "ผลงานแยกแบรนด์" },
    { id: "settings", label: "ตั้งค่า", short: "ตั้งค่า", icon: "settings", eyebrow: "ระบบ & นำเข้าข้อมูล" },
  ];

  const taskHandlers = { onEdit: setEditing, onDelete: removeTask, onQuickStatus: quickStatus, onKpi: setEditingKpi };

  const currentTab = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header แบบ editorial: ขาวโปร่ง + wordmark ดำ + เส้น hairline + nav ดำคม */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-5">
          <div className="flex items-center justify-between gap-2 h-[60px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-zinc-950 text-white inline-flex items-center justify-center shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19V10M12 19V5M19 19v-6" /></svg>
              </span>
              <div className="min-w-0">
                {/* มือถือ: ชื่อหน้าปัจจุบัน / เดสก์ท็อป: wordmark */}
                <h1 className="display text-[18px] font-bold text-zinc-950 leading-5 truncate">
                  <span className="md:hidden">{currentTab.label}</span><span className="hidden md:inline">Ad&nbsp;Ops</span>
                </h1>
                <p className="text-[11px] text-zinc-400 leading-4 truncate hidden sm:block">{fmtThaiLong(today)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <BrandSwitcher brands={brands} value={brandFilter} onChange={setBrandFilter} />
              <button onClick={() => setEditing({ brandId: brandFilter })} className="inline-flex items-center gap-1 pl-2.5 pr-3 sm:pr-3.5 py-2 rounded-lg bg-zinc-950 text-white text-sm font-semibold hover:bg-zinc-800 active:bg-black whitespace-nowrap">
                <Icon name="plus" size={17} strokeWidth={2.4} /><span className="hidden sm:inline">เพิ่มงาน</span>
              </button>
            </div>
          </div>

          {/* แท็บบน — เฉพาะเดสก์ท็อป (มือถือใช้เมนูล่าง) · active = ดำ + เส้นใต้ดำ */}
          <nav className="hidden md:flex gap-7 -mb-px">
            {TABS.map((t) => {
              const on = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={"group inline-flex items-center gap-2 py-3 text-sm whitespace-nowrap border-b-2 " + (on ? "border-zinc-950 text-zinc-950 font-semibold" : "border-transparent text-zinc-400 hover:text-zinc-700 font-medium")}>
                  <Icon name={t.icon} size={17} strokeWidth={2} className={on ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"} />
                  {t.label}
                  {t.badge ? <span className={"px-1.5 py-0.5 rounded-full text-xs num " + (t.urgent ? "bg-red-500 text-white font-bold" : on ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500")}>{t.badge}</span> : null}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-28 md:pb-12">
      {/* หัวข้อหน้าใหญ่แบบนิตยสาร — ตัวอักษรเป็นพระเอก (line-height เผื่อสระบน-ล่างไทย) */}
      <div className="mb-6 sm:mb-8">
        <div className="eyebrow mb-3">{currentTab.eyebrow || "ภาพรวม"}</div>
        <h2 className="display text-[30px] sm:text-[40px] font-bold text-zinc-950 leading-[1.3]">{currentTab.label}</h2>
      </div>
      {/* แจ้งงานวันนี้เฉพาะตอนอยู่หน้าอื่น — หน้า "วันนี้" มีข้อมูลนี้อยู่แล้ว */}
      {(dueToday > 0 || overdue > 0) && tab !== "today" && (
        <div className="mb-5 rounded-2xl bg-red-50 border border-red-200/80 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 surface">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
          <div className="text-sm text-red-800 flex-1 min-w-[200px]">
            {dueToday > 0 && <span className="font-semibold tnum">วันนี้ต้องยิง {dueToday} งาน </span>}
            {overdue > 0 && <span className="font-semibold text-red-600 tnum">• เลยกำหนด {overdue} งาน</span>}
            {brandFilter && <span className="text-xs text-red-500"> (เฉพาะแบรนด์ที่เลือก)</span>}
          </div>
          <button onClick={() => setTab("today")} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700">ดูงานวันนี้ →</button>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-slate-400">กำลังโหลด...</div> : (
        <>
          {tab === "today" && <TodayView tasks={viewTasks} today={today} {...taskHandlers} />}
          {tab === "calendar" && <CalendarView tasks={viewTasks} today={today} onEdit={setEditing} onKpi={setEditingKpi} />}
          {tab === "list" && <ListView tasks={viewTasks} today={today} onEdit={setEditing} onDelete={removeTask} onKpi={setEditingKpi} onDuplicate={duplicateTask} />}
          {tab === "brands" && <BrandsView tasks={tasks} brands={brandFilter ? brands.filter((b) => b.id === brandFilter) : brands} showOrphan={!brandFilter} today={today} onAddBrand={() => setEditingBrand({})} onEditBrand={setEditingBrand} onDeleteBrand={removeBrand} />}
          {tab === "settings" && <SettingsView brands={brands} onDataChanged={() => { loadTasks(); loadBrands(); }} />}
        </>
      )}

      {editing && <TaskModal task={editing} brands={brands} onSave={saveTask} onClose={() => setEditing(null)} onDuplicate={duplicateTask} />}
      {editingKpi && <KpiModal task={editingKpi} onSave={saveKpi} onClose={() => setEditingKpi(null)} />}
      {editingBrand && <BrandModal brand={editingBrand} onSave={saveBrand} onClose={() => setEditingBrand(null)} />}
      </main>

      {/* เมนูล่าง — เฉพาะมือถือ: นิ้วโป้งกดถึงง่าย ติดล่างจอเสมอ */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-zinc-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex">
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); window.scrollTo({ top: 0 }); }}
                className={"relative flex-1 flex flex-col items-center gap-1 pt-2 pb-1.5 " + (on ? "text-zinc-950" : "text-zinc-400 active:text-zinc-600")}>
                {on && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-zinc-950" />}
                <span className="relative">
                  <Icon name={t.icon} size={23} strokeWidth={on ? 2.3 : 1.9} />
                  {t.badge ? <span className={"absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full text-[10px] font-bold leading-[15px] text-center num " + (t.urgent ? "bg-red-500 text-white" : "bg-zinc-900 text-white")}>{t.badge}</span> : null}
                </span>
                <span className="text-[10.5px] font-semibold leading-none">{t.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
