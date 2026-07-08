import React, { useState, useEffect } from 'react';
import { 
  FiTarget, FiAward, FiClock, FiActivity, FiSearch, 
  FiExternalLink, FiMessageCircle, FiHeart, FiMessageSquare, FiBookOpen 
} from 'react-icons/fi';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, AreaChart, Area
} from 'recharts';

import withAuth from '@/components/hoc/withAuth';
import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import AdminDashboard from '@/layouts/AdminDashboard';
import api from '@/lib/api';

const COLORS = ['#FB991A', '#EF4444', '#6366F1', '#9CA3AF', '#10B981'];

function CRMAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const fetchCRM = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/auth/admin/crm-analytics');
        setData(response.data?.data || null);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch CRM analytics:', err);
        setError('Gagal memuat data CRM. Coba periksa koneksi internet Anda.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCRM();
  }, []);

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  };

  // RFM Chart data mapping
  const rfmChartData = data?.rfmSegments ? [
    { name: 'Champions (Aktif + Premium)', value: data.rfmSegments.champions },
    { name: 'At-Risk (Premium Dormant)', value: data.rfmSegments.atRisk },
    { name: 'Newbies (User Baru)', value: data.rfmSegments.newbies },
    { name: 'Pasif (Dormant)', value: data.rfmSegments.pasif },
    { name: 'Lainnya (Umum Aktif)', value: data.rfmSegments.others },
  ].filter(item => item.value > 0) : [];

  // Interest data mapping
  const interestData = data?.interestClustering || [];

  // Aggregate heatmap data by hour (0-23)
  const hourlyChartData = data?.peakActivityHeatmap ? Array.from({ length: 24 }, (_, hour) => {
    const totalForHour = data.peakActivityHeatmap
      ?.filter((item: any) => item.hour === hour)
      ?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
    return {
      hour: `${String(hour).padStart(2, '0')}:00`,
      'Aktivitas': totalForHour,
    };
  }) : [];

  return (
    <AdminDashboard withSidebar>
      <SEO title="CRM Analytics - Admin Raih Asa" description="CRM Analytics & User Retention Dashboard" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-8">
        <div>
          <Typography variant="h4" className="font-extrabold text-gray-900 leading-tight">
            Raih Asa CRM & Gamifikasi Analytics
          </Typography>
          <Typography className="text-gray-500 text-xs font-semibold mt-1">
            Analisis segmentasi perilaku (RFM), keaktifan (XP), dan prospek konversi (Hot Leads) user secara mendalam.
          </Typography>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="bg-gray-150 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 self-start md:self-auto"
        >
          {showGuide ? 'Sembunyikan Panduan' : 'Panduan Rumus & Metrik'}
        </button>
      </div>

      {showGuide && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs mb-8 space-y-6 animate-fadeIn">
          <h3 className="text-sm font-black text-gray-800 border-b pb-3 uppercase tracking-wider">
            Legenda & Rumus Kalkulasi Metrik CRM
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-650 leading-relaxed">
            {/* RFM Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#FB991A] flex items-center gap-1 uppercase tracking-wide">
                Segmentasi Bisnis RFM
              </h4>
              <p className="text-[11px] text-gray-400 font-semibold leading-normal">
                Mengelompokkan pengguna berdasarkan tiga aspek utama: Recency (waktu aktif terakhir), Frequency (jumlah aktivitas), dan Monetary (nilai transaksi).
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                <li><strong className="text-gray-800">Champions</strong>: Aktif &le; 7 hari terakhir, total tindakan &ge; 20 kali, dan memiliki transaksi berbayar (Paid).</li>
                <li><strong className="text-gray-800">At-Risk</strong>: Pasif &gt; 14 hari terakhir, total tindakan &ge; 15 kali, dan memiliki transaksi berbayar (Paid).</li>
                <li><strong className="text-gray-800">Newbies</strong>: Terdaftar &le; 7 hari terakhir, total tindakan &lt; 15 kali, dan belum pernah membeli produk berbayar.</li>
                <li><strong className="text-gray-800">Pasif</strong>: Terdaftar &gt; 7 hari lalu, total tindakan &lt; 10 kali, dan belum memiliki transaksi berbayar.</li>
              </ul>
            </div>

            {/* XP Column */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l md:border-r border-gray-100 pt-4 md:pt-0 md:px-6">
              <h4 className="font-bold text-yellow-600 flex items-center gap-1 uppercase tracking-wide">
                Gamifikasi XP & Leveling
              </h4>
              <p className="text-[11px] text-gray-400 font-semibold leading-normal">
                XP (Experience Points) diakumulasikan dari riwayat aksi aktivitas pengguna dengan bobot bobot nilai sebagai berikut:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                <li><strong className="text-gray-800">Menyelesaikan Scholra</strong>: +50 XP</li>
                <li><strong className="text-gray-800">Membuat Postingan Forum</strong>: +30 XP</li>
                <li><strong className="text-gray-800">Membalas Obrolan Forum</strong>: +20 XP</li>
                <li><strong className="text-gray-800">Mengakses Modul Kelas</strong>: +20 XP</li>
                <li><strong className="text-gray-800">Membuka Halaman Utama / Like</strong>: +5 XP</li>
              </ul>
              <p className="text-[10px] text-gray-400 italic font-semibold">
                Badge Level: Level 1 (Novice, &le;100), Level 2 (Seeker, &le;300), Level 3 (Challenger, &le;600), Level 4 (Expert, &le;1200), Level 5 (Legend, &gt;1200).
              </p>
            </div>

            {/* Hot Leads Column */}
            <div className="space-y-3 border-t md:border-t-0 pt-4 md:pt-0">
              <h4 className="font-bold text-red-500 flex items-center gap-1 uppercase tracking-wide">
                Hot Leads Detector
              </h4>
              <p className="text-[11px] text-gray-400 font-semibold leading-normal">
                Mendeteksi pengguna non-premium (gratisan) teraktif dengan kecenderungan membeli tinggi berdasarkan sinyal aktivitas mereka:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                <li><strong className="text-gray-800">Akses Halaman Pembayaran / Harga</strong>: +20 Poin per kunjungan</li>
                <li><strong className="text-gray-800">Menyelesaikan Tes Rekomendasi Scholra</strong>: +30 Poin</li>
                <li><strong className="text-gray-800">Belajar Modul Kelas (BISA Learning)</strong>: +10 Poin per interaksi</li>
              </ul>
              <p className="text-[10px] text-gray-400 font-semibold">
                Urutan teratas merepresentasikan leads potensial untuk ditawarkan diskon khusus atau dibantu secara personal via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1B7691] border-t-transparent mb-4"></div>
          <Typography className="text-gray-400 text-xs font-bold uppercase tracking-widest">Menghitung metrik CRM level dewa...</Typography>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-bold text-sm bg-red-50 rounded-2xl p-6 border border-red-150">
          {error}
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-400 font-bold text-sm bg-white rounded-2xl border border-gray-100 shadow-xs">
          Belum ada data aktivitas terkumpul untuk dianalisis.
        </div>
      ) : (
        <div className="space-y-10 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-[#1B7691] rounded-xl flex items-center justify-center shrink-0">
                      <FiBookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total User</p>
                      <p className="text-xl font-extrabold text-gray-900">{data?.summary?.totalUsersCount || 0}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Pengguna terdaftar</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <FiActivity className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">User Aktif (XP &gt; 0)</p>
                      <p className="text-xl font-extrabold text-gray-900">{data?.summary?.activeUsersCount || 0}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Aktif melakukan interaksi</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                      <FiTarget className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hot Leads (Prospek)</p>
                      <p className="text-xl font-extrabold text-gray-900">{data?.summary?.totalHotLeadsCount || 0}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Sinyal ketertarikan beli tinggi</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-[#FB991A] rounded-xl flex items-center justify-center shrink-0">
                      <FiAward className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rerata Keterlibatan</p>
                      <p className="text-xl font-extrabold text-gray-900">{data?.summary?.averageXP || 0} XP</p>
                      <p className="text-[10px] text-gray-400 font-medium">Rata-rata level keaktifan user</p>
                    </div>
                  </div>
                </div>

                {/* Section 1: RFM Segmentation & Recommendations */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gray-800 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <FiTarget className="text-[#FB991A]" /> Segmentasi Status Keaktifan (RFM)
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold mb-4 leading-relaxed">
                        Pengelompokan otomatis berdasarkan hari aktif terakhir (Recency), frekuensi interaksi (Frequency), dan total transaksi (Monetary).
                      </p>
                    </div>

                    <div className="h-64 relative flex items-center justify-center">
                      {rfmChartData.length === 0 ? (
                        <p className="text-xs text-gray-400 font-semibold">Belum ada user yang dapat diklasifikasikan.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={rfmChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {rfmChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip 
                              contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: 'bold' }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      <div className="absolute text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Total User</p>
                        <p className="text-lg font-black text-gray-800">{data?.summary?.totalUsersCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Explanations */}
                  <div className="flex-1 flex flex-col justify-center space-y-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Definisi Segmen & Tindakan Rekomendasi
                    </h5>
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1.5 custom-scrollbar">
                      {/* Champions */}
                      <div className="flex items-start gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#FB991A] mt-1 shrink-0" />
                        <div className="text-xs">
                          <div className="flex items-center gap-2 font-bold text-gray-800">
                            <span>Champions (Premium Aktif)</span>
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-black">{data?.rfmSegments?.champions || 0} User</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                            User premium yang aktif dalam 7 hari terakhir.
                            <span className="text-[#1B7691] font-black block mt-0.5">Rekomendasi: Berikan insentif/token bonus forum, minta testimoni kesuksesan, atau tawarkan program afiliasi.</span>
                          </p>
                        </div>
                      </div>

                      {/* At-Risk */}
                      <div className="flex items-start gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#EF4444] mt-1 shrink-0" />
                        <div className="text-xs">
                          <div className="flex items-center gap-2 font-bold text-gray-800">
                            <span>At-Risk (Premium Pasif)</span>
                            <span className="text-[10px] bg-red-50 text-red-750 px-1.5 py-0.2 rounded font-black">{data?.rfmSegments?.atRisk || 0} User</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                            User premium yang sudah tidak aktif &gt; 14 hari.
                            <span className="text-[#1B7691] font-black block mt-0.5">Rekomendasi: Kirim pesan re-engagement via WhatsApp secara personal untuk menanyakan kendala atau tawarkan bantuan belajar.</span>
                          </p>
                        </div>
                      </div>

                      {/* Newbies */}
                      <div className="flex items-start gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#6366F1] mt-1 shrink-0" />
                        <div className="text-xs">
                          <div className="flex items-center gap-2 font-bold text-gray-800">
                            <span>Newbies (User Baru)</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-black">{data?.rfmSegments?.newbies || 0} User</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                            Baru mendaftar &le; 7 hari lalu dan belum membeli paket premium.
                            <span className="text-[#1B7691] font-black block mt-0.5">Rekomendasi: Kirim email panduan penggunaan kelas Bisa Learning gratis atau ajak mencoba fitur rekomendasi Scholra.</span>
                          </p>
                        </div>
                      </div>

                      {/* Pasif */}
                      <div className="flex items-start gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#9CA3AF] mt-1 shrink-0" />
                        <div className="text-xs">
                          <div className="flex items-center gap-2 font-bold text-gray-800">
                            <span>Pasif (User Dormant)</span>
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded font-black">{data?.rfmSegments?.pasif || 0} User</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                            User gratisan terdaftar lama yang pasif &gt; 7 hari.
                            <span className="text-[#1B7691] font-black block mt-0.5">Rekomendasi: Jalankan win-back campaign berupa penawaran diskon paket booster / mentoring terbatas via WhatsApp.</span>
                          </p>
                        </div>
                      </div>

                      {/* Lainnya */}
                      <div className="flex items-start gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#10B981] mt-1 shrink-0" />
                        <div className="text-xs">
                          <div className="flex items-center gap-2 font-bold text-gray-800">
                            <span>Lainnya (Umum Aktif)</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-black">{data?.rfmSegments?.others || 0} User</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                            User gratisan yang aktif di forum atau kelas gratis.
                            <span className="text-[#1B7691] font-black block mt-0.5">Rekomendasi: Ajak upgrade ke premium dengan menawarkan kupon diskon eksklusif dan tonjolkan benefit mentorship.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Interest & Peak Hours Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Interest Clustering Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gray-800 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <FiActivity className="text-indigo-500" /> Kluster Minat Pengguna (Interests)
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold mb-4 leading-relaxed">
                        Fokus ketertarikan utama pengguna di platform berdasarkan pola klik halaman dan akses modul.
                      </p>
                    </div>

                    <div className="h-64 relative flex items-center justify-center">
                      {interestData.length === 0 ? (
                        <p className="text-xs text-gray-400 font-semibold">Belum ada data kluster minat.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={interestData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <ChartTooltip 
                              contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: 'bold' }} 
                            />
                            <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]}>
                              {interestData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#1B7691' : index === 1 ? '#6366F1' : '#EC4899'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="mt-4 space-y-2.5 border-t border-gray-50 pt-3">
                      {interestData.map((item: any, idx: number) => (
                        <div key={item.name} className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: idx === 0 ? '#1B7691' : idx === 1 ? '#6366F1' : '#EC4899' }} />
                            {item.name}
                          </span>
                          <span className="font-bold text-gray-900">{item.count} User ({item.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peak Hours & Broadcast Advice */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gray-800 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <FiClock className="text-[#1B7691]" /> Waktu Puncak Aktivitas & Broadcast Advice
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold mb-4 leading-relaxed">
                        Heatmap aktivitas seluruh pengguna diakumulasikan per jam untuk memetakan kurva waktu keaktifan tertinggi sepanjang hari.
                      </p>
                    </div>

                    <div className="h-60 w-full relative flex items-center justify-center">
                      {hourlyChartData.length === 0 ? (
                        <p className="text-xs text-gray-400 font-semibold">Belum ada data aktivitas per jam.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1B7691" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#1B7691" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="hour" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <ChartTooltip 
                              contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px', fontWeight: 'bold' }} 
                            />
                            <Area type="monotone" dataKey="Aktivitas" stroke="#1B7691" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="p-3 bg-blue-50/50 border border-blue-150 rounded-xl text-[10px] font-bold text-gray-700 leading-relaxed mt-4">
                      {data.peakHoursAdvice}
                    </div>
                  </div>
                </div>

                {/* Section 3: Hot Leads Detector (Sales Pipeline) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex flex-col mb-4">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FiTarget className="text-red-500" /> Hot Leads Detector (Prospek Konversi Booster)
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      User non-premium teraktif yang menunjukkan sinyal ketertarikan tinggi terhadap layanan berbayar (CV/Essay/Interview Boost) berdasarkan pemicu halaman harga/pembayaran.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-gray-600">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="p-3 w-12 text-center">Rank</th>
                          <th className="p-3">Nama Lengkap</th>
                          <th className="p-3">Kontak Whatsapp</th>
                          <th className="p-3 text-center">Skor Minat</th>
                          <th className="p-3">Terakhir Aktif</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.hotLeads.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-gray-400 font-medium">Belum terdeteksi adanya prospek panas saat ini.</td>
                          </tr>
                        ) : (
                          data.hotLeads.map((lead: any, idx: number) => {
                            const waLink = lead.whatsapp 
                              ? `https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(lead.name)},%20kami%20dari%20Raih%20Asa%20melihat%20kamu%20sedang%20mempersiapkan Beasiswa.%20Butuh%20bantuan%20review%20CV%20atau%20Essay%3F%20%F0%9F%9A%80`
                              : null;

                            return (
                              <tr key={lead.id} className="hover:bg-gray-50/20 font-medium">
                                <td className="p-3 text-center text-red-500 font-black">{idx + 1}</td>
                                <td className="p-3">
                                  <p className="font-bold text-gray-800">{lead.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{lead.email}</p>
                                </td>
                                <td className="p-3 font-mono text-gray-600 font-bold">{lead.whatsapp || '-'}</td>
                                <td className="p-3 text-center">
                                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-750 border border-red-100 text-[10px] font-black">
                                    {lead.score} Poin
                                  </span>
                                </td>
                                <td className="p-3 text-gray-450 text-[10px] font-bold">{formatDate(lead.lastActive)}</td>
                                <td className="p-3 text-center flex items-center justify-center gap-2">
                                  {waLink ? (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors"
                                    >
                                      <FiMessageCircle className="w-3.5 h-3.5" /> Chat WA
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 font-bold shrink-0">No WA Kosong</span>
                                  )}
                                  <a
                                    href={`/admin/users?activityEmail=${encodeURIComponent(lead.email)}`}
                                    className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-[#1B7691] border border-blue-200 px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors shrink-0"
                                  >
                                    <FiActivity className="w-3.5 h-3.5" /> Detail Log
                                  </a>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 4: Gamification Leaderboard */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex flex-col mb-4">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FiAward className="text-yellow-500" /> Leaderboard Keaktifan Pengguna (Gamifikasi XP & Peringkat)
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      Pengguna teraktif yang dihitung secara dinamis berdasarkan total perolehan XP mereka dari log aktivitas.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-gray-600">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="p-3 w-12 text-center">Peringkat</th>
                          <th className="p-3">Nama & Akun</th>
                          <th className="p-3 text-center">Level & Gelar</th>
                          <th className="p-3 text-right">Akumulasi XP</th>
                          <th className="p-3 text-center">Total Aktivitas</th>
                          <th className="p-3">Aktivitas Terakhir</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                        {data.leaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-gray-400 font-medium">Belum ada aktivitas user yang terekam.</td>
                          </tr>
                        ) : (
                          data.leaderboard.map((user: any, idx: number) => {
                            const isLegend = user.level === 5;
                            const isExpert = user.level === 4;
                            const isChallenger = user.level === 3;
                            
                            const badgeClass = isLegend 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : isExpert 
                              ? 'bg-blue-50 text-blue-800 border-blue-200' 
                              : isChallenger 
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                              : 'bg-gray-100 text-gray-700 border-gray-200';

                            return (
                              <tr key={user.id} className="hover:bg-gray-50/20 font-medium">
                                <td className="p-3 text-center">
                                  <span className={`inline-block w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                    idx === 0 ? 'bg-yellow-100 text-yellow-800 font-black' : 
                                    idx === 1 ? 'bg-slate-100 text-slate-700' : 
                                    idx === 2 ? 'bg-amber-50 text-amber-700' : 'text-gray-400'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <p className="font-bold text-gray-800">{user.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black ${badgeClass}`}>
                                    Lvl {user.level} - {user.title}
                                  </span>
                                </td>
                                <td className="p-3 text-right font-black text-gray-800">{user.xp.toLocaleString('id-ID')} XP</td>
                                <td className="p-3 text-center text-gray-600 font-bold">{user.totalActions} Aksi</td>
                                <td className="p-3 text-gray-450 text-[10px] font-bold">{formatDate(user.lastActive)}</td>
                                <td className="p-3 text-center">
                                  <a
                                    href={`/admin/users?activityEmail=${encodeURIComponent(user.email)}`}
                                    className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-[#1B7691] border border-blue-200 px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors"
                                  >
                                    <FiActivity className="w-3.5 h-3.5" /> Detail Log
                                  </a>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
    </AdminDashboard>
  );
}

export default withAuth(CRMAnalyticsPage, 'admin');
