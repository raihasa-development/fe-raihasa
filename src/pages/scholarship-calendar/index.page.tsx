import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import 'moment/locale/id'; // Import Indonesian locale
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiFilter, FiDownload,
  FiSearch, FiX, FiInfo, FiClock, FiMapPin, FiLayers, FiFlag
} from 'react-icons/fi';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import api from '@/lib/api';
import Layout from '@/layouts/Layout';
import { ApiReturn } from '@/types/api';

moment.locale('id'); // Set locale to Indonesian
const localizer = momentLocalizer(moment);

type ScholarshipData = {
  id: string;
  nama: string;
  penyelenggara: string;
  open_registration: string;
  close_registration: string;
  link_pendaftaran: string | null;
  status_batas_usia: boolean;
  jenis: string;
  jenjang: string[];
  deskripsi: string;
  img_path: string | null;
  benefit: string;
  is_pinned: boolean;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ScholarshipData;
  isClosingSoon?: boolean;
};

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

export default function ScholarshipCalendarPage() {
  const router = useRouter();
  const [currentPage] = useState(1);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedJenjang, setSelectedJenjang] = useState<string[]>([]);
  const [selectedJenis, setSelectedJenis] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const { data: scholarshipData, isLoading } = useQuery<ApiReturn<ScholarshipData[]>>({
    queryKey: ['scholarships', currentPage, showPinnedOnly],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '1000',
        ...(showPinnedOnly && { is_pinned: 'true' }),
      });
      const response = await api.get<ApiReturn<ScholarshipData[]>>(
        `/scholarship?${params.toString()}`
      );
      return response.data;
    },
  });

  const allJenjang = useMemo(() => {
    if (!scholarshipData?.data) return [];
    const jenjangSet = new Set<string>();
    scholarshipData.data.forEach(s => s.jenjang.forEach(j => jenjangSet.add(j)));
    return Array.from(jenjangSet).sort();
  }, [scholarshipData]);

  const allJenis = useMemo(() => {
    if (!scholarshipData?.data) return [];
    const jenisSet = new Set(scholarshipData.data.map(s => s.jenis));
    return Array.from(jenisSet).sort();
  }, [scholarshipData]);

  const events: CalendarEvent[] = useMemo(() => {
    if (!scholarshipData?.data) return [];

    let filtered = scholarshipData.data;

    if (selectedJenjang.length > 0) {
      filtered = filtered.filter(s =>
        s.jenjang.some(j => selectedJenjang.includes(j))
      );
    }

    if (selectedJenis.length > 0) {
      filtered = filtered.filter(s => selectedJenis.includes(s.jenis));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.nama.toLowerCase().includes(query) ||
        s.penyelenggara.toLowerCase().includes(query)
      );
    }

    const now = new Date();

    return filtered.map((scholarship) => {
      const end = new Date(scholarship.close_registration);
      const daysUntilClose = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isClosingSoon = daysUntilClose > 0 && daysUntilClose <= 7;

      return {
        id: scholarship.id,
        title: scholarship.nama,
        start: new Date(scholarship.open_registration),
        end: end,
        resource: scholarship,
        isClosingSoon
      };
    });
  }, [scholarshipData, selectedJenjang, selectedJenis, searchQuery]);

  const monthlyStats = useMemo(() => {
    const currentMonthEvents = events.filter(e => {
      const eventMonth = e.start.getMonth();
      const eventYear = e.start.getFullYear();
      return eventMonth === selectedMonth && eventYear === selectedYear;
    });

    const now = new Date();
    const ongoing = currentMonthEvents.filter(e => now >= e.start && now <= e.end);
    const upcoming = currentMonthEvents.filter(e => now < e.start);
    const closingSoon = currentMonthEvents.filter(e => {
      const daysUntilClose = Math.ceil((e.end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilClose > 0 && daysUntilClose <= 7;
    });

    return {
      total: currentMonthEvents.length,
      ongoing: ongoing.length,
      upcoming: upcoming.length,
      closingSoon: closingSoon.length,
    };
  }, [events, selectedMonth, selectedYear]);

  const handleSelectEvent = (event: CalendarEvent) => {
    router.push(`/scholarship-recommendation/${event.id}`);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const now = new Date();
    const start = new Date(event.resource.open_registration);
    const end = new Date(event.resource.close_registration);
    const daysUntilClose = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let backgroundColor = '#3b82f6'; // Blue-500 default
    let borderColor = '#2563eb';

    if (now < start) {
      // UPCOMING
      backgroundColor = '#0ea5e9'; // Sky-500
      borderColor = '#0284c7';
    } else if (now >= start && now <= end) {
      if (daysUntilClose <= 3) {
        backgroundColor = '#ef4444'; // Red-500
        borderColor = '#dc2626';
      } else if (daysUntilClose <= 7) {
        backgroundColor = '#f59e0b'; // Amber-500
        borderColor = '#d97706';
      } else {
        backgroundColor = '#10b981'; // Emerald-500
        borderColor = '#059669';
      }
    } else {
      // CLOSED
      backgroundColor = '#64748b'; // Slate-500
      borderColor = '#475569';
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: '4px',
        opacity: 0.95,
        color: 'white',
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: '500',
        padding: '2px 6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      },
    };
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    const newDate = new Date(selectedYear, month, 1);
    setCurrentDate(newDate);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const newDate = new Date(year, selectedMonth, 1);
    setCurrentDate(newDate);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    if (direction === 'prev') {
      if (newMonth === 0) {
        newMonth = 11;
        newYear -= 1;
      } else {
        newMonth -= 1;
      }
    } else if (direction === 'next') {
      if (newMonth === 11) {
        newMonth = 0;
        newYear += 1;
      } else {
        newMonth += 1;
      }
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setCurrentDate(new Date(newYear, newMonth, 1));
  };

  const handleExportCalendar = () => {
    const now = new Date();
    const futureEvents = events.filter(e => e.end >= now);

    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Scholra//Scholarship Calendar//EN\n';

    futureEvents.forEach(event => {
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `UID:${event.id}@scholra.com\n`;
      icsContent += `DTSTART:${formatDate(event.start)}\n`;
      icsContent += `DTEND:${formatDate(event.end)}\n`;
      icsContent += `SUMMARY:${event.title}\n`;
      icsContent += `DESCRIPTION:${event.resource.penyelenggara}\\nLevels: ${event.resource.jenjang.join(', ')}\n`;
      icsContent += 'END:VEVENT\n';
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scholra-scholarships.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const EventWrapper = ({ event, children }: any) => {
    return (
      <div
        onMouseEnter={(e) => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          setHoveredEvent(event);
          setMousePosition({ x: e.clientX, y: e.clientY });
        }}
        onMouseLeave={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          hoverTimeoutRef.current = setTimeout(() => {
            setHoveredEvent(null);
          }, 150);
        }}
        className="relative h-full"
      >
        {children}
      </div>
    );
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Add global mouse leave detector for calendar area
  React.useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      const calendarElement = document.querySelector('.rbc-calendar');
      if (calendarElement && !calendarElement.contains(e.relatedTarget as Node)) {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        setHoveredEvent(null);
      }
    };

    const calendarElement = document.querySelector('.rbc-calendar');
    if (calendarElement) {
      calendarElement.addEventListener('mouseleave', handleMouseLeave as any);
    }

    return () => {
      if (calendarElement) {
        calendarElement.removeEventListener('mouseleave', handleMouseLeave as any);
      }
    };
  }, []);

  return (
    <Layout withNavbar={true} withFooter={true}>
      <SEO title="Kalender Beasiswa | Scholra" />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        
        .animate-fadeIn {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Calendar Updates */
        .rbc-calendar {
            font-family: 'Poppins', sans-serif;
        }
        .rbc-header {
            padding: 16px 8px;
            font-weight: 600;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            color: #64748b;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
        }
        .rbc-month-view {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            background: white;
        }
        .rbc-day-bg + .rbc-day-bg {
            border-left: 1px solid #f1f5f9;
        }
        .rbc-month-row + .rbc-month-row {
            border-top: 1px solid #f1f5f9;
        }
        .rbc-today {
            background-color: #f0f9ff !important;
        }
        .rbc-off-range-bg {
            background-color: #fcfcfc;
        }
        .rbc-event {
            padding: 2px 4px !important;
            margin: 1px 0;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .rbc-event:focus {
            outline: none;
        }
        .rbc-current-time-indicator {
            background-color: #1B7691;
        }
        
        /* Modern Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <main className="min-h-screen bg-[#F8FAFC] pb-20 pt-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-8 bg-[#1B7691] rounded-full"></div>
                <span className="text-sm font-bold text-[#1B7691] uppercase tracking-wider">Jadwal & Perencanaan</span>
              </div>
              <Typography className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Kalender Beasiswa
              </Typography>
              <Typography className="text-gray-500 mt-2 max-w-xl">
                Pantau tenggat waktu beasiswa impianmu. Visualisasikan perjalanan beasiswamu dan jangan pernah lewatkan kesempatan lagi.
              </Typography>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCalendar}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 bg-white text-gray-700 border border-gray-200 hover:border-[#1B7691] hover:text-[#1B7691] shadow-sm hover:shadow-md"
              >
                <FiDownload />
                Ekspor Kalender
              </button>
              <div className="h-8 w-[1px] bg-gray-300 mx-1 hidden md:block"></div>
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center">
                <button
                  onClick={() => setShowPinnedOnly(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!showPinnedOnly ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setShowPinnedOnly(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${showPinnedOnly ? 'bg-[#1B7691] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FiFilter className="w-4 h-4" /> Disimpan
                </button>
              </div>
            </div>
          </div>

          {/* Controls & Filters Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Search - Col Span 4 */}
              <div className="lg:col-span-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Cari Beasiswa</label>
                <div className="relative group">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1B7691] transition-colors" />
                  <input
                    type="text"
                    placeholder="Ketik nama beasiswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1B7691] focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters - Col Span 8 */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Jenjang</label>
                  <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 custom-scrollbar">
                    {allJenjang.map(jenjang => (
                      <button
                        key={jenjang}
                        onClick={() => setSelectedJenjang(prev => prev.includes(jenjang) ? prev.filter(j => j !== jenjang) : [...prev, jenjang])}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedJenjang.includes(jenjang)
                            ? 'bg-[#1B7691] border-[#1B7691] text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {jenjang}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Jenis</label>
                  <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 custom-scrollbar">
                    {allJenis.map(jenis => (
                      <button
                        key={jenis}
                        onClick={() => setSelectedJenis(prev => prev.includes(jenis) ? prev.filter(j => j !== jenis) : [...prev, jenis])}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedJenis.includes(jenis)
                            ? 'bg-[#1B7691] border-[#1B7691] text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {jenis}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* LEFT SIDEBAR: Calendar Controls & Legend */}
            <div className="lg:col-span-1 space-y-6">

              {/* Navigation Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">Navigasi</h3>
                  <button
                    onClick={() => {
                      const today = new Date();
                      setSelectedMonth(today.getMonth());
                      setSelectedYear(today.getFullYear());
                      setCurrentDate(today);
                    }}
                    className="text-xs font-bold text-[#1B7691] hover:underline"
                  >
                    Hari Ini
                  </button>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl mb-4">
                  <button onClick={() => handleNavigate('prev')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                    <FiChevronLeft />
                  </button>
                  <div className="flex flex-col items-center">
                    <select
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                      className="bg-transparent font-bold text-gray-900 text-sm focus:outline-none cursor-pointer text-center"
                    >
                      {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(parseInt(e.target.value))}
                      className="bg-transparent text-xs text-gray-500 focus:outline-none cursor-pointer text-center"
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button onClick={() => handleNavigate('next')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                    <FiChevronRight />
                  </button>
                </div>

                {/* Stats for selected month */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1">Akan Datang</p>
                    <p className="text-2xl font-bold text-blue-800">{monthlyStats.upcoming}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-600 font-medium mb-1">Segera Tutup</p>
                    <p className="text-2xl font-bold text-amber-800">{monthlyStats.closingSoon}</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Keterangan</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span className="text-sm text-gray-600">Masa Aktif</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                    <span className="text-sm text-gray-600">Segera Tutup (≤ 7 hari)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span className="text-sm text-gray-600">Mendesak (≤ 3 hari)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div>
                    <span className="text-sm text-gray-600">Akan Dibuka</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#64748b]"></div>
                    <span className="text-sm text-gray-600 opacity-60">Ditutup</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT CONTENT: Calendar */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-200 p-8 h-[800px] relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-3xl">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1B7691]"></div>
                      <p className="mt-4 text-gray-500 font-medium text-sm">Memuat data kalender...</p>
                    </div>
                  </div>
                ) : null}

                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  view="month"
                  date={currentDate}
                  onNavigate={setCurrentDate}
                  views={['month']}
                  popup
                  showMultiDayTimes
                  toolbar={false}
                  components={{
                    eventWrapper: EventWrapper,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hover Tooltip (Portal Lookalike) */}
          {hoveredEvent && (
            <div
              className="fixed z-[999] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[#e2e8f0] p-5 w-[320px] pointer-events-none animate-fadeIn"
              style={{
                left: `${Math.min(mousePosition.x + 20, window.innerWidth - 340)}px`,
                top: `${Math.min(Math.max(mousePosition.y - 100, 20), window.innerHeight - 300)}px`,
              }}
            >
              {/* Header Accents based on status */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${hoveredEvent.isClosingSoon ? 'bg-[#f59e0b]' : 'bg-[#1B7691]'
                }`}></div>

              <div className="mt-2">
                <div className="flex items-start justify-between">
                  <Typography className="font-bold text-gray-900 leading-tight pr-4">
                    {hoveredEvent.title}
                  </Typography>
                  {hoveredEvent.isClosingSoon && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold whitespace-nowrap">Segera Berakhir</span>
                  )}
                </div>

                <div className="mt-3 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <FiFlag className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Penyelenggara</p>
                      <p className="text-sm font-medium text-gray-800">{hoveredEvent.resource.penyelenggara}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <FiLayers className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Detail</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                          {hoveredEvent.resource.jenis}
                        </span>
                        {hoveredEvent.resource.jenjang.slice(0, 2).map(j => (
                          <span key={j} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                            {j}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2 border-t border-gray-100">
                    <FiClock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Waktu</p>
                      <p className="text-sm text-gray-700">
                        {moment(hoveredEvent.start).format('DD MMM')} — {moment(hoveredEvent.end).format('DD MMM YYYY')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <span className="text-xs font-bold text-[#1B7691] flex items-center gap-1">
                    Lihat Detail <FiChevronRight />
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </Layout>
  );
}
