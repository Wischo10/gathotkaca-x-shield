"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { Panel } from "@/components/ui/Panel";
import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  FileText,
  FileSearch,
  Users,
  Settings,
  Target,
  Search,
  X,
  Calendar,
  Pencil,
  MoreVertical,
  Info,
  Shield,
  ArrowDown,
  ArrowUp,
  Minus,
  Download,
  Printer,
  BarChart2
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip, XAxis, YAxis } from "recharts";

export default function ComplianceDashboardPage() {
  const openSidebar = useSidebarToggle();
  const [activeTab, setActiveTab] = useState("Compliance Overview");
  const [isRegulasiModalOpen, setIsRegulasiModalOpen] = useState(false);
  type ModalData = { title: string; headers: string[]; rows: string[][]; };
  const [activeModal, setActiveModal] = useState<ModalData | null>(null);

  useEffect(() => {
    const handleViewAllClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const anchor = target.closest("a");
      const td = target.closest("td");
      const button = target.closest("button");
      
      let isTriggered = false;
      let targetElement = null;

      if (anchor && anchor.getAttribute("href") === "#") {
        const text = anchor.innerText.toLowerCase();
        if (text.includes("view") || text.includes("lihat") || text.includes("detail")) {
          e.preventDefault();
          isTriggered = true;
          targetElement = anchor;
        }
      } else if (td && td.classList.contains("cursor-pointer") && td.classList.contains("hover:underline")) {
        isTriggered = true;
        targetElement = td;
      } else if (button) {
        const text = button.innerText.toLowerCase();
        if (text.includes("lihat detail")) {
          e.preventDefault();
          isTriggered = true;
          targetElement = button;
        }
      }

      if (isTriggered && targetElement) {
        const panel = targetElement.closest("section") || targetElement.closest(".bg-white") || targetElement.closest(".p-6");
        const titleEl = panel?.querySelector("h3, h2");
        let title = titleEl ? titleEl.innerHTML.replace(/<[^>]*>?/gm, '').trim() : "Detail Data";
        if (td) title += " - " + td.innerText;

        const tabName = document.querySelector(".text-brand-blue.bg-blue-50")?.textContent?.trim() || "";
        title += (tabName ? " | " + tabName : "");

        let headers: string[] = [];
        let rows: string[][] = [];

        const table = panel?.querySelector("table");
        if (table) {
          const ths = table.querySelectorAll("thead th");
          ths.forEach(th => headers.push(th.innerHTML));
          
          const trs = table.querySelectorAll("tbody tr");
          trs.forEach(tr => {
            const rowCells: string[] = [];
            tr.querySelectorAll("td").forEach(cell => rowCells.push(cell.innerHTML));
            if (rowCells.length > 0) rows.push(rowCells);
          });
        }

        // Fallback for non-table widgets
        if (headers.length === 0 || rows.length === 0) {
           if (title.includes("Fokus UU PDP") || (button && button.innerText.includes("UU PDP"))) {
             headers = ["Pasal / Ketentuan", "Prinsip UU PDP", "Persyaratan Kepatuhan", "Status Implementasi", "Bukti Evidens", "Rekomendasi"];
             rows = [
               ["<span class='font-semibold text-slate-800 dark:text-slate-200'>Pasal 20</span>", "Persetujuan", "Memperoleh persetujuan subjek data yang sah secara eksplisit", "<span class='text-[9px] font-medium px-2 py-0.5 rounded-full border text-emerald-600 border-emerald-200 bg-emerald-50'>Fully Compliant</span>", "Log Persetujuan (Database)", "-"],
               ["<span class='font-semibold text-slate-800 dark:text-slate-200'>Pasal 26</span>", "Tujuan Spesifik", "Pemrosesan data terbatas sesuai dengan tujuan awal saat pengumpulan", "<span class='text-[9px] font-medium px-2 py-0.5 rounded-full border text-emerald-600 border-emerald-200 bg-emerald-50'>Fully Compliant</span>", "Privacy Policy Document", "Tinjau rutin klausul pemrosesan"],
               ["<span class='font-semibold text-slate-800 dark:text-slate-200'>Pasal 33</span>", "Keamanan", "Melindungi data dari akses tidak sah dengan enkripsi dan kontrol akses", "<span class='text-[9px] font-medium px-2 py-0.5 rounded-full border text-amber-600 border-amber-200 bg-amber-50'>Partially Compliant</span>", "Laporan VAPT Tahunan", "<span class='text-brand-blue hover:underline cursor-pointer'>Perbaiki temuan IAM (High)</span>"],
               ["<span class='font-semibold text-slate-800 dark:text-slate-200'>Pasal 35</span>", "Notifikasi Breach", "Wajib melaporkan insiden kebocoran data dalam 3x24 jam", "<span class='text-[9px] font-medium px-2 py-0.5 rounded-full border text-emerald-600 border-emerald-200 bg-emerald-50'>Fully Compliant</span>", "Incident Response Plan v2", "Jadwalkan uji simulasi siber"],
               ["<span class='font-semibold text-slate-800 dark:text-slate-200'>Pasal 38</span>", "DPIA", "Kewajiban melakukan penilaian dampak perlindungan data pribadi (DPIA)", "<span class='text-[9px] font-medium px-2 py-0.5 rounded-full border text-red-500 border-red-200 bg-red-50'>Non-Compliant</span>", "Belum ada dokumen", "<span class='text-brand-blue hover:underline cursor-pointer'>Susun template DPIA</span>"]
             ];
           } else {
             headers = ["ID Referensi", "Keterangan", "Status", "Aksi"];
             rows = [
               ["<span class='font-semibold text-slate-800 dark:text-slate-200'>REF-1001</span>", `Detail informasi spesifik untuk widget: <strong>${title.split(' | ')[0]}</strong>`, "<span class='text-[9px] font-medium px-2 py-0.5 rounded-full border text-emerald-600 border-emerald-200 bg-emerald-50'>Aktif / Selesai</span>", "<button class='text-brand-blue font-medium hover:underline'>Tindak Lanjut</button>"],
               ["<span class='font-semibold text-slate-800 dark:text-slate-200'>REF-1002</span>", "Data terkait lainnya yang tidak tertampung di ringkasan", "<span class='text-[9px] font-medium px-2 py-0.5 rounded-full border text-amber-600 border-amber-200 bg-amber-50'>Dalam Proses</span>", "<button class='text-brand-blue font-medium hover:underline'>Tindak Lanjut</button>"]
             ];
           }
        }

        setActiveModal({ title, headers, rows });
      }
    };
    
    document.addEventListener("click", handleViewAllClick);
    return () => document.removeEventListener("click", handleViewAllClick);
  }, []);

  const tabs = [
    { name: "Compliance Overview", icon: ShieldCheck },
    { name: "Regulatory Tracking", icon: FileText },
    { name: "Audit & Assessment", icon: FileSearch },
    { name: "Policy Management", icon: FileText },
    { name: "Risk & Gap Analysis", icon: ShieldAlert },
    { name: "Reports", icon: FileText },
  ];

  // Dummy Data for charts
  const sparklineData1 = [{ v: 80 }, { v: 82 }, { v: 81 }, { v: 85 }, { v: 84 }, { v: 86 }, { v: 87.5 }];
  const sparklineData2 = [{ v: 55 }, { v: 55 }, { v: 56 }, { v: 56 }, { v: 57 }, { v: 58 }, { v: 58 }];
  const sparklineData3 = [{ v: 42 }, { v: 43 }, { v: 43 }, { v: 45 }, { v: 45 }, { v: 46 }, { v: 47 }];
  const sparklineData4 = [{ v: 8 }, { v: 7 }, { v: 7 }, { v: 6 }, { v: 7 }, { v: 6 }, { v: 6 }];
  const sparklineData5 = [{ v: 6 }, { v: 6 }, { v: 6 }, { v: 6 }, { v: 5 }, { v: 5 }, { v: 5 }];

  const donutData = [
    { name: 'Prioritas Tinggi', value: 1, color: '#ef4444' }, // red-500
    { name: 'Prioritas Sedang', value: 1, color: '#f59e0b' }, // amber-500
    { name: 'Prioritas Rendah', value: 0, color: '#3b82f6' }, // blue-500
    { name: 'Informational', value: 0, color: '#6366f1' },    // indigo-500
  ];

  const prinsipData = [
    { name: "1. Sah, Fair, dan Transparan", score: 95, current: 4, total: 4, status: "Compliant" },
    { name: "2. Terbatas dan Spesifik", score: 90, current: 3, total: 4, status: "Compliant" },
    { name: "3. Akurat, Lengkap, dan Terkini", score: 88, current: 3, total: 3, status: "Compliant" },
    { name: "4. Penyimpanan Terbatas", score: 85, current: 3, total: 4, status: "Partially Compliant" },
    { name: "5. Integritas dan Kerahasiaan", score: 96, current: 5, total: 5, status: "Compliant" },
    { name: "6. Akuntabilitas", score: 90, current: 5, total: 5, status: "Compliant" },
  ];

  const regulasiData = [
    { name: "UU PDP (Perlindungan Data Pribadi)", score: 92, status: "Compliant", icon: ShieldCheck },
    { name: "ISO 27001:2022", score: 84, status: "Compliant", icon: Settings },
    { name: "NIST Cybersecurity Framework", score: 86, status: "Compliant", icon: FileText },
    { name: "PCI DSS v4.0", score: 78, status: "Partially Compliant", icon: FileSearch },
    { name: "GDPR (Relevant for International)", score: 80, status: "Compliant", icon: FileText },
    { name: "UU ITE (Informasi & Transaksi Elektronik)", score: 88, status: "Compliant", icon: FileText },
  ];

  const gapAnalysisData = [
    { control: "2.2 Persetujuan", desc: "Persetujuan tidak terdokumentasi dengan baik", gap: "30%", dampak: "Tinggi", prioritas: "High", target: "May 29, 2025" },
    { control: "4.1 Batas Penyimpanan", desc: "Kebijakan retensi data belum optimal", gap: "20%", dampak: "Sedang", prioritas: "Medium", target: "Jun 05, 2025" },
    { control: "6.1 Penunjukan DPO", desc: "Dokumentasi peran DPO belum lengkap", gap: "15%", dampak: "Sedang", prioritas: "Medium", target: "Jun 12, 2025" },
    { control: "6.3 Pelaporan Pelanggaran", desc: "Prosedur pelaporan belum diuji secara rutin", gap: "10%", dampak: "Rendah", prioritas: "Low", target: "Jun 19, 2025" },
  ];

  const activitiesData = [
    { task: "Kebijakan Privasi diperbarui", owner: "Legal Team", date: "May 19, 2025 09:15 AM", status: "Completed", icon: FileText, color: "text-blue-500" },
    { task: "Assessment kontrol 2.2 Persetujuan", owner: "Compliance Team", date: "May 19, 2025 08:30 AM", status: "Completed", icon: ShieldCheck, color: "text-blue-500" },
    { task: "Gap analysis prinsip Penyimpanan Terbatas", owner: "Compliance Team", date: "May 18, 2025 04:45 PM", status: "In Progress", icon: AlertTriangle, color: "text-amber-500" },
    { task: "Review dokumentasi DPO", owner: "Compliance Team", date: "May 18, 2025 02:20 PM", status: "In Progress", icon: Users, color: "text-amber-500" },
    { task: "Training Awareness UU PDP", owner: "HR Team", date: "May 17, 2025 11:10 AM", status: "Open", icon: Users, color: "text-blue-500" },
  ];

  const recommendations = [
    { text: "Perkuat proses dokumentasi persetujuan subjek data", prioritas: "High", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
    { text: "Tinjau dan perbarui kebijakan retensi data", prioritas: "Medium", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { text: "Lakukan pengujian prosedur pelaporan pelanggaran", prioritas: "Low", icon: Settings, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { text: "Tingkatkan awareness karyawan terkait UU PDP", prioritas: "Low", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  ];

  const renderStatus = (status: string) => {
    switch(status) {
      case 'Compliant': return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Compliant</span>;
      case 'Partially Compliant': return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Partially Compliant</span>;
      case 'Completed': return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Completed</span>;
      case 'In Progress': return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">In Progress</span>;
      case 'Open': return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">Open</span>;
      case 'High': return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">High</span>;
      case 'Medium': return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Medium</span>;
      case 'Low': return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Low</span>;
      default: return <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">{status}</span>;
    }
  };

  return (
    <>
      <Topbar title="Regulatory & Security Compliance Dashboard" subtitle="Monitor compliance status, track regulatory requirements, and ensure security governance across your organization" onMenuClick={openSidebar} />
      
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 mb-6 gap-8 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.name} 
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors relative pb-3 pt-1 ${activeTab === tab.name ? "text-brand-blue" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
                {activeTab === tab.name && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>

        {activeTab === "Compliance Overview" ? (
          <div className="flex flex-col gap-6">
            
            {/* Top Row: Focus Score & Summary Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Compliance Score (Fokus UU PDP) */}
              <Panel className="lg:col-span-4 flex flex-col justify-between p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-6">Compliance Score (Fokus UU PDP)</h3>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center border-4 border-indigo-100 dark:border-indigo-800 shadow-inner">
                      <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-1">UU PDP (Perlindungan Data Pribadi)</div>
                      <div className="text-5xl font-bold text-indigo-700 dark:text-indigo-400 tracking-tight">92%</div>
                      <div className="flex items-center text-xs font-medium text-emerald-600 mt-2 gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>6% vs last 7 days</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-16">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Status</span>
                      <span className="text-xs font-semibold text-emerald-600">Compliant</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-16">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider mb-1 text-center leading-tight">Pemenuhan<br/>Kontrol</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">23 / 25</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-16">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Temuan</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">2</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-16">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider mb-1 text-center leading-tight">Prioritas<br/>Tinggi</span>
                      <span className="text-xs font-semibold text-red-600">1</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2.5 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors flex justify-center items-center gap-2">
                  Lihat Detail UU PDP <ArrowRight className="w-4 h-4" />
                </button>
              </Panel>

              {/* Ringkasan Compliance Keseluruhan */}
              <Panel className="lg:col-span-8 p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl flex flex-col">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-6">Ringkasan Compliance Keseluruhan</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                  
                  {/* Overall Score */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md text-indigo-600 dark:text-indigo-400"><ShieldCheck className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Overall Compliance Score</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">87.5%</div>
                    <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                      <TrendingUp className="w-3 h-3" /> <span>4.2% vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData1} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Total Requirements */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md text-blue-600 dark:text-blue-400"><FileText className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Total Requirements</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">58</div>
                    <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                      <TrendingUp className="w-3 h-3" /> <span>3 vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData2} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Compliant Requirements */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-md text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Compliant Requirements</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">47</div>
                    <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                      <TrendingUp className="w-3 h-3" /> <span>3 vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData3} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Non-Compliant */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-md text-red-600 dark:text-red-400"><AlertTriangle className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Non-Compliant</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">6</div>
                    <div className="flex items-center text-[10px] font-medium text-red-600 mb-4 gap-1">
                      <TrendingDown className="w-3 h-3" /> <span>1 vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData4} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pending Assessment */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md text-indigo-600 dark:text-indigo-400"><Clock className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Pending Assessment</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">5</div>
                    <div className="flex items-center text-[10px] font-medium text-amber-500 mb-4 gap-1">
                      <TrendingDown className="w-3 h-3" /> <span>1 vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData5} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </Panel>
            </div>

            {/* Middle Row: Kepatuhan Prinsip, Klasifikasi, Kepatuhan Framework */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Kepatuhan UU PDP per Prinsip */}
              <Panel className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Kepatuhan UU PDP per Prinsip</h3>
                  <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Prinsip UU PDP</th>
                        <th className="pb-3 font-medium text-center">Pemenuhan</th>
                        <th className="pb-3 font-medium text-center">Kontrol</th>
                        <th className="pb-3 font-medium text-center">Trend (7 hari)</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {prinsipData.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
                              <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]" title={item.name}>{item.name}</span>
                          </td>
                          <td className="py-3.5 text-center text-slate-600 dark:text-slate-400 font-medium text-xs">{item.score}%</td>
                          <td className="py-3.5 text-center text-slate-600 dark:text-slate-400 text-xs">{item.current}/{item.total}</td>
                          <td className="py-3.5 text-center w-16">
                            <div className="h-4 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={item.score > 89 ? sparklineData1 : sparklineData3}>
                                  <Line type="monotone" dataKey="v" stroke={item.score > 89 ? "#10b981" : "#f59e0b"} strokeWidth={1.5} dot={false} isAnimationActive={false}/>
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </td>
                          <td className="py-3.5 text-right">{renderStatus(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
                      <tr>
                        <td colSpan={2} className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200 text-xs">Rata-rata Kepatuhan UU PDP</td>
                        <td className="py-3.5 text-center font-bold text-slate-800 dark:text-slate-200 text-xs">92%</td>
                        <td className="py-3.5 text-center font-bold text-slate-800 dark:text-slate-200 text-xs">23/25</td>
                        <td className="py-3.5 text-right pr-2">{renderStatus("Compliant")}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Panel>

              {/* Klasifikasi Temuan UU PDP */}
              <Panel className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Klasifikasi Temuan UU PDP</h3>
                  <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="w-36 h-36 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={50}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">2</span>
                      <span className="text-[10px] text-slate-500 font-medium">Total Temuan</span>
                    </div>
                  </div>
                  <div className="flex-1 ml-6 space-y-3">
                    {donutData.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          {d.name}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {d.value} <span className="text-slate-400 font-normal">({d.value > 0 ? '50' : '0'}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Temuan Prioritas Tinggi Terbaru</h4>
                    <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                  </div>
                  <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-lg p-3.5 flex flex-col gap-2">
                    <div className="flex gap-3 items-start">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2">
                          Persetujuan Subjek Data Tidak Terdokumentasi
                          {renderStatus("High")}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Kontrol: 2.2 Persetujuan</div>
                        <div className="text-[11px] text-slate-500">Ditemukan: May 19, 2025 08:30 AM</div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-1">
                      <button className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-brand-blue transition-colors">
                        Tindak Lanjut
                      </button>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Kepatuhan per Regulasi / Framework */}
              <Panel className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Kepatuhan per Regulasi / Framework</h3>
                  <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Regulasi / Framework</th>
                        <th className="pb-3 font-medium text-center">Compliance Score</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {regulasiData.map((item, i) => {
                        const Icon = item.icon;
                        const isPrimary = i === 0;
                        return (
                          <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${isPrimary ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                            <td className="py-3.5 flex items-center gap-3">
                              <div className={`p-1.5 rounded-md ${isPrimary ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className={`font-medium truncate max-w-[180px] text-xs ${isPrimary ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`} title={item.name}>{item.name}</span>
                            </td>
                            <td className="py-3.5 text-center text-slate-600 dark:text-slate-400 font-semibold text-xs">{item.score}%</td>
                            <td className="py-3.5 text-right">{renderStatus(item.status)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Panel>

            </div>

            {/* Bottom Row: Gap Analysis, Activities, Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              
              {/* GAP Analysis */}
              <Panel className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">GAP Analysis UU PDP</h3>
                  <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Kontrol UU PDP</th>
                        <th className="pb-3 font-medium">Deskripsi</th>
                        <th className="pb-3 font-medium text-center">Gap</th>
                        <th className="pb-3 font-medium text-center">Dampak</th>
                        <th className="pb-3 font-medium text-center">Prioritas</th>
                        <th className="pb-3 font-medium text-right">Target Remediasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                      {gapAnalysisData.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.control}</td>
                          <td className="py-3 text-slate-500 max-w-[150px] truncate" title={item.desc}>{item.desc}</td>
                          <td className="py-3 text-center font-semibold text-slate-700 dark:text-slate-300">{item.gap}</td>
                          <td className="py-3 text-center text-slate-500">{item.dampak}</td>
                          <td className="py-3 text-center">{renderStatus(item.prioritas)}</td>
                          <td className="py-3 text-right text-slate-500 whitespace-nowrap font-medium">{item.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* Aktivitas Kepatuhan UU PDP Terbaru */}
              <Panel className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Aktivitas Kepatuhan UU PDP Terbaru</h3>
                  <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex-1 space-y-4">
                  {activitiesData.map((activity, i) => {
                    const Icon = activity.icon;
                    return (
                      <div key={i} className="flex items-start justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0">
                        <div className="flex gap-3 items-start">
                          <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 ${activity.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{activity.task}</div>
                            <div className="text-[11px] text-slate-500 mt-1">Oleh: {activity.owner}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {renderStatus(activity.status)}
                          <div className="text-[10px] text-slate-400 whitespace-nowrap mt-1">{activity.date}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>

              {/* Rekomendasi untuk Peningkatan Kepatuhan */}
              <Panel className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Rekomendasi untuk Peningkatan Kepatuhan</h3>
                  <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex-1 space-y-3.5">
                  {recommendations.map((rec, i) => {
                    const Icon = rec.icon;
                    return (
                      <div key={i} className={`p-3.5 rounded-lg border ${rec.bg.includes('red') ? 'border-red-100 dark:border-red-900/50' : rec.bg.includes('amber') ? 'border-amber-100 dark:border-amber-900/50' : rec.bg.includes('blue') ? 'border-blue-100 dark:border-blue-900/50' : 'border-emerald-100 dark:border-emerald-900/50'} ${rec.bg} flex gap-3.5 items-start`}>
                        <div className={`mt-0.5 ${rec.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">{rec.text}</div>
                          <div className="text-[11px] text-slate-500 mt-1.5">Prioritas: <span className={rec.color + " font-medium"}>{rec.prioritas}</span></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>

            </div>
            
            {/* Footer Text */}
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Data compliance diperbarui setiap 24 jam. Pastikan semua unit bisnis melengkapi assessment secara berkala untuk menjaga akurasi skor kepatuhan.
            </div>

          </div>
        ) : activeTab === "Regulatory Tracking" ? (
          <div className="flex flex-col gap-6">
            
            {/* Top Row: Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
              
              {/* Regulasi & Framework */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-start gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-tight">
                    Regulasi & Framework yang Dimonitor
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">
                  6
                </div>
                <div className="flex items-center text-[10px] font-medium mt-auto mb-1">
                  <button onClick={() => setIsRegulasiModalOpen(true)} className="text-brand-blue hover:underline inline-flex items-center gap-1">
                    View Detail <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
                  {/* Total Requirements */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400"><FileText className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Total Requirements</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">312</div>
                    <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                      <TrendingUp className="w-3 h-3" /> <span>5% vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData2} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Compliant */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Compliant</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1 flex items-baseline gap-1">241 <span className="text-sm font-medium text-slate-500">(77%)</span></div>
                    <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                      <TrendingUp className="w-3 h-3" /> <span>4% vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData1} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Partially Compliant */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-md text-amber-500 dark:text-amber-400"><AlertTriangle className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Partially Compliant</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1 flex items-baseline gap-1">43 <span className="text-sm font-medium text-slate-500">(14%)</span></div>
                    <div className="flex items-center text-[10px] font-medium text-amber-500 mb-4 gap-1">
                      <TrendingDown className="w-3 h-3" /> <span>1% vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData3} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Non-Compliant */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-md text-red-500 dark:text-red-400"><ShieldAlert className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Non-Compliant</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1 flex items-baseline gap-1">18 <span className="text-sm font-medium text-slate-500">(6%)</span></div>
                    <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                      <TrendingDown className="w-3 h-3" /> <span>1% vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData4} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Not Applicable */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400"><FileText className="w-4 h-4" /></div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Not Applicable</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1 flex items-baseline gap-1">10 <span className="text-sm font-medium text-slate-500">(3%)</span></div>
                    <div className="flex items-center text-[10px] font-medium text-slate-500 mb-4 gap-1">
                      <span>= vs last 7 days</span>
                    </div>
                    <div className="h-10 w-full mt-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData5} margin={{top:0,right:0,left:0,bottom:0}}>
                          <Line type="monotone" dataKey="v" stroke="#64748b" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Compliance Score per Regulasi / Framework */}
              <Panel className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-6">Compliance Score per Regulasi / Framework</h3>
                <div className="space-y-4">
                  {regulasiData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium w-1/3 truncate">{item.name}</span>
                      <div className="flex-1 mx-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${item.score}%` }}></div>
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 w-8 text-right">{item.score}%</span>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Trend Compliance Score (Rata-rata) */}
              <Panel className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Trend Compliance Score (Rata-rata)</h3>
                  <button className="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Last 7 Days v</button>
                </div>
                <div className="flex-1 w-full min-h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'May 13', value: 78 },
                      { name: 'May 14', value: 85 },
                      { name: 'May 15', value: 86 },
                      { name: 'May 16', value: 84 },
                      { name: 'May 17', value: 87 },
                      { name: 'May 18', value: 88 },
                      { name: 'May 19', value: 89 },
                    ]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: "#4f46e5" }} />
                      <Tooltip />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[9px] font-medium text-slate-500 inline-flex items-center gap-2 before:w-3 before:h-0.5 before:bg-indigo-600 before:inline-block">Rata-rata Compliance Score (%)</span>
                </div>
              </Panel>

              {/* Status Requirements */}
              <Panel className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Status Requirements</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex items-center gap-6 h-full">
                  <div className="w-36 h-36 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Compliant', value: 241, color: '#10b981' },
                            { name: 'Partially Compliant', value: 43, color: '#f59e0b' },
                            { name: 'Non-Compliant', value: 18, color: '#ef4444' },
                            { name: 'Not Applicable', value: 10, color: '#94a3b8' },
                          ]}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {[
                            { name: 'Compliant', value: 241, color: '#10b981' },
                            { name: 'Partially Compliant', value: 43, color: '#f59e0b' },
                            { name: 'Non-Compliant', value: 18, color: '#ef4444' },
                            { name: 'Not Applicable', value: 10, color: '#94a3b8' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">312</span>
                      <span className="text-[10px] text-slate-500 font-medium">Total</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-slate-700 dark:text-slate-300 font-medium">Compliant</span></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">241 <span className="text-slate-400 font-normal">(77%)</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-slate-700 dark:text-slate-300 font-medium">Partially Compliant</span></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">43 <span className="text-slate-400 font-normal">(14%)</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-slate-700 dark:text-slate-300 font-medium">Non-Compliant</span></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">18 <span className="text-slate-400 font-normal">(6%)</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div><span className="text-slate-700 dark:text-slate-300 font-medium">Not Applicable</span></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">10 <span className="text-slate-400 font-normal">(3%)</span></span>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Bottom Row: Detail Requirements Table */}
            <Panel className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Detail Requirements by Regulasi / Framework</h3>
                <div className="flex items-center gap-4">
                  <button className="text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-2">All Regulasi / Framework v</button>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search requirement, control, or article..." className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md w-72 focus:outline-none focus:ring-1 focus:ring-brand-blue text-slate-700 dark:text-slate-300" />
                  </div>
                  <a href="#" className="text-[11px] font-medium text-brand-blue hover:underline ml-2">View All</a>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="pb-3 font-medium">Regulasi / Framework</th>
                      <th className="pb-3 font-medium">Requirement / Control</th>
                      <th className="pb-3 font-medium">Deskripsi</th>
                      <th className="pb-3 font-medium text-center">Severity</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                      <th className="pb-3 font-medium">Compliance Score</th>
                      <th className="pb-3 font-medium">Due Date</th>
                      <th className="pb-3 font-medium">Business Unit</th>
                      <th className="pb-3 font-medium">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {[
                      { reg: "UU PDP (Perlindungan Data Pribadi)", req: "Pasal 20", desc: "Persetujuan Subjek Data Pribadi", sev: "High", status: "Compliant", score: 100, due: "May 29, 2025", bu: "IT, Legal", updated: "May 19, 2025 09:15 AM" },
                      { reg: "UU PDP (Perlindungan Data Pribadi)", req: "Pasal 33", desc: "Keamanan Data Pribadi", sev: "High", status: "Partially Compliant", score: 60, due: "Jun 05, 2025", bu: "IT Security", updated: "May 19, 2025 08:30 AM" },
                      { reg: "UU PDP (Perlindungan Data Pribadi)", req: "Pasal 35", desc: "Pemberitahuan Pelanggaran Data", sev: "High", status: "Compliant", score: 90, due: "Jun 12, 2025", bu: "IT Security", updated: "May 19, 2025 08:45 AM" },
                      { reg: "ISO 27001:2022", req: "A.5 Information Security Policies", desc: "Kebijakan keamanan informasi", sev: "High", status: "Compliant", score: 100, due: "May 22, 2025", bu: "IT Security", updated: "May 19, 2025 09:10 AM" },
                      { reg: "ISO 27001:2022", req: "A.8 Asset Management", desc: "Manajemen aset informasi", sev: "Medium", status: "Partially Compliant", score: 70, due: "May 23, 2025", bu: "IT Operations", updated: "May 19, 2025 08:20 AM" },
                      { reg: "NIST CSF", req: "ID.AM-1", desc: "Inventarisasi aset", sev: "Medium", status: "Compliant", score: 85, due: "May 24, 2025", bu: "IT Operations", updated: "May 19, 2025 07:55 AM" },
                      { reg: "PCI DSS v4.0", req: "Req 8", desc: "Identifikasi & autentikasi akses", sev: "High", status: "Partially Compliant", score: 65, due: "Jun 02, 2025", bu: "IT Security", updated: "May 19, 2025 08:10 AM" },
                      { reg: "UU ITE", req: "Pasal 26", desc: "Perlindungan sistem elektronik", sev: "Medium", status: "Compliant", score: 90, due: "May 30, 2025", bu: "IT Security", updated: "May 19, 2025 08:05 AM" },
                      { reg: "GDPR", req: "Article 32", desc: "Keamanan pemrosesan data", sev: "High", status: "Partially Compliant", score: 60, due: "Jun 10, 2025", bu: "IT Security", updated: "May 19, 2025 07:40 AM" },
                      { reg: "GDPR", req: "Article 33", desc: "Notifikasi pelanggaran data", sev: "High", status: "Compliant", score: 95, due: "Jun 11, 2025", bu: "IT Security", updated: "May 19, 2025 07:30 AM" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-300">{row.reg}</td>
                        <td className="py-3.5 font-medium text-slate-600 dark:text-slate-400">{row.req}</td>
                        <td className="py-3.5 text-slate-500">{row.desc}</td>
                        <td className="py-3.5 text-center">{renderStatus(row.sev)}</td>
                        <td className="py-3.5 text-center">{renderStatus(row.status)}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-blue rounded-full" style={{ width: `${row.score}%` }}></div>
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 w-8">{row.score}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500 font-medium">{row.due}</td>
                        <td className="py-3.5 text-slate-500 font-medium">{row.bu}</td>
                        <td className="py-3.5 text-slate-500 whitespace-nowrap">{row.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-5 text-xs text-slate-500 font-medium">
                <div>Showing 1 to 10 of 312 entries</div>
                <div className="flex items-center gap-1">
                  <button className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">&laquo;</button>
                  <button className="px-2.5 py-1.5 bg-brand-blue text-white rounded-md shadow-sm">1</button>
                  <button className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">2</button>
                  <button className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">3</button>
                  <button className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">4</button>
                  <button className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">5</button>
                  <button className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">&raquo;</button>
                </div>
              </div>
            </Panel>
            
          </div>
        ) : activeTab === "Audit & Assessment" ? (
          <div className="flex flex-col gap-6">
            
            {/* Top Row: Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
              {/* Total Audit & Assessment */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400"><FileSearch className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Total Audit & Assessment</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">24</div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>20% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData2} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400"><CheckCircle2 className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Completed</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1 flex items-baseline gap-1">11 <span className="text-sm font-medium text-slate-500">(46%)</span></div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>15% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData1} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* In Progress */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400"><Clock className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">In Progress</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1 flex items-baseline gap-1">9 <span className="text-sm font-medium text-slate-500">(37%)</span></div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>13% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData3} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Planned */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-md text-amber-500 dark:text-amber-400"><Calendar className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Planned</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1 flex items-baseline gap-1">3 <span className="text-sm font-medium text-slate-500">(12%)</span></div>
                <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                  <TrendingDown className="w-3 h-3" /> <span>14% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData5} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Overdue */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-md text-red-500 dark:text-red-400"><AlertTriangle className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Overdue</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1 flex items-baseline gap-1">1 <span className="text-sm font-medium text-slate-500">(4%)</span></div>
                <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                  <TrendingDown className="w-3 h-3" /> <span>50% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData4} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Overall Audit Score */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400"><ShieldCheck className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Overall Audit Score</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">86.8%</div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>4.2% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData1} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Second Row: 4 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Status by Type */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Audit & Assessment Status by Type</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex flex-col items-center gap-4 h-full">
                  <div className="w-32 h-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Internal Audit', value: 10, color: '#3b82f6' },
                            { name: 'External Audit', value: 6, color: '#10b981' },
                            { name: 'Compliance Assessment', value: 5, color: '#f59e0b' },
                            { name: 'Vulnerability Assessment', value: 3, color: '#ef4444' },
                          ]}
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {[
                            { name: 'Internal Audit', value: 10, color: '#3b82f6' },
                            { name: 'External Audit', value: 6, color: '#10b981' },
                            { name: 'Compliance Assessment', value: 5, color: '#f59e0b' },
                            { name: 'Vulnerability Assessment', value: 3, color: '#ef4444' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-slate-800 dark:text-slate-100">24</span>
                      <span className="text-[10px] text-slate-500 font-medium">Total</span>
                    </div>
                  </div>
                  <div className="w-full space-y-2.5 text-xs mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div><span className="text-slate-700 dark:text-slate-300 font-medium">Internal Audit</span></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">10 <span className="text-slate-400 font-normal">(42%)</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-slate-700 dark:text-slate-300 font-medium">External Audit</span></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">6 <span className="text-slate-400 font-normal">(25%)</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-slate-700 dark:text-slate-300 font-medium">Compliance Assessment</span></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">5 <span className="text-slate-400 font-normal">(21%)</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-slate-700 dark:text-slate-300 font-medium">Vulnerability Assessment</span></div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">3 <span className="text-slate-400 font-normal">(12%)</span></span>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Trend */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Audit & Assessment Trend</h3>
                  <button className="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Last 7 Days v</button>
                </div>
                <div className="flex-1 w-full min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'May 13', Completed: 10, InProgress: 21, Overdue: 2 },
                      { name: 'May 14', Completed: 11, InProgress: 22, Overdue: 2 },
                      { name: 'May 15', Completed: 12, InProgress: 23, Overdue: 2 },
                      { name: 'May 16', Completed: 11, InProgress: 22, Overdue: 1 },
                      { name: 'May 17', Completed: 10, InProgress: 20, Overdue: 1 },
                      { name: 'May 18', Completed: 11, InProgress: 21, Overdue: 1 },
                      { name: 'May 19', Completed: 11, InProgress: 22, Overdue: 1 },
                    ]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <Line type="monotone" dataKey="InProgress" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="Overdue" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                      <Tooltip />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <span className="text-[9px] font-medium text-slate-500 inline-flex items-center gap-1.5 before:w-2 before:h-2 before:rounded-full before:bg-emerald-500 before:inline-block">Completed</span>
                  <span className="text-[9px] font-medium text-slate-500 inline-flex items-center gap-1.5 before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:inline-block">In Progress</span>
                  <span className="text-[9px] font-medium text-slate-500 inline-flex items-center gap-1.5 before:w-2 before:h-2 before:rounded-full before:bg-red-500 before:inline-block">Overdue</span>
                </div>
              </Panel>

              {/* Findings Summary */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6">Audit Findings Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md"><Target className="w-3.5 h-3.5" /></div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Total Findings</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">78</span>
                  </div>
                  <div className="flex justify-between items-center text-xs px-1">
                    <div className="flex items-center gap-2 text-red-500"><AlertTriangle className="w-3.5 h-3.5" /><span className="font-medium">High Severity</span></div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">18 <span className="text-slate-400 font-normal">(23%)</span></span>
                  </div>
                  <div className="flex justify-between items-center text-xs px-1">
                    <div className="flex items-center gap-2 text-amber-500"><AlertTriangle className="w-3.5 h-3.5" /><span className="font-medium">Medium Severity</span></div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">32 <span className="text-slate-400 font-normal">(41%)</span></span>
                  </div>
                  <div className="flex justify-between items-center text-xs px-1">
                    <div className="flex items-center gap-2 text-blue-500"><AlertTriangle className="w-3.5 h-3.5" /><span className="font-medium">Low Severity</span></div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">28 <span className="text-slate-400 font-normal">(36%)</span></span>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                  <div className="flex justify-between items-center text-xs px-1">
                    <div className="flex items-center gap-2 text-slate-500"><CheckCircle2 className="w-3.5 h-3.5" /><span className="font-medium">Closed Findings</span></div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">40 <span className="text-slate-400 font-normal">(51%)</span></span>
                  </div>
                  <div className="flex justify-between items-center text-xs px-1">
                    <div className="flex items-center gap-2 text-emerald-500"><Target className="w-3.5 h-3.5" /><span className="font-medium">Open Findings</span></div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">38 <span className="text-slate-400 font-normal">(49%)</span></span>
                  </div>
                </div>
              </Panel>

              {/* Top Areas */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Top Areas with Findings</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="grid grid-cols-[1fr,auto,2fr] gap-x-4 gap-y-4 text-xs items-center">
                  <div className="text-slate-500 font-medium mb-1 col-span-2">Area</div>
                  <div className="text-slate-500 font-medium mb-1 text-right">Open Findings</div>
                  
                  <div className="text-slate-700 dark:text-slate-300 font-medium truncate">Data Privacy (UU PDP)</div>
                  <div className="text-red-500 font-bold">16</div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{width: '80%'}}></div></div>
                  
                  <div className="text-slate-700 dark:text-slate-300 font-medium truncate">Access Control</div>
                  <div className="text-amber-500 font-bold">12</div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{width: '60%'}}></div></div>
                  
                  <div className="text-slate-700 dark:text-slate-300 font-medium truncate">Data Retention</div>
                  <div className="text-amber-500 font-bold">10</div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{width: '50%'}}></div></div>
                  
                  <div className="text-slate-700 dark:text-slate-300 font-medium truncate">Third Party Management</div>
                  <div className="text-emerald-500 font-bold">8</div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '40%'}}></div></div>
                  
                  <div className="text-slate-700 dark:text-slate-300 font-medium truncate">Incident Response</div>
                  <div className="text-blue-500 font-bold">7</div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width: '35%'}}></div></div>
                </div>
              </Panel>

            </div>

            {/* Third Row: Upcoming / Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6">Upcoming & In Progress Assessments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Assessment</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Standard / Regulasi</th>
                        <th className="pb-3 font-medium">Owner</th>
                        <th className="pb-3 font-medium">Due Date</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                        <th className="pb-3 font-medium">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "Internal Audit Q2 2025", type: "Internal Audit", std: "Internal Control Framework", owner: "IT Audit Team", due: "May 22, 2025", status: "In Progress", prog: 60 },
                        { name: "UU PDP Compliance Assessment", type: "Compliance Assessment", std: "UU PDP", owner: "Compliance Team", due: "May 30, 2025", status: "In Progress", prog: 75 },
                        { name: "ISO 27001:2022 Surveillance Audit", type: "External Audit", std: "ISO 27001:2022", owner: "IT Security", due: "Jun 05, 2025", status: "Planned", prog: 0 },
                        { name: "Data Privacy Impact Assessment", type: "Compliance Assessment", std: "UU PDP", owner: "Legal & Compliance", due: "Jun 12, 2025", status: "Planned", prog: 0 },
                        { name: "PCI DSS v4.0 Assessment", type: "Compliance Assessment", std: "PCI DSS v4.0", owner: "IT Security", due: "Jun 20, 2025", status: "Planned", prog: 0 },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{row.name}</td>
                          <td className="py-3 font-medium text-slate-600 dark:text-slate-400">{row.type}</td>
                          <td className="py-3 text-slate-500">{row.std}</td>
                          <td className="py-3 text-slate-500">{row.owner}</td>
                          <td className="py-3 text-slate-500 font-medium">{row.due}</td>
                          <td className="py-3 text-center">{renderStatus(row.status)}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700 dark:text-slate-300 w-6 text-right">{row.prog}%</span>
                              <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${row.prog > 0 ? 'bg-brand-blue' : 'bg-slate-300 dark:bg-slate-600'}`} style={{ width: `${Math.max(row.prog, 10)}%` }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4"><a href="#" className="text-xs font-semibold text-brand-blue hover:underline">View All Assessments →</a></div>
              </Panel>

              {/* Recent Completed */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6">Recent Completed Assessments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Assessment</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Standard / Regulasi</th>
                        <th className="pb-3 font-medium">Completed Date</th>
                        <th className="pb-3 font-medium text-center">Score</th>
                        <th className="pb-3 font-medium text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "Vulnerability Assessment - Q1 2025", type: "Vulnerability Assessment", std: "Internal Standard", date: "May 18, 2025", score: "22%", res: "Pass" },
                        { name: "Internal Audit Q1 2025", type: "Internal Audit", std: "Internal Control Framework", date: "May 10, 2025", score: "88%", res: "Pass" },
                        { name: "ISO 27001:2022 Internal Audit", type: "Internal Audit", std: "ISO 27001:2022", date: "May 03, 2025", score: "90%", res: "Pass" },
                        { name: "Third Party Security Assessment", type: "Compliance Assessment", std: "Third Party Management", date: "Apr 28, 2025", score: "85%", res: "Pass" },
                        { name: "Awareness & Training Effectiveness Review", type: "Compliance Assessment", std: "Internal Standard", date: "Apr 25, 2025", score: "78%", res: "Pass" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{row.name}</td>
                          <td className="py-3 font-medium text-slate-600 dark:text-slate-400">{row.type}</td>
                          <td className="py-3 text-slate-500">{row.std}</td>
                          <td className="py-3 text-slate-500 font-medium">{row.date}</td>
                          <td className="py-3 text-center"><span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{row.score}</span></td>
                          <td className="py-3 text-center"><span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">{row.res}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4"><a href="#" className="text-xs font-semibold text-brand-blue hover:underline">View All Completed →</a></div>
              </Panel>
            </div>

            {/* Fourth Row */}
            <div className="grid grid-cols-1 lg:grid-cols-[2.5fr,1fr] gap-6">
              {/* High Priority Findings */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6">High Priority Findings Requiring Action</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Finding ID</th>
                        <th className="pb-3 font-medium">Assessment</th>
                        <th className="pb-3 font-medium">Regulasi / Framework</th>
                        <th className="pb-3 font-medium">Area</th>
                        <th className="pb-3 font-medium text-center">Severity</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                        <th className="pb-3 font-medium">Assigned To</th>
                        <th className="pb-3 font-medium">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { id: "FIND-2025-045", ass: "UU PDP Compliance Assessment", reg: "UU PDP", area: "Persetujuan Subjek Data", sev: "High", status: "Open", assign: "Compliance Team", due: "May 24, 2025" },
                        { id: "FIND-2025-038", ass: "Internal Audit Q1 2025", reg: "Internal Control Framework", area: "Akses Berlebih", sev: "High", status: "Open", assign: "IT Security", due: "May 23, 2025" },
                        { id: "FIND-2025-029", ass: "ISO 27001:2022 Internal Audit", reg: "ISO 27001:2022", area: "Manajemen Kerentanan", sev: "High", status: "In Progress", assign: "IT Security", due: "May 22, 2025" },
                        { id: "FIND-2025-012", ass: "External Penetration Test", reg: "Internal Standard", area: "Keamanan Aplikasi Web", sev: "High", status: "In Progress", assign: "SOC Team", due: "May 25, 2025" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{row.id}</td>
                          <td className="py-3 font-medium text-slate-600 dark:text-slate-400">{row.ass}</td>
                          <td className="py-3 text-slate-500">{row.reg}</td>
                          <td className="py-3 text-slate-500">{row.area}</td>
                          <td className="py-3 text-center">{renderStatus(row.sev)}</td>
                          <td className="py-3 text-center">{renderStatus(row.status)}</td>
                          <td className="py-3 font-medium text-slate-600 dark:text-slate-400">{row.assign}</td>
                          <td className="py-3 font-medium text-slate-500">{row.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* Assessment Calendar */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Assessment Calendar <span className="text-slate-400 font-normal text-[10px]">(Next 30 Days)</span></h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View Calendar</a>
                </div>
                <div className="space-y-4">
                  {[
                    { date: "MAY 22", title: "Internal Audit Q2 2025", type: "Internal Audit", status: "In Progress" },
                    { date: "MAY 30", title: "UU PDP Compliance Assessment", type: "Compliance Assessment", status: "In Progress" },
                    { date: "JUN 05", title: "ISO 27001:2022 Surveillance Audit", type: "External Audit", status: "Planned" },
                    { date: "JUN 12", title: "Data Privacy Impact Assessment", type: "Compliance Assessment", status: "Planned" },
                  ].map((evt, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800/50">
                      <div className="flex flex-col items-center justify-center min-w-10">
                        <span className="text-[9px] font-bold text-brand-blue uppercase tracking-wider">{evt.date.split(' ')[0]}</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{evt.date.split(' ')[1]}</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{evt.title}</span>
                        <span className="text-[10px] text-slate-500 truncate">{evt.type}</span>
                      </div>
                      <div className="flex items-center shrink-0">
                        {renderStatus(evt.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

          </div>
        ) : activeTab === "Policy Management" ? (
          <div className="flex flex-col gap-6">
            
            {/* Top Row: Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
              {/* Total Kebijakan */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400"><FileText className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Total Kebijakan</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">128</div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>8% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData1} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Kebijakan Aktif */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400"><CheckCircle2 className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Kebijakan Aktif</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">102</div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>6% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData2} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dalam Review */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400"><Pencil className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Dalam Review</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">15</div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>25% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData3} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Akan Kedaluwarsa */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-md text-amber-500 dark:text-amber-400"><Clock className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Akan Kedaluwarsa <span className="font-normal">(≤ 30 hari)</span></span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">7</div>
                <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                  <TrendingDown className="w-3 h-3" /> <span>22% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData5} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Kedaluwarsa */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-md text-red-500 dark:text-red-400"><AlertTriangle className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Kedaluwarsa</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">4</div>
                <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                  <TrendingDown className="w-3 h-3" /> <span>33% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData4} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tingkat Kepatuhan Kebijakan */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400"><Shield className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Tingkat Kepatuhan Kebijakan</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">92%</div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>3% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData1} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Second Row: 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribusi Kebijakan per Kategori */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Distribusi Kebijakan per Kategori</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex items-center gap-6 h-[180px]">
                  <div className="w-36 h-36 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Keamanan Informasi', value: 36, color: '#3b82f6' },
                            { name: 'Perlindungan Data Pribadi', value: 28, color: '#f59e0b' },
                            { name: 'Akses & Kontrol', value: 20, color: '#10b981' },
                            { name: 'Operasional & TI', value: 18, color: '#ef4444' },
                            { name: 'Kepatuhan & Regulasi', value: 14, color: '#f43f5e' },
                            { name: 'Lainnya', value: 12, color: '#94a3b8' },
                          ]}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {[
                            { name: 'Keamanan Informasi', value: 36, color: '#3b82f6' },
                            { name: 'Perlindungan Data Pribadi', value: 28, color: '#f59e0b' },
                            { name: 'Akses & Kontrol', value: 20, color: '#10b981' },
                            { name: 'Operasional & TI', value: 18, color: '#ef4444' },
                            { name: 'Kepatuhan & Regulasi', value: 14, color: '#f43f5e' },
                            { name: 'Lainnya', value: 12, color: '#94a3b8' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-slate-800 dark:text-slate-100">128</span>
                      <span className="text-[10px] text-slate-500 font-medium">Total</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-xs">
                    {[
                      { label: "Keamanan Informasi", val: 36, pct: "28%", color: "bg-blue-500" },
                      { label: "Perlindungan Data Pribadi", val: 28, pct: "22%", color: "bg-amber-500" },
                      { label: "Akses & Kontrol", val: 20, pct: "16%", color: "bg-emerald-500" },
                      { label: "Operasional & TI", val: 18, pct: "14%", color: "bg-red-500" },
                      { label: "Kepatuhan & Regulasi", val: 14, pct: "11%", color: "bg-rose-500" },
                      { label: "Lainnya", val: 12, pct: "9%", color: "bg-slate-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${item.color}`}></div><span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.label}</span></div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 pl-2">{item.val} <span className="text-slate-400 font-normal">({item.pct})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              {/* Kepatuhan terhadap Kebijakan (Rata-rata) */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Kepatuhan terhadap Kebijakan (Rata-rata)</h3>
                  <button className="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Last 7 Days v</button>
                </div>
                <div className="flex-1 w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'May 13', value: 83 },
                      { name: 'May 14', value: 89 },
                      { name: 'May 15', value: 88 },
                      { name: 'May 16', value: 87 },
                      { name: 'May 17', value: 89 },
                      { name: 'May 18', value: 92 },
                      { name: 'May 19', value: 94 },
                    ]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                      <Tooltip formatter={(val) => [`${val}%`, 'Kepatuhan']} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              {/* Kebijakan dengan Kepatuhan Terendah */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Kebijakan dengan Kepatuhan Terendah</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="overflow-x-auto h-[180px]">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-2 font-medium">Kebijakan</th>
                        <th className="pb-2 font-medium">Kategori</th>
                        <th className="pb-2 font-medium text-center">Tingkat Kepatuhan</th>
                        <th className="pb-2 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "Kebijakan Retensi Data", cat: "Perlindungan Data Pribadi", pct: 62, stat: "Perlu Perbaikan" },
                        { name: "Kebijakan Kontrol Akses Istimewa", cat: "Akses & Kontrol", pct: 68, stat: "Perlu Perbaikan" },
                        { name: "Kebijakan Keamanan Endpoint", cat: "Keamanan Informasi", pct: 72, stat: "Perlu Perbaikan" },
                        { name: "Kebijakan Manajemen Kerentanan", cat: "Operasional & TI", pct: 75, stat: "Perlu Perbaikan" },
                        { name: "Kebijakan Backup & Recovery", cat: "Operasional & TI", pct: 78, stat: "Perlu Perbaikan" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">{row.name}</td>
                          <td className="py-2.5 text-slate-500 truncate max-w-[100px]">{row.cat}</td>
                          <td className="py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">{row.pct}%</td>
                          <td className="py-2.5 text-center">
                            <span className="text-[9px] font-medium text-red-500 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">{row.stat}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>

            {/* Third Row: 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr,1.5fr] gap-6">
              {/* Daftar Kebijakan */}
              <Panel className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Daftar Kebijakan</h3>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select className="text-[11px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md px-2 py-1.5 focus:outline-none">
                      <option>Semua Kategori v</option>
                    </select>
                    <div className="relative flex-1 sm:w-48">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type="text" placeholder="Cari kebijakan..." className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md focus:outline-none focus:border-brand-blue" />
                    </div>
                    <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline ml-2 hidden sm:block">View All</a>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Kebijakan</th>
                        <th className="pb-3 font-medium">Kategori</th>
                        <th className="pb-3 font-medium">Pemilik</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                        <th className="pb-3 font-medium">Tingkat Kepatuhan</th>
                        <th className="pb-3 font-medium">Terakhir Diperbarui</th>
                        <th className="pb-3 font-medium">Berlaku Sampai</th>
                        <th className="pb-3 font-medium text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "Kebijakan Perlindungan Data Pribadi (UU PDP)", cat: "Perlindungan Data Pribadi", owner: "Data Protection Officer", status: "Aktif", pct: 92, last: "May 10, 2025", exp: "May 10, 2026", color: "blue" },
                        { name: "Kebijakan Keamanan Informasi", cat: "Keamanan Informasi", owner: "CISO", status: "Aktif", pct: 95, last: "May 05, 2025", exp: "May 05, 2026", color: "indigo" },
                        { name: "Kebijakan Akses & Kontrol", cat: "Akses & Kontrol", owner: "IT Security Manager", status: "Aktif", pct: 88, last: "Apr 28, 2025", exp: "Apr 28, 2026", color: "amber" },
                        { name: "Kebijakan Klasifikasi & Retensi Data", cat: "Perlindungan Data Pribadi", owner: "Data Governance Lead", status: "Review", pct: 62, last: "May 01, 2025", exp: "Jun 01, 2025", color: "indigo" },
                        { name: "Kebijakan Penggunaan Perangkat", cat: "Operasional & TI", owner: "IT Operations Manager", status: "Aktif", pct: 90, last: "Apr 20, 2025", exp: "Apr 20, 2026", color: "emerald" },
                        { name: "Kebijakan Manajemen Kerentanan", cat: "Keamanan Informasi", owner: "SOC Manager", status: "Review", pct: 75, last: "Apr 30, 2025", exp: "Jun 15, 2025", color: "blue" },
                        { name: "Kebijakan Backup & Recovery", cat: "Operasional & TI", owner: "IT Operations Manager", status: "Aktif", pct: 78, last: "May 03, 2025", exp: "May 03, 2026", color: "emerald" },
                        { name: "Kebijakan Kesadaran Keamanan", cat: "Keamanan Informasi", owner: "CISO", status: "Aktif", pct: 93, last: "Apr 15, 2025", exp: "Apr 15, 2026", color: "indigo" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <FileText className={`w-3.5 h-3.5 text-${row.color}-500 shrink-0`} />
                              <span className="font-semibold text-brand-blue truncate max-w-[160px]">{row.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-500 truncate max-w-[120px]">{row.cat}</td>
                          <td className="py-2.5 text-slate-500 truncate max-w-[120px]">{row.owner}</td>
                          <td className="py-2.5 text-center">
                            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${row.status === 'Aktif' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20' : 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20'}`}>{row.status}</span>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 w-6">{row.pct}%</span>
                              <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${row.pct >= 90 ? 'bg-emerald-500' : row.pct >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${row.pct}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-500 font-medium">{row.last}</td>
                          <td className="py-2.5 text-slate-500 font-medium">{row.exp}</td>
                          <td className="py-2.5 text-center text-slate-400 hover:text-slate-600 cursor-pointer"><MoreVertical className="w-4 h-4" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4 text-[10px] text-slate-500 font-medium">
                  <div>Showing 1 to 8 of 128 entries</div>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">&laquo;</button>
                    <button className="px-2 py-1 bg-brand-blue text-white rounded shadow-sm">1</button>
                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">2</button>
                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">3</button>
                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">4</button>
                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">5</button>
                    <span className="px-1">...</span>
                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">16</button>
                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">&raquo;</button>
                  </div>
                </div>
              </Panel>

              {/* Siklus Hidup Kebijakan */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Siklus Hidup Kebijakan</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex flex-col gap-0 h-full justify-between pb-4">
                  {[
                    { title: "Pembuatan", count: "8 Kebijakan", icon: FileText, color: "slate", line: true },
                    { title: "Review", count: "15 Kebijakan", icon: ShieldCheck, color: "blue", line: true },
                    { title: "Persetujuan", count: "9 Kebijakan", icon: CheckCircle2, color: "emerald", line: true },
                    { title: "Publikasi", count: "102 Kebijakan", icon: Shield, color: "indigo", line: true },
                    { title: "Monitoring & Evaluasi", count: "102 Kebijakan", icon: Clock, color: "amber", line: false },
                  ].map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div key={i} className="flex gap-4 relative group">
                        {step.line && <div className="absolute left-[15px] top-[34px] bottom-[-6px] w-px bg-slate-200 dark:bg-slate-800">
                          <ArrowDown className="w-3 h-3 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900" />
                        </div>}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-${step.color}-50 dark:bg-${step.color}-900/30 text-${step.color}-500 border border-${step.color}-200 dark:border-${step.color}-800 z-10`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="pb-6">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-blue transition-colors cursor-pointer">{step.title}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{step.count}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>

              {/* Upcoming Policy Review */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Upcoming Policy Review</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View Calendar</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Kebijakan</th>
                        <th className="pb-3 font-medium">Pemilik</th>
                        <th className="pb-3 font-medium text-center">Tinjau Berikutnya</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "Kebijakan Retensi Data", owner: "Data Governance Lead", date: "May 25, 2025", status: "Review" },
                        { name: "Kebijakan Kontrol Akses Istimewa", owner: "IT Security Manager", date: "May 27, 2025", status: "Review" },
                        { name: "Kebijakan Manajemen Kerentanan", owner: "SOC Manager", date: "May 30, 2025", status: "Review" },
                        { name: "Kebijakan Penggunaan Cloud", owner: "IT Operations Manager", date: "Jun 02, 2025", status: "Review" },
                        { name: "Kebijakan Enkripsi Data", owner: "IT Security Manager", date: "Jun 05, 2025", status: "Review" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 font-semibold text-brand-blue truncate max-w-[130px] cursor-pointer hover:underline">{row.name}</td>
                          <td className="py-3 text-slate-500 truncate max-w-[100px]">{row.owner}</td>
                          <td className="py-3 text-center font-medium text-slate-600 dark:text-slate-400">{row.date}</td>
                          <td className="py-3 text-center">
                            <span className="text-[9px] font-medium text-blue-600 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>

            {/* Bottom Alert */}
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 shadow-sm">
              <Info className="w-4 h-4 shrink-0" />
              <span>Pastikan semua kebijakan ditinjau secara berkala dan disesuaikan dengan perubahan regulasi serta kebutuhan bisnis.</span>
            </div>

          </div>
        ) : activeTab === "Risk & Gap Analysis" ? (
          <div className="flex flex-col gap-6">
            
            {/* Top Row: Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
              {/* Card 1 */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400"><FileSearch className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Total Risiko Teridentifikasi</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">86</div>
                <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>16% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData4} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-md text-red-500 dark:text-red-400"><AlertTriangle className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Risiko Tinggi</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">22</div>
                <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>15% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData4} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-md text-amber-500 dark:text-amber-400"><Clock className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Risiko Menengah</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">38</div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>5% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData5} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Risiko Rendah</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">20</div>
                <div className="flex items-center text-[10px] font-medium text-emerald-600 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>10% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData3} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400"><ShieldCheck className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Rata-rata Risk Score</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">6.2 <span className="text-sm font-medium text-slate-500">/ 10</span></div>
                <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>8% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData1} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 6 */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400"><Target className="w-4 h-4" /></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 line-clamp-1">Total Gap Teridentifikasi</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 mt-1">74</div>
                <div className="flex items-center text-[10px] font-medium text-red-500 mb-4 gap-1">
                  <TrendingUp className="w-3 h-3" /> <span>12% vs last 7 days</span>
                </div>
                <div className="h-10 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData4} margin={{top:0,right:0,left:0,bottom:0}}>
                      <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Second Row: 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Heatmap */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Risk Heatmap (Likelihood vs Impact)</h3>
                <div className="flex gap-4 items-center">
                  {/* Heatmap grid */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-medium text-slate-500 tracking-widest">Likelihood</div>
                    <div className="flex items-end mb-1 text-[9px] text-slate-500 text-center">
                       <div className="w-12 h-6 flex items-center justify-center -ml-8"></div>
                       <div className="flex flex-col gap-1">
                         <div className="flex">
                           <div className="w-10 h-10 bg-amber-100 border border-white flex items-center justify-center font-bold text-slate-700">0</div>
                           <div className="w-10 h-10 bg-amber-200 border border-white flex items-center justify-center font-bold text-slate-700">1</div>
                           <div className="w-10 h-10 bg-amber-400 border border-white flex items-center justify-center font-bold text-slate-700">3</div>
                           <div className="w-10 h-10 bg-red-400 border border-white flex items-center justify-center font-bold text-slate-700 text-white">6</div>
                           <div className="w-10 h-10 bg-red-500 border border-white flex items-center justify-center font-bold text-white">8</div>
                         </div>
                         <div className="flex">
                           <div className="w-10 h-10 bg-emerald-100 border border-white flex items-center justify-center font-bold text-slate-700">1</div>
                           <div className="w-10 h-10 bg-amber-100 border border-white flex items-center justify-center font-bold text-slate-700">2</div>
                           <div className="w-10 h-10 bg-amber-300 border border-white flex items-center justify-center font-bold text-slate-700">6</div>
                           <div className="w-10 h-10 bg-red-400 border border-white flex items-center justify-center font-bold text-slate-700 text-white">8</div>
                           <div className="w-10 h-10 bg-red-500 border border-white flex items-center justify-center font-bold text-white">9</div>
                         </div>
                         <div className="flex">
                           <div className="w-10 h-10 bg-emerald-200 border border-white flex items-center justify-center font-bold text-slate-700">2</div>
                           <div className="w-10 h-10 bg-emerald-100 border border-white flex items-center justify-center font-bold text-slate-700">4</div>
                           <div className="w-10 h-10 bg-amber-200 border border-white flex items-center justify-center font-bold text-slate-700">7</div>
                           <div className="w-10 h-10 bg-red-400 border border-white flex items-center justify-center font-bold text-slate-700 text-white">9</div>
                           <div className="w-10 h-10 bg-red-500 border border-white flex items-center justify-center font-bold text-white">6</div>
                         </div>
                         <div className="flex">
                           <div className="w-10 h-10 bg-emerald-300 border border-white flex items-center justify-center font-bold text-slate-700">3</div>
                           <div className="w-10 h-10 bg-amber-100 border border-white flex items-center justify-center font-bold text-slate-700">6</div>
                           <div className="w-10 h-10 bg-amber-300 border border-white flex items-center justify-center font-bold text-slate-700">8</div>
                           <div className="w-10 h-10 bg-amber-400 border border-white flex items-center justify-center font-bold text-slate-700">5</div>
                           <div className="w-10 h-10 bg-emerald-100 border border-white flex items-center justify-center font-bold text-slate-700">2</div>
                         </div>
                         <div className="flex">
                           <div className="w-10 h-10 bg-emerald-400 border border-white flex items-center justify-center font-bold text-slate-700">1</div>
                           <div className="w-10 h-10 bg-emerald-300 border border-white flex items-center justify-center font-bold text-slate-700">2</div>
                           <div className="w-10 h-10 bg-emerald-100 border border-white flex items-center justify-center font-bold text-slate-700">4</div>
                           <div className="w-10 h-10 bg-emerald-200 border border-white flex items-center justify-center font-bold text-slate-700">2</div>
                           <div className="w-10 h-10 bg-emerald-400 border border-white flex items-center justify-center font-bold text-slate-700">0</div>
                         </div>
                       </div>
                    </div>
                    <div className="flex justify-center text-[9px] font-medium text-slate-500 tracking-widest mt-2 pl-6">Impact</div>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex-1 space-y-2 text-[10px]">
                     <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Level Risiko</div>
                     <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-slate-600 dark:text-slate-400">Tinggi</span></div><span className="font-semibold text-slate-800 dark:text-slate-200">22 <span className="text-slate-400 font-normal">(26%)</span></span></div>
                     <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-slate-600 dark:text-slate-400">Menengah</span></div><span className="font-semibold text-slate-800 dark:text-slate-200">38 <span className="text-slate-400 font-normal">(44%)</span></span></div>
                     <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-300"></div><span className="text-slate-600 dark:text-slate-400">Rendah</span></div><span className="font-semibold text-slate-800 dark:text-slate-200">20 <span className="text-slate-400 font-normal">(23%)</span></span></div>
                     <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-slate-600 dark:text-slate-400">Sangat Rendah</span></div><span className="font-semibold text-slate-800 dark:text-slate-200">6 <span className="text-slate-400 font-normal">(7%)</span></span></div>
                  </div>
                </div>
              </Panel>

              {/* Trend */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Risk Score Trend (Rata-rata)</h3>
                  <button className="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Last 7 Days v</button>
                </div>
                <div className="flex-1 w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'May 13', value: 5.6 },
                      { name: 'May 14', value: 5.8 },
                      { name: 'May 15', value: 5.8 },
                      { name: 'May 16', value: 6.0 },
                      { name: 'May 17', value: 6.1 },
                      { name: 'May 18', value: 6.1 },
                      { name: 'May 19', value: 6.2 },
                    ]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                      <Tooltip />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 10]} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <span className="text-[9px] font-medium text-slate-500 inline-flex items-center gap-1.5 before:w-2 before:h-2 before:rounded-full before:bg-indigo-500 before:inline-block">Risk Score (Rata-rata)</span>
                </div>
              </Panel>

              {/* Domain */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Risk berdasarkan Domain</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex items-center gap-6 h-[180px]">
                  <div className="w-32 h-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Data Privacy', value: 24, color: '#3b82f6' },
                            { name: 'Access Control', value: 18, color: '#f59e0b' },
                            { name: 'Data Security', value: 15, color: '#ef4444' },
                            { name: 'Operational Security', value: 12, color: '#f43f5e' },
                            { name: 'Compliance', value: 9, color: '#d946ef' },
                            { name: 'Third Party Risk', value: 8, color: '#94a3b8' },
                          ]}
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {[
                            { name: 'Data Privacy', value: 24, color: '#3b82f6' },
                            { name: 'Access Control', value: 18, color: '#f59e0b' },
                            { name: 'Data Security', value: 15, color: '#ef4444' },
                            { name: 'Operational Security', value: 12, color: '#f43f5e' },
                            { name: 'Compliance', value: 9, color: '#d946ef' },
                            { name: 'Third Party Risk', value: 8, color: '#94a3b8' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-slate-800 dark:text-slate-100">86</span>
                      <span className="text-[10px] text-slate-500 font-medium">Total Risiko</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-xs">
                    {[
                      { label: "Data Privacy (UU PDP)", val: 24, pct: "28%", color: "bg-blue-500" },
                      { label: "Access Control", val: 18, pct: "21%", color: "bg-amber-500" },
                      { label: "Data Security", val: 15, pct: "17%", color: "bg-red-500" },
                      { label: "Operational Security", val: 12, pct: "14%", color: "bg-rose-500" },
                      { label: "Compliance & Governance", val: 9, pct: "10%", color: "bg-fuchsia-500" },
                      { label: "Third Party Risk", val: 8, pct: "9%", color: "bg-slate-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${item.color}`}></div><span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[90px]">{item.label}</span></div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 pl-1 text-[10px]">{item.val} <span className="text-slate-400 font-normal">({item.pct})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>

            {/* Third Row: 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1.5fr,1fr] gap-6">
              {/* Top 5 Risiko */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6">Top 5 Risiko Tertinggi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Risiko</th>
                        <th className="pb-3 font-medium">Domain</th>
                        <th className="pb-3 font-medium text-center">Likelihood</th>
                        <th className="pb-3 font-medium text-center">Impact</th>
                        <th className="pb-3 font-medium text-center">Risk Score</th>
                        <th className="pb-3 font-medium text-center">Trend</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "Kebocoran Data Pribadi Pelanggan", dom: "Data Privacy (UU PDP)", l: 5, i: 5, s: 25, t: "up", stat: "Tinggi" },
                        { name: "Akses Tidak Sah ke Data Sensitif", dom: "Access Control", l: 4, i: 5, s: 20, t: "up", stat: "Tinggi" },
                        { name: "Kegagalan Enkripsi Data", dom: "Data Security", l: 4, i: 4, s: 16, t: "up", stat: "Tinggi" },
                        { name: "Retensi Data Melebihi Ketentuan", dom: "Data Privacy (UU PDP)", l: 4, i: 4, s: 16, t: "up", stat: "Tinggi" },
                        { name: "Manajemen Hak Akses Tidak Optimal", dom: "Access Control", l: 4, i: 4, s: 16, t: "flat", stat: "Tinggi" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{row.name}</td>
                          <td className="py-2.5 text-slate-500">{row.dom}</td>
                          <td className="py-2.5 text-center font-medium">{row.l}</td>
                          <td className="py-2.5 text-center font-medium">{row.i}</td>
                          <td className="py-2.5 text-center font-bold text-slate-700 dark:text-slate-200">{row.s}</td>
                          <td className="py-2.5 text-center">
                            {row.t === 'up' ? <ArrowUp className="w-3 h-3 text-red-500 mx-auto" /> : <Minus className="w-3 h-3 text-slate-400 mx-auto" />}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="text-[9px] font-medium text-red-500 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">{row.stat}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4"><a href="#" className="text-[10px] font-semibold text-brand-blue hover:underline">View All</a></div>
              </Panel>

              {/* Top 5 Gap */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6">Top 5 Gap dengan Risiko Tertinggi</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Gap</th>
                        <th className="pb-3 font-medium">Regulasi / Framework</th>
                        <th className="pb-3 font-medium text-center">Risk Score</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "Persetujuan eksplisit belum diterapkan untuk semua proses data", reg: "UU PDP Pasal 20", s: 25, stat: "Tinggi" },
                        { name: "Kebijakan retensi data belum sesuai ketentuan UU PDP", reg: "UU PDP Pasal 26", s: 20, stat: "Tinggi" },
                        { name: "Data tidak terenkripsi saat transit pada sebagian sistem", reg: "ISO 27001 A.10.1", s: 16, stat: "Tinggi" },
                        { name: "Logging akses belum lengkap dan belum terpusat", reg: "ISO 27001 A.12.4", s: 16, stat: "Tinggi" },
                        { name: "Penilaian dampak perlindungan data pribadi (DPIA) belum dilakukan", reg: "UU PDP Pasal 36", s: 15, stat: "Menengah", color: "amber" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{row.name}</td>
                          <td className="py-2.5 text-slate-500">{row.reg}</td>
                          <td className="py-2.5 text-center font-bold text-slate-700 dark:text-slate-200">{row.s}</td>
                          <td className="py-2.5 text-center">
                            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${row.color === 'amber' ? 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20' : 'text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20'}`}>{row.stat}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4"><a href="#" className="text-[10px] font-semibold text-brand-blue hover:underline">View All</a></div>
              </Panel>

              {/* Gap Analysis Summary */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Gap Analysis Summary</h3>
                  <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
                </div>
                <div className="flex flex-col items-center gap-6 mt-4">
                  <div className="w-36 h-36 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Tertutup', value: 18, color: '#10b981' },
                            { name: 'Dalam Tindak Lanjut', value: 26, color: '#f59e0b' },
                            { name: 'Terbuka', value: 30, color: '#ef4444' },
                          ]}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {[
                            { name: 'Tertutup', value: 18, color: '#10b981' },
                            { name: 'Dalam Tindak Lanjut', value: 26, color: '#f59e0b' },
                            { name: 'Terbuka', value: 30, color: '#ef4444' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">74</span>
                      <span className="text-[10px] text-slate-500 font-medium">Total Gap</span>
                    </div>
                  </div>
                  <div className="w-full space-y-3 text-xs">
                    {[
                      { label: "Tertutup", val: 18, pct: "26%", color: "bg-emerald-500" },
                      { label: "Dalam Tindak Lanjut", val: 26, pct: "35%", color: "bg-amber-500" },
                      { label: "Terbuka", val: 30, pct: "41%", color: "bg-red-500" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${item.color}`}></div><span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span></div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.val} <span className="text-slate-400 font-normal">({item.pct})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>

            {/* Fourth Row: 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1.5fr,1fr] gap-6">
              {/* Gap berdasarkan Regulasi */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6">Gap berdasarkan Regulasi / Framework</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Regulasi / Framework</th>
                        <th className="pb-3 font-medium text-center">Total Gap</th>
                        <th className="pb-3 font-medium text-center">Terbuka</th>
                        <th className="pb-3 font-medium text-center">Dalam Tindak Lanjut</th>
                        <th className="pb-3 font-medium text-center">Tertutup</th>
                        <th className="pb-3 font-medium text-center">Risk Score Rata-rata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "UU PDP (Perlindungan Data Pribadi)", tot: 32, open: "14 (44%)", wip: "11 (34%)", closed: "7 (22%)", score: 7.6, color: "red" },
                        { name: "ISO 27001:2022", tot: 19, open: "6 (32%)", wip: "8 (42%)", closed: "5 (26%)", score: 6.1, color: "amber" },
                        { name: "NIST Cybersecurity Framework", tot: 12, open: "6 (50%)", wip: "4 (33%)", closed: "2 (17%)", score: 5.4, color: "amber" },
                        { name: "PCI DSS v4.0", tot: 6, open: "3 (50%)", wip: "2 (33%)", closed: "1 (17%)", score: 6.8, color: "red" },
                        { name: "UU ITE", tot: 5, open: "1 (20%)", wip: "1 (20%)", closed: "3 (60%)", score: 4.2, color: "emerald" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{row.name}</td>
                          <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-200">{row.tot}</td>
                          <td className="py-3 text-center text-slate-500">{row.open}</td>
                          <td className="py-3 text-center text-slate-500">{row.wip}</td>
                          <td className="py-3 text-center text-slate-500">{row.closed}</td>
                          <td className="py-3 text-center">
                            <span className={`text-[10px] font-semibold text-${row.color}-600 bg-${row.color}-50 dark:bg-${row.color}-900/30 px-2 py-0.5 rounded-full border border-${row.color}-200 dark:border-${row.color}-800`}>{row.score}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4"><a href="#" className="text-[10px] font-semibold text-brand-blue hover:underline">View All</a></div>
              </Panel>

              {/* Rekomendasi Mitigasi Prioritas */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-6">Rekomendasi Mitigasi Prioritas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-medium">Rekomendasi</th>
                        <th className="pb-3 font-medium">Terkait Risiko</th>
                        <th className="pb-3 font-medium text-center">Prioritas</th>
                        <th className="pb-3 font-medium">Target Penyelesaian</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[
                        { name: "Implementasi Consent Management Platform", risk: "Kebocoran Data Pribadi", prio: "Tinggi", target: "May 31, 2025", stat: "Dalam Proses", color: "amber" },
                        { name: "Perbarui & terapkan kebijakan retensi data sesuai UU PDP", risk: "Retensi Data Melebihi Ketentuan", prio: "Tinggi", target: "May 30, 2025", stat: "Dalam Proses", color: "amber" },
                        { name: "Enkripsi end-to-end untuk semua data saat transit", risk: "Kegagalan Enkripsi Data", prio: "Tinggi", target: "Jun 15, 2025", stat: "Terbuka", color: "red" },
                        { name: "Tingkatkan monitoring & logging akses terpusat", risk: "Akses Tidak Sah ke Data", prio: "Tinggi", target: "Jun 10, 2025", stat: "Dalam Proses", color: "amber" },
                        { name: "Lakukan DPIA untuk seluruh proses berisiko tinggi", risk: "Penilaian Dampak Data Pribadi", prio: "Menengah", target: "Jun 30, 2025", stat: "Terbuka", color: "red" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 font-semibold text-brand-blue truncate max-w-[140px] cursor-pointer hover:underline">{row.name}</td>
                          <td className="py-2.5 text-slate-500 truncate max-w-[100px]">{row.risk}</td>
                          <td className="py-2.5 text-center font-medium text-slate-700 dark:text-slate-300">{row.prio}</td>
                          <td className="py-2.5 text-slate-500">{row.target}</td>
                          <td className="py-2.5 text-center">
                            <span className={`text-[9px] font-medium text-${row.color}-600 border border-${row.color}-200 dark:border-${row.color}-800 bg-${row.color}-50 dark:bg-${row.color}-900/20 px-2 py-0.5 rounded-full`}>{row.stat}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4"><a href="#" className="text-[10px] font-semibold text-brand-blue hover:underline">View All</a></div>
              </Panel>

              {/* Risk & Gap Insight */}
              <Panel className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Risk & Gap Insight</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-md shrink-0"><AlertTriangle className="w-4 h-4" /></div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Risiko tertinggi berasal dari domain <strong className="font-semibold text-slate-800 dark:text-slate-200">Data Privacy (UU PDP)</strong> dengan kontribusi 28% dari total risiko.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-md shrink-0"><AlertTriangle className="w-4 h-4" /></div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"><strong className="font-semibold text-slate-800 dark:text-slate-200">41% gap</strong> masih berstatus terbuka dan memerlukan tindak lanjut segera.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-md shrink-0"><ShieldCheck className="w-4 h-4" /></div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Rata-rata risk score naik <strong className="font-semibold text-slate-800 dark:text-slate-200">8%</strong> dibandingkan 7 hari sebelumnya.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-md shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"><strong className="font-semibold text-slate-800 dark:text-slate-200">18 gap</strong> telah berhasil ditutup (24%) dari total 74 gap.</p>
                  </div>
                </div>
                <div className="mt-auto pt-6"><a href="#" className="text-[10px] font-semibold text-brand-blue hover:underline">View All</a></div>
              </Panel>
            </div>

            {/* Bottom Alert */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 shadow-sm">
              <Info className="w-4 h-4 shrink-0 text-slate-400" />
              <span>Data risiko dan gap diperbarui setiap 24 jam. Pastikan semua rekomendasi mitigasi ditindaklanjuti untuk menurunkan risiko dan meningkatkan kepatuhan.</span>
            </div>

          </div>
        ) : activeTab === "Reports" ? (
          <div className="flex flex-col gap-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Consolidated Compliance Report</h3>
                <p className="text-xs text-slate-500 mt-1">Ringkasan eksekutif kepatuhan, audit, kebijakan, dan risiko (Periode: Q2 2025)</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><ShieldCheck className="w-5 h-5" /></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Overall Compliance</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">92%</div>
                <div className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +3% dari Q1 2025</div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-500 dark:text-red-400"><AlertTriangle className="w-5 h-5" /></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">High Risks & Gaps</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">22</div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">Membutuhkan mitigasi segera</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-500 dark:text-amber-400"><Clock className="w-5 h-5" /></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pending Actions</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">15</div>
                <div className="text-[10px] text-amber-600 font-medium mt-1">Audit, Review Kebijakan, dll.</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-5 h-5" /></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Audit Score (Avg)</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">88<span className="text-base text-slate-500 font-normal">/100</span></div>
                <div className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Status: Sangat Baik</div>
              </div>
            </div>

            {/* Grid Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Executive Summary Narrative */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Executive Insight</h3>
                <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>Pada periode ini, organisasi menunjukkan tren kepatuhan yang positif dengan pencapaian <strong className="text-slate-800 dark:text-slate-200 font-semibold">Overall Compliance Score sebesar 92%</strong>. Penilaian audit dari internal maupun eksternal mendapatkan rata-rata skor 88/100.</p>
                  
                  <p>Namun demikian, masih terdapat <strong className="text-red-500 font-semibold">22 Risiko Tinggi</strong> yang mayoritas terpusat pada area <span className="italic">Data Privacy (UU PDP)</span> dan <span className="italic">Access Control</span>. Rekomendasi utama adalah segera menyelesaikan implementasi <span className="font-medium text-brand-blue">Consent Management Platform</span> dan memperbarui kebijakan retensi data.</p>
                  
                  <div className="flex items-start gap-3 mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-lg">
                    <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-indigo-800 dark:text-indigo-300">Terdapat 7 kebijakan yang akan kadaluwarsa dalam 30 hari ke depan dan memerlukan review segera, terutama dari tim CISO dan Data Protection Officer.</p>
                  </div>
                </div>
              </Panel>

              {/* Performance Chart */}
              <Panel className="p-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Tren Kepatuhan vs Risiko (6 Bulan Terakhir)</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', compliance: 85, risk: 45 },
                      { month: 'Feb', compliance: 86, risk: 40 },
                      { month: 'Mar', compliance: 88, risk: 35 },
                      { month: 'Apr', compliance: 89, risk: 30 },
                      { month: 'May', compliance: 92, risk: 22 },
                    ]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" name="Compliance Score" dataKey="compliance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line yAxisId="right" type="monotone" name="High Risks" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <span className="text-[10px] font-medium text-slate-500 inline-flex items-center gap-1.5 before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:inline-block">Compliance Score (%)</span>
                  <span className="text-[10px] font-medium text-slate-500 inline-flex items-center gap-1.5 before:w-2 before:h-2 before:rounded-full before:bg-red-500 before:inline-block">High Risks (Count)</span>
                </div>
              </Panel>
            </div>

            {/* Consolidated Action Items */}
            <Panel className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Consolidated Action Items</h3>
                <span className="px-2 py-1 bg-brand-blue text-white text-[10px] font-medium rounded-md">Top Priorities</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="pb-3 font-medium">Tugas / Isu</th>
                      <th className="pb-3 font-medium">Sumber Modul</th>
                      <th className="pb-3 font-medium">PIC / Pemilik</th>
                      <th className="pb-3 font-medium text-center">Tenggat Waktu</th>
                      <th className="pb-3 font-medium text-center">Prioritas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {[
                      { task: "Implementasi Consent Management Platform", source: "Risk & Gap Analysis", pic: "Data Privacy Officer", date: "May 31, 2025", prio: "Tinggi", color: "red" },
                      { task: "Perbarui Kebijakan Klasifikasi & Retensi Data", source: "Policy Management", pic: "Data Governance Lead", date: "Jun 01, 2025", prio: "Tinggi", color: "red" },
                      { task: "Tindak Lanjut Temuan Audit ISO 27001 (A.10.1)", source: "Audit & Assessment", pic: "IT Security Manager", date: "Jun 15, 2025", prio: "Tinggi", color: "red" },
                      { task: "Review Kebijakan Manajemen Kerentanan", source: "Policy Management", pic: "SOC Manager", date: "Jun 15, 2025", prio: "Menengah", color: "amber" },
                      { task: "Implementasi kontrol DPIA", source: "Regulatory Tracking (UU PDP)", pic: "Data Privacy Officer", date: "Jun 30, 2025", prio: "Menengah", color: "amber" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{row.task}</td>
                        <td className="py-3 text-slate-500"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] font-medium border border-slate-200 dark:border-slate-700">{row.source}</span></td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{row.pic}</td>
                        <td className="py-3 text-center text-slate-600 dark:text-slate-400 font-medium">{row.date}</td>
                        <td className="py-3 text-center">
                          <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border text-${row.color}-600 border-${row.color}-200 bg-${row.color}-50 dark:bg-${row.color}-900/20`}>{row.prio}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
            
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 min-h-[400px]">
            <p>Konten untuk tab <strong>{activeTab}</strong> sedang dalam tahap pengembangan.</p>
          </div>
        )}

        {/* Modal Regulasi & Framework */}
        {isRegulasiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsRegulasiModalOpen(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Regulasi & Framework yang Dimonitor</h3>
                </div>
                <button onClick={() => setIsRegulasiModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                   <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[60vh]">
                 {regulasiData.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div className="p-2 bg-white dark:bg-slate-800 text-brand-blue rounded shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                           <div className="flex items-center gap-2 mt-1">
                             <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                               <div className="h-full bg-brand-blue rounded-full" style={{ width: `${item.score}%` }}></div>
                             </div>
                             <span className="text-[10px] font-medium text-slate-500">{item.score}% Score</span>
                           </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-end">
                 <button onClick={() => setIsRegulasiModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                   Tutup
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Detail Modal */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 w-full max-w-5xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-blue/10 rounded-md text-brand-blue shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Tampilan Detail: {activeModal.title.split(' | ')[0]}</h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                   <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto max-h-[65vh]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        {activeModal.headers.map((h, i) => (
                          <th key={i} className="pb-3 font-medium" dangerouslySetInnerHTML={{ __html: h }} />
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[...Array(10)].map((_, i) => {
                        const rowData = activeModal.rows[i % activeModal.rows.length];
                        return (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            {rowData.map((cellHtml, j) => (
                               <td key={j} className="py-3 text-slate-600 dark:text-slate-400" dangerouslySetInnerHTML={{ __html: cellHtml }} />
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-medium">Menampilkan 10 dari total data</span>
                 <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                   Tutup
                 </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
}
