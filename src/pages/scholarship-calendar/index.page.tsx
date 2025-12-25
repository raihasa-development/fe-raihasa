import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiFilter, FiDownload, FiSearch, FiX, FiAlertCircle, FiClock } from 'react-icons/fi';

import SEO from '@/components/SEO';
import Typography from '@/components/Typography';
import api from '@/lib/api';
import Layout from '@/layouts/Layout';
import { ApiReturn } from '@/types/api';

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
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

export default function ScholarshipCalendarPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
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

    // Filter by jenjang
    if (selectedJenjang.length > 0) {
      filtered = filtered.filter(s => 
        s.jenjang.some(j => selectedJenjang.includes(j))
      );
    }

    // Filter by jenis
    if (selectedJenis.length > 0) {
      filtered = filtered.filter(s => selectedJenis.includes(s.jenis));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.nama.toLowerCase().includes(query) ||
        s.penyelenggara.toLowerCase().includes(query)
      );
    }

    return filtered.map((scholarship) => ({
      id: scholarship.id,
      title: scholarship.nama,
      start: new Date(scholarship.open_registration),
      end: new Date(scholarship.close_registration),
      resource: scholarship,
    }));
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
    
    let backgroundColor = '#1B7691';
    
    if (now < start) {
      // UPCOMING
      backgroundColor = '#1B7691';
    } else if (now >= start && now <= end) {
      // Closing soon - orange/red gradient
      if (daysUntilClose <= 3) {
        backgroundColor = '#ef4444'; // red
      } else if (daysUntilClose <= 7) {
        backgroundColor = '#f59e0b'; // amber
      } else {
        backgroundColor = '#10b981'; // green
      }
    } else {
      // CLOSED
      backgroundColor = '#9ca3af';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.95,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.8125rem',
        fontWeight: '600',
        padding: '2px 6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
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
    
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Raihasa//Scholarship Calendar//EN\n';
    
    futureEvents.forEach(event => {
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `UID:${event.id}@raihasa.com\n`;
      icsContent += `DTSTART:${formatDate(event.start)}\n`;
      icsContent += `DTEND:${formatDate(event.end)}\n`;
      icsContent += `SUMMARY:${event.title}\n`;
      icsContent += `DESCRIPTION:${event.resource.penyelenggara}\\nJenjang: ${event.resource.jenjang.join(', ')}\n`;
      icsContent += 'END:VEVENT\n';
    });
    
    icsContent += 'END:VCALENDAR';
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raihasa-scholarships.ics';
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
      <SEO title="Scholarship Calendar | Raihasa" />
      <main className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-primary-blue to-primary-orange rounded-2xl shadow-lg">
                  <FiCalendar className="text-white text-2xl" />
                </div>
                <div>
                  <Typography variant="h3" weight="bold" className="text-gray-900">
                    Scholarship Calendar
                  </Typography>
                  <Typography className="text-gray-600 mt-1">
                    Track all scholarship deadlines in one place
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCalendar}
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 bg-white text-gray-700 border border-gray-200 hover:border-primary-blue hover:bg-gray-50 shadow-sm"
                  title="Export to Calendar"
                >
                  <FiDownload />
                  Export
                </button>
                
                <button
                  onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
                    showPinnedOnly
                      ? 'bg-gradient-to-r from-primary-blue to-primary-orange text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-blue hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <FiFilter className={showPinnedOnly ? 'animate-pulse' : ''} />
                  {showPinnedOnly ? 'Pinned' : 'All'}
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search scholarships by name or organizer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-3">
                {/* Jenjang Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">
                    Education Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allJenjang.map(jenjang => (
                      <button
                        key={jenjang}
                        onClick={() => {
                          setSelectedJenjang(prev =>
                            prev.includes(jenjang)
                              ? prev.filter(j => j !== jenjang)
                              : [...prev, jenjang]
                          );
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedJenjang.includes(jenjang)
                            ? 'bg-gradient-to-r from-primary-blue to-primary-orange text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {jenjang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jenis Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">
                    Scholarship Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allJenis.map(jenis => (
                      <button
                        key={jenis}
                        onClick={() => {
                          setSelectedJenis(prev =>
                            prev.includes(jenis)
                              ? prev.filter(j => j !== jenis)
                              : [...prev, jenis]
                          );
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedJenis.includes(jenis)
                            ? 'bg-gradient-to-r from-primary-blue to-primary-orange text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {jenis}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedJenjang.length > 0 || selectedJenis.length > 0 || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedJenjang([]);
                    setSelectedJenis([]);
                    setSearchQuery('');
                  }}
                  className="text-sm text-primary-blue hover:text-primary-orange font-medium transition-colors flex items-center gap-1"
                >
                  <FiX className="text-xs" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Monthly Stats Alert */}
          {monthlyStats.closingSoon > 0 && (
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-amber-600 text-2xl flex-shrink-0" />
                <div>
                  <Typography className="font-bold text-amber-900">
                    {monthlyStats.closingSoon} scholarship{monthlyStats.closingSoon > 1 ? 's' : ''} closing soon!
                  </Typography>
                  <Typography className="text-sm text-amber-700">
                    Deadline within 7 days for {months[selectedMonth]} {selectedYear}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {/* Navigation & Filter Controls */}
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Month/Year Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavigate('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiChevronLeft className="text-gray-600 text-xl" />
                </button>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all cursor-pointer"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all cursor-pointer"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleNavigate('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiChevronRight className="text-gray-600 text-xl" />
                </button>

                <button
                  onClick={() => {
                    const today = new Date();
                    setSelectedMonth(today.getMonth());
                    setSelectedYear(today.getFullYear());
                    setCurrentDate(today);
                  }}
                  className="ml-2 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-orange text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm"
                >
                  Today
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 flex-wrap">
                <Typography className="text-sm font-semibold text-gray-500">
                  Status:
                </Typography>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <Typography className="text-sm text-gray-700 font-medium">
                    Ongoing
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                  <Typography className="text-sm text-gray-700 font-medium">
                    Closing Soon
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  <Typography className="text-sm text-gray-700 font-medium">
                    Last Days
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-blue rounded-full shadow-sm"></div>
                  <Typography className="text-sm text-gray-700 font-medium">
                    Upcoming
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full shadow-sm"></div>
                  <Typography className="text-sm text-gray-700 font-medium">
                    Closed
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* This Month Stats */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <Typography className="text-xs text-gray-500 font-medium mb-1">
                This Month
              </Typography>
              <Typography className="text-2xl font-bold text-gray-900">
                {monthlyStats.total}
              </Typography>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <Typography className="text-xs text-gray-500 font-medium mb-1">
                Ongoing
              </Typography>
              <Typography className="text-2xl font-bold text-green-600">
                {monthlyStats.ongoing}
              </Typography>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <Typography className="text-xs text-gray-500 font-medium mb-1">
                Upcoming
              </Typography>
              <Typography className="text-2xl font-bold text-blue-600">
                {monthlyStats.upcoming}
              </Typography>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Typography className="text-xs text-gray-500 font-medium">
                  Closing Soon
                </Typography>
                {monthlyStats.closingSoon > 0 && (
                  <FiClock className="text-amber-500 text-sm animate-pulse" />
                )}
              </div>
              <Typography className="text-2xl font-bold text-amber-600">
                {monthlyStats.closingSoon}
              </Typography>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200"></div>
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-blue border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <Typography className="text-gray-600 font-medium">
                    Loading scholarships...
                  </Typography>
                </div>
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
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
                tooltipAccessor={(event: CalendarEvent) => {
                  const now = new Date();
                  const daysUntilClose = Math.ceil((event.end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  let urgency = '';
                  if (daysUntilClose > 0 && daysUntilClose <= 7) {
                    urgency = ` ⚠️ Closes in ${daysUntilClose} day${daysUntilClose > 1 ? 's' : ''}!`;
                  }
                  return `${event.title}\n${event.resource.penyelenggara}\nJenjang: ${event.resource.jenjang.join(', ')}${urgency}`;
                }}
              />
            )}
          </div>

          {/* Hover Tooltip */}
          {hoveredEvent && (
            <div
              className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm pointer-events-none animate-fadeIn"
              style={{
                left: `${Math.min(mousePosition.x + 20, window.innerWidth - 350)}px`,
                top: `${Math.max(mousePosition.y - 100, 10)}px`,
              }}
            >
              <Typography className="font-bold text-gray-900 mb-2">
                {hoveredEvent.title}
              </Typography>
              <div className="space-y-1 text-sm">
                <Typography className="text-gray-600">
                  <span className="font-semibold">Organizer:</span> {hoveredEvent.resource.penyelenggara}
                </Typography>
                <Typography className="text-gray-600">
                  <span className="font-semibold">Level:</span> {hoveredEvent.resource.jenjang.join(', ')}
                </Typography>
                <Typography className="text-gray-600">
                  <span className="font-semibold">Type:</span> {hoveredEvent.resource.jenis}
                </Typography>
                <Typography className="text-gray-600">
                  <span className="font-semibold">Period:</span> {moment(hoveredEvent.start).format('MMM DD')} - {moment(hoveredEvent.end).format('MMM DD, YYYY')}
                </Typography>
                {(() => {
                  const now = new Date();
                  const daysUntilClose = Math.ceil((hoveredEvent.end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  if (daysUntilClose > 0 && daysUntilClose <= 7) {
                    return (
                      <div className="flex items-center gap-1 text-amber-600 font-semibold pt-1">
                        <FiAlertCircle />
                        <span>Closes in {daysUntilClose} day{daysUntilClose > 1 ? 's' : ''}!</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <Typography className="text-xs text-gray-400 mt-2 italic">
                Click to view details
              </Typography>
            </div>
          )}

          
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 12px 8px;
          font-weight: 700;
          color: #1f2937;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
          border-bottom: 2px solid #e5e7eb;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .rbc-today {
          background-color: #dbeafe !important;
        }
        .rbc-date-cell {
          padding: 8px;
          text-align: center;
        }
        .rbc-date-cell.rbc-now {
          font-weight: 700;
          color: #1b7691;
        }
        .rbc-event {
          padding: 3px 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
          opacity: 1 !important;
        }
        .rbc-event-content {
          font-weight: 600;
          font-size: 0.8125rem;
        }
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
        .rbc-month-row {
          border-color: #f3f4f6;
          min-height: 100px;
        }
        .rbc-day-bg {
          border-color: #f3f4f6;
          transition: background-color 0.2s ease;
        }
        .rbc-day-bg:hover {
          background-color: #f9fafb;
        }
        .rbc-off-range {
          color: #d1d5db;
        }
        .rbc-off-range-bg {
          background: #fafafa;
        }
        .rbc-show-more {
          background-color: transparent;
          color: #1b7691;
          font-weight: 600;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .rbc-show-more:hover {
          background-color: #dbeafe;
          text-decoration: none;
        }
        .rbc-overlay {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
        }
        .rbc-overlay-header {
          background: linear-gradient(135deg, #1b7691 0%, #f58220 100%);
          color: white;
          padding: 12px 16px;
          font-weight: 700;
          border-radius: 12px 12px 0 0;
        }
      `}</style>
    </Layout>
  );
}
