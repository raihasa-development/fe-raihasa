import React, { useEffect, useState, useCallback } from 'react';
import {
  FiBookOpen, FiUsers, FiAward, FiCpu, FiArrowRight, FiDollarSign, FiUserCheck,
  FiActivity, FiCreditCard, FiSettings, FiFileText, FiTrendingUp, FiMousePointer,
  FiCalendar, FiCheckCircle, FiClock, FiAlertTriangle, FiCheckSquare, FiThumbsUp, FiMessageSquare, FiExternalLink
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import withAuth from '@/components/hoc/withAuth';
import UnstyledLink from '@/components/links/UnstyledLink';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';

// Module Data used to generate the dashboard grid
const modules = [
  {
    title: 'User Management',
    description: 'Monitor users, verify emails, check expiry dates, and manage access.',
    icon: FiUserCheck,
    href: '/admin/users',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Manage Courses',
    description: 'Update BISA Learning videos, durations, levels, and instructors.',
    icon: FiBookOpen,
    href: '/admin/courses',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Manage Pricing',
    description: 'Adjust prices for scholarship packages and other services.',
    icon: FiDollarSign,
    href: '/admin/pricing',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Payment Monitoring',
    description: 'Monitor transactions, verify payments, and manage payment statuses.',
    icon: FiCreditCard,
    href: '/admin/payments',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    title: 'Generate Kuitansi',
    description: 'Buat kuitansi PDF untuk mentor secara dinamis dan kirim langsung ke email.',
    icon: FiFileText,
    href: '/admin/payments/receipt',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    title: 'Kelola Mentor',
    description: 'Kelola database mentor (nama, status, alamat, bank) untuk auto-fill kuitansi.',
    icon: FiUsers,
    href: '/admin/mentors',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Manajemen Beasiswa',
    description: 'Update scholarship database, deadlines, and details.',
    icon: FiAward,
    href: '/admin/manajemen-beasiswa',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    title: 'Dreamshub',
    description: 'Manage community features, events, and networking.',
    icon: FiUsers,
    href: '/admin/dreamshub',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    title: 'Prompt Analysis',
    description: 'Analyze and manage AI prompts and responses.',
    icon: FiCpu,
    href: '/admin/prompt-analysis',
    color: 'bg-gray-50 text-gray-600',
  },
  {
    title: 'Konfigurasi Sistem',
    description: 'Atur parameter flash sale onboarding, timebomb, dan master data lainnya.',
    icon: FiSettings,
    href: '/admin/config',
    color: 'bg-violet-50 text-violet-600',
  },
];

export default withAuth(DashboardAdminPage, 'admin');

function DashboardAdminPage() {
  const user = useAuthStore((state) => state.user);
  
  // Date states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scholarshipMap, setScholarshipMap] = useState<Record<string, { name: string; url: string }>>({});
  const [courseMap, setCourseMap] = useState<Record<string, { id: string; name: string }>>({});

  const fetchAnalytics = useCallback(async (start: string, end: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/auth/admin/analytics?startDate=${start}&endDate=${end}`);
      setAnalytics(data?.data);
    } catch (err) {
      console.error('Gagal mengambil analitik admin:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(startDate, endDate);

    const loadMappingData = async () => {
      try {
        // Fetch scholarships
        const { data: schRes } = await api.get('/scholarship?limit=1000');
        const schList = schRes?.data || [];
        const sMap: Record<string, { name: string; url: string }> = {};
        schList.forEach((s: any) => {
          sMap[s.id] = {
            name: s.nama,
            url: `/list-scholarship/${s.id}`
          };
          const slug = s.nama.toLowerCase().replace(/ /g, '-');
          sMap[slug] = {
            name: s.nama,
            url: `/scholarship-info/${s.id}`
          };
        });
        setScholarshipMap(sMap);

        // Fetch courses
        const { data: lmsRes } = await api.get('/lms/modul');
        const lmsList = lmsRes?.data || [];
        const cMap: Record<string, { id: string; name: string }> = {};
        lmsList.forEach((c: any) => {
          cMap[c.nama] = {
            id: c.id,
            name: c.nama
          };
          cMap[c.id] = {
            id: c.id,
            name: c.nama
          };
        });
        setCourseMap(cMap);
      } catch (err) {
        console.error('Failed to load mapping data for admin dashboard:', err);
      }
    };

    loadMappingData();
  }, []);

  const handleApplyFilter = () => {
    fetchAnalytics(startDate, endDate);
  };

  const handlePresetFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    fetchAnalytics(startStr, endStr);
  };

  // Format data untuk Chart
  const lineData = analytics?.activityTimeline?.map((item: any) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  })) || [];

  const funnelData = [
    { name: '1. Akses Kalkulator', value: analytics?.scholraFunnel?.step1_views || 0, fill: '#1B7691' },
    { name: '2. Input Form Kriteria', value: analytics?.scholraFunnel?.step2_submits || 0, fill: '#FB991A' },
    { name: '3. Selesai Rekomendasi', value: analytics?.scholraFunnel?.step3_results || 0, fill: '#10B981' }
  ];

  const pieData = [
    { name: 'Google OAuth', value: analytics?.registrationMethods?.google || 0, color: '#EF4444' },
    { name: 'Manual Email', value: analytics?.registrationMethods?.manual || 0, color: '#6B7280' }
  ];

  const resolvedScholarships = analytics?.topScholarships?.map((s: any) => {
    const reconstructedId = s.name.toLowerCase().replace(/ /g, '-');
    const mapped = scholarshipMap[reconstructedId] || scholarshipMap[s.name];
    return {
      displayName: mapped ? mapped.name : s.name,
      url: mapped ? mapped.url : null,
      count: s.count
    };
  }) || [];

  const resolvedCourses = analytics?.topCourses?.map((c: any) => {
    const mapped = courseMap[c.name];
    return {
      displayName: c.name,
      url: mapped ? `/bisa-learning/${mapped.id}` : null,
      count: c.count
    };
  }) || [];

  // Helper formatting currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <AdminDashboard withSidebar>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <Typography variant='h4' className='font-bold text-gray-900'>
            Dashboard Overview
          </Typography>
          <Typography className='text-gray-500 mt-1'>
            Welcome back, <span className='font-semibold text-gray-700'>{user?.name || 'Admin'}</span>! Berikut adalah analitik aktivitas dan performa platform Anda.
          </Typography>
        </div>

        {/* Date Filter Widget */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <FiCalendar className="w-4 h-4 text-[#1B7691]" />
            <span>Filter Tanggal:</span>
          </div>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 outline-none"
          />
          <span className="text-gray-300 text-xs">s.d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B7691]/20 outline-none"
          />

          <button
            onClick={handleApplyFilter}
            disabled={loading}
            className="bg-[#1B7691] hover:bg-[#15627a] text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            Terapkan
          </button>

          <div className="flex items-center gap-1 border-l border-gray-150 pl-3">
            <button
              onClick={() => handlePresetFilter(7)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold transition-all"
            >
              7 Hari
            </button>
            <button
              onClick={() => handlePresetFilter(30)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold transition-all"
            >
              30 Hari
            </button>
            <button
              onClick={() => handlePresetFilter(365)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold transition-all"
            >
              1 Tahun
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Midtrans Omzet</p>
            <p className="text-xl font-extrabold text-gray-900">{loading ? '...' : formatIDR(analytics?.revenue || 0)}</p>
            <p className="text-[10px] text-gray-400 font-medium">Omzet dibayar sukses</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-[#1B7691] rounded-xl flex items-center justify-center">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Adoption Rate</p>
            <p className="text-2xl font-extrabold text-gray-900">{loading ? '...' : `${analytics?.adoptionRate || 0}%`}</p>
            <p className="text-[10px] text-gray-400 font-medium">Rasio user aktif (30 hari)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-[#FB991A] rounded-xl flex items-center justify-center">
            <FiMousePointer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Page Hits</p>
            <p className="text-2xl font-extrabold text-gray-900">{loading ? '...' : analytics?.totalLogs || 0}</p>
            <p className="text-[10px] text-gray-400 font-medium">Klik & navigasi terekam</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">New Registrations</p>
            <p className="text-2xl font-extrabold text-gray-900">{loading ? '...' : analytics?.newAccountsCount || 0}</p>
            <p className="text-[10px] text-gray-400 font-medium">User mendaftar baru</p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <div className="w-12 h-12 border-4 border-[#1B7691] border-t-transparent rounded-full animate-spin mb-4" />
          <Typography className="text-gray-400 text-xs font-bold uppercase tracking-widest">Memproses Filter Data...</Typography>
        </div>
      ) : (
        <>
          {/* Visual Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Trend Aktivitas Harian */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2">
              <h4 className="text-xs font-black text-gray-800 mb-6 uppercase tracking-wider">Tren Log Aktivitas Harian</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9' }} />
                    <Line type="monotone" dataKey="count" stroke="#1B7691" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metode Registrasi */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-black text-gray-800 mb-4 uppercase tracking-wider">Asal Pendaftaran User Baru</h4>
              <div className="h-44 relative flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-[10px] font-bold text-gray-400">Total Baru</p>
                  <p className="text-lg font-black text-gray-800">{analytics?.newAccountsCount || 0}</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs font-semibold text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {item.value} ({analytics?.newAccountsCount > 0 ? Math.round((item.value / analytics.newAccountsCount) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scholra Funnel */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2">
              <h4 className="text-xs font-black text-gray-800 mb-6 uppercase tracking-wider">Corong Konversi (Funnel) Scholra</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={140} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9' }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={30}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Performance KPI (Midtrans Details) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-black text-gray-800 mb-4 uppercase tracking-wider">Midtrans Gateway Success Rate</h4>
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><FiCheckCircle className="text-green-500" /> Success Rate</span>
                  <span className="text-sm font-black text-green-600">{analytics?.successRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><FiClock className="text-yellow-500" /> Menunggu Pembayaran</span>
                  <span className="text-sm font-bold text-gray-800">{analytics?.pendingPaymentsCount || 0} Invoice</span>
                </div>
                <div className="flex justify-between items-center pb-2.5">
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><FiAlertTriangle className="text-red-500" /> Pembayaran Kedaluwarsa / Gagal</span>
                  <span className="text-sm font-bold text-red-500">{analytics?.failedPaymentsCount || 0} Invoice</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-[10px] text-gray-500 leading-relaxed">
                Metrik keuangan diambil secara langsung melalui sistem order ID transaksi Midtrans yang terekam di sistem server-to-server.
              </div>
            </div>

            {/* Detail Beasiswa - Top Viewed Scholarships */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <h4 className="text-xs font-black text-gray-800 mb-6 uppercase tracking-wider">Beasiswa Paling Sering Dilihat</h4>
              {resolvedScholarships.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-xs">Belum ada data beasiswa diakses.</p>
              ) : (
                <div className="space-y-4">
                  {resolvedScholarships.map((scholarship: any, idx: number) => {
                    const content = (
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate group-hover:text-[#FB991A] transition-colors">{scholarship.displayName}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{scholarship.count} Kali Dilihat</p>
                      </div>
                    );

                    return (
                      <div key={scholarship.displayName} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-orange-50 text-[#FB991A] flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        {scholarship.url ? (
                          <a
                            href={scholarship.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 flex items-center gap-2 group hover:opacity-90"
                          >
                            {content}
                            <FiExternalLink className="text-gray-400 opacity-0 group-hover:opacity-100 transition-all w-3.5 h-3.5 shrink-0" />
                          </a>
                        ) : (
                          content
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bisa Learning - Top Course Adoption */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <h4 className="text-xs font-black text-gray-800 mb-6 uppercase tracking-wider">Top Kelas Bisa-Learning</h4>
              {resolvedCourses.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-xs">Belum ada materi kelas yang diakses.</p>
              ) : (
                <div className="space-y-4">
                  {resolvedCourses.map((course: any, idx: number) => {
                    const content = (
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{course.displayName}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{course.count} Kali Diakses</p>
                      </div>
                    );

                    return (
                      <div key={course.displayName} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                        {course.url ? (
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 flex items-center gap-2 group hover:opacity-90"
                          >
                            {content}
                            <FiExternalLink className="text-gray-400 opacity-0 group-hover:opacity-100 transition-all w-3.5 h-3.5 shrink-0" />
                          </a>
                        ) : (
                          content
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dreamshub Community Interaction */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-black text-gray-800 mb-6 uppercase tracking-wider">Interaksi Diskusi Dreamshub</h4>
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><FiCheckSquare className="text-pink-500" /> Postingan Diskusi Baru</span>
                  <span className="text-sm font-black text-gray-800">{analytics?.dreamshubStats?.posts || 0} Post</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><FiMessageSquare className="text-pink-500" /> Komentar Balasan</span>
                  <span className="text-sm font-bold text-gray-800">{analytics?.dreamshubStats?.replies || 0} Reply</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><FiThumbsUp className="text-pink-500" /> Menyukai Postingan</span>
                  <span className="text-sm font-bold text-gray-800">{analytics?.dreamshubStats?.likes || 0} Likes</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-pink-50/50 rounded-xl border border-pink-100/50 text-[10px] text-gray-500 leading-relaxed">
                Melacak keterlibatan langsung di forum DreamsHub sebagai KPI pendukung tingkat adopsi komunitas.
              </div>
            </div>
          </div>

          {/* Meta Pixel Correlation Mapping */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs mb-10">
            <h4 className="text-xs font-black text-gray-800 mb-4 uppercase tracking-wider">Korelasi Event Terintegrasi Meta Pixel</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-3">Nama Standard Event Meta Pixel</th>
                    <th className="p-3">Aksi Pemicu Lokal</th>
                    <th className="p-3 text-right">Jumlah Event Terkirim (Periode Ini)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analytics?.pixelMappings?.map((item: any) => (
                    <tr key={item.eventName} className="hover:bg-gray-50/20">
                      <td className="p-3 font-mono text-[#1B7691] font-bold">{item.eventName}</td>
                      <td className="p-3 text-gray-500">{item.description}</td>
                      <td className="p-3 text-right font-black text-gray-800">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Midtrans Transactions Table */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs mb-10">
            <h4 className="text-xs font-black text-gray-800 mb-6 uppercase tracking-wider">5 Transaksi Pembayaran Midtrans Terbaru</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="p-3">ID Order</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Jumlah (IDR)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tanggal Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analytics?.recentTransactions?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">Belum ada transaksi terekam pada periode ini.</td>
                    </tr>
                  ) : (
                    analytics?.recentTransactions?.map((tx: any) => {
                      let statusBadge = 'bg-yellow-50 text-yellow-600 border border-yellow-100';
                      if (tx.status === 'PAID') statusBadge = 'bg-green-50 text-green-600 border border-green-100';
                      if (tx.status === 'FAILED' || tx.status === 'EXPIRED_PAYMENT') statusBadge = 'bg-red-50 text-red-500 border border-red-100';

                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/30 font-medium text-gray-600">
                          <td className="p-3 font-mono font-bold text-gray-800">{tx.orderId}</td>
                          <td className="p-3">
                            <p className="font-bold text-gray-800">{tx.userName}</p>
                            <p className="text-[10px] text-gray-400">{tx.userEmail}</p>
                          </td>
                          <td className="p-3 font-bold">{tx.planName}</td>
                          <td className="p-3 font-black text-gray-800">{formatIDR(tx.amount)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${statusBadge}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400">
                            {new Date(tx.date).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modules Quick Access Grid */}
      <h3 className="text-sm font-black text-gray-800 mb-6 uppercase tracking-wider mt-10">Fitur & Navigasi Cepat</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
        {modules.map((module) => (
          <UnstyledLink
            key={module.title}
            href={module.href}
            className='group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col h-full'
          >
            <div className='flex items-start justify-between mb-5'>
              <div className={`p-3.5 rounded-2xl ${module.color} transition-colors group-hover:scale-110 duration-300`}>
                <module.icon className='w-6 h-6' />
              </div>
              <div className='p-2 rounded-full hover:bg-gray-50 text-gray-300 group-hover:text-[#1B7691] transition-colors'>
                <FiArrowRight className='w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300' />
              </div>
            </div>

            <div className='mt-auto'>
              <Typography variant='h6' className='font-bold text-gray-800 mb-2 group-hover:text-[#1B7691] transition-colors'>
                {module.title}
              </Typography>
              <Typography variant='c1' className='text-gray-500 leading-relaxed'>
                {module.description}
              </Typography>
            </div>
          </UnstyledLink>
        ))}
      </div>
    </AdminDashboard>
  );
}
