'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSend, FiUser, FiChevronDown } from 'react-icons/fi';
import Typography from '@/components/Typography';
import { ChatMessage, ScholarshipRecommendationDisplay, RekomendasiBeasiswaRequest } from '../types/type';
import { useRouter } from 'next/router';

interface ChatboxProps {
  onRecommendation?: (recommendations: ScholarshipRecommendationDisplay[]) => void;
}

// All Indonesian provinces
const PROVINCES = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi',
  'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
  'Kepulauan Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah',
  'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat',
  'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah',
  'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Gorontalo', 'Sulawesi Barat', 'Maluku', 'Maluku Utara', 'Papua Barat',
  'Papua', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan'
];

type QuestionId = 'gender' | 'age' | 'provinsi' | 'degree' | 'semester' | 'nilai' | 'scholarshipType' | 'statusBeasiswaAktif' | 'statusKeluargaTidakMampu' | 'statusDisabilitas' | 'custom';

interface QuestionFlow {
  id: QuestionId;
  question: string;
  type: 'options' | 'text' | 'dropdown' | 'number';
  options?: string[];
  placeholder?: string;
  validation?: (value: string, userData: UserData) => string | null;
  condition?: (userData: UserData) => boolean;
}

interface UserData {
  gender?: string;
  age?: string;
  provinsi?: string;
  degree?: string;
  semester?: string;
  nilai?: string;
  scholarshipType?: string;
  statusBeasiswaAktif?: string;
  statusKeluargaTidakMampu?: string;
  statusDisabilitas?: string;
  custom?: string;
}

export default function Chatbox({ onRecommendation }: ChatboxProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Selamat datang di Scholra AI. Saya akan membantu mencari beasiswa yang sesuai dengan profil Anda. Mari mulai dengan beberapa pertanyaan.',
      timestamp: new Date()
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [isComplete, setIsComplete] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Question flow with conditional logic
  const questionFlow: QuestionFlow[] = [
    {
      id: 'gender',
      question: 'Apa jenis kelamin Anda?',
      type: 'options',
      options: ['Laki-laki', 'Perempuan']
    },
    {
      id: 'age',
      question: 'Berapa usia Anda saat ini?',
      type: 'number',
      placeholder: 'Contoh: 20',
      validation: (value) => {
        const age = parseInt(value);
        if (isNaN(age) || age < 10 || age > 60) {
          return 'Masukkan usia yang valid (10-60 tahun)';
        }
        return null;
      }
    },
    {
      id: 'provinsi',
      question: 'Provinsi tempat tinggal Anda?',
      type: 'dropdown',
      options: PROVINCES
    },
    {
      id: 'degree',
      question: 'Jenjang pendidikan yang sedang Anda tempuh?',
      type: 'options',
      options: ['SMA/SMK', 'D3', 'S1', 'S2', 'S3']
    },
    {
      id: 'semester',
      question: 'Semester berapa Anda saat ini?',
      type: 'number',
      placeholder: 'Contoh: 4',
      condition: (data) => data.degree !== 'SMA/SMK',
      validation: (value) => {
        const sem = parseInt(value);
        if (isNaN(sem) || sem < 1 || sem > 14) {
          return 'Masukkan semester yang valid (1-14)';
        }
        return null;
      }
    },
    {
      id: 'nilai',
      question: '', // Will be set dynamically based on degree
      type: 'number',
      placeholder: '',
      validation: (value, data) => {
        const num = parseFloat(value);
        if (data.degree === 'SMA/SMK') {
          if (isNaN(num) || num < 0 || num > 100) {
            return 'Masukkan nilai rata-rata yang valid (0-100)';
          }
        } else {
          if (isNaN(num) || num < 0 || num > 4) {
            return 'Masukkan IPK yang valid (0.00-4.00)';
          }
        }
        return null;
      }
    },
    {
      id: 'scholarshipType',
      question: 'Jenis beasiswa yang Anda cari?',
      type: 'options',
      options: ['Dalam Negeri', 'Luar Negeri', 'Keduanya']
    },
    {
      id: 'statusBeasiswaAktif',
      question: 'Apakah Anda sedang menerima beasiswa aktif?',
      type: 'options',
      options: ['Ya', 'Tidak']
    },
    {
      id: 'statusKeluargaTidakMampu',
      question: 'Apakah Anda berasal dari keluarga kurang mampu?',
      type: 'options',
      options: ['Ya', 'Tidak']
    },
    {
      id: 'statusDisabilitas',
      question: 'Apakah Anda penyandang disabilitas?',
      type: 'options',
      options: ['Ya', 'Tidak']
    },
    {
      id: 'custom',
      question: 'Ceritakan lebih detail tentang beasiswa impian Anda. Semakin spesifik, semakin akurat rekomendasi yang kami berikan.',
      type: 'text',
      placeholder: 'Contoh: Beasiswa full untuk S2 di Eropa, jurusan Computer Science, tanpa ikatan dinas'
    }
  ];

  // Get dynamic question text for nilai
  const getQuestionText = useCallback((question: QuestionFlow): string => {
    if (question.id === 'nilai') {
      return userData.degree === 'SMA/SMK'
        ? 'Berapa nilai rata-rata rapor Anda?'
        : 'Berapa IPK Anda saat ini?';
    }
    return question.question;
  }, [userData.degree]);

  // Get dynamic placeholder for nilai
  const getPlaceholder = useCallback((question: QuestionFlow): string => {
    if (question.id === 'nilai') {
      return userData.degree === 'SMA/SMK'
        ? 'Contoh: 85.5'
        : 'Contoh: 3.50';
    }
    return question.placeholder || '';
  }, [userData.degree]);

  // Get current applicable questions (filtering by conditions)
  const getApplicableQuestions = useCallback((): QuestionFlow[] => {
    return questionFlow.filter(q => !q.condition || q.condition(userData));
  }, [userData]);

  // Auto-scroll to bottom (only within chatbox, not page)
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ask first question on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const applicableQuestions = getApplicableQuestions();
      if (applicableQuestions.length > 0) {
        addMessage(getQuestionText(applicableQuestions[0]), 'bot');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addMessage = useCallback((content: string, type: 'user' | 'bot') => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const moveToNextQuestion = useCallback(() => {
    const applicableQuestions = getApplicableQuestions();
    const currentApplicableIndex = applicableQuestions.findIndex(
      q => q.id === questionFlow[currentQuestionIndex].id
    );

    if (currentApplicableIndex < applicableQuestions.length - 1) {
      // Find the next applicable question
      let nextIndex = currentQuestionIndex + 1;
      while (nextIndex < questionFlow.length) {
        const nextQ = questionFlow[nextIndex];
        if (!nextQ.condition || nextQ.condition(userData)) {
          setCurrentQuestionIndex(nextIndex);
          setTimeout(() => {
            addMessage(getQuestionText(nextQ), 'bot');
          }, 300);
          break;
        }
        nextIndex++;
      }
      if (nextIndex >= questionFlow.length) {
        setIsComplete(true);
        setTimeout(() => {
          addMessage('Terima kasih atas informasinya. Saya sedang mencari beasiswa yang sesuai...', 'bot');
          generateRecommendations();
        }, 300);
      }
    } else {
      setIsComplete(true);
      setTimeout(() => {
        addMessage('Terima kasih atas informasinya. Saya sedang mencari beasiswa yang sesuai...', 'bot');
        generateRecommendations();
      }, 300);
    }
  }, [currentQuestionIndex, userData, getApplicableQuestions, getQuestionText, addMessage]);

  const handleOptionSelect = useCallback((option: string) => {
    const currentQuestion = questionFlow[currentQuestionIndex];
    setUserData(prev => ({ ...prev, [currentQuestion.id]: option }));
    addMessage(option, 'user');

    setTimeout(() => {
      moveToNextQuestion();
    }, 100);
  }, [currentQuestionIndex, addMessage, moveToNextQuestion]);

  const handleDropdownSelect = useCallback((value: string) => {
    const currentQuestion = questionFlow[currentQuestionIndex];
    setUserData(prev => ({ ...prev, [currentQuestion.id]: value }));
    addMessage(value, 'user');
    setDropdownOpen(false);
    setDropdownSearch('');

    setTimeout(() => {
      moveToNextQuestion();
    }, 100);
  }, [currentQuestionIndex, addMessage, moveToNextQuestion]);

  const handleTextSubmit = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const currentQuestion = questionFlow[currentQuestionIndex];

    // Handle skip for custom field
    if (currentQuestion.id === 'custom' && trimmedText.toLowerCase() === 'lewati') {
      addMessage('Lewati', 'user');
      setInputValue('');
      moveToNextQuestion();
      return;
    }

    // Validation
    if (currentQuestion.validation) {
      const error = currentQuestion.validation(trimmedText, userData);
      if (error) {
        addMessage(trimmedText, 'user');
        setTimeout(() => {
          addMessage(error, 'bot');
        }, 300);
        setInputValue('');
        return;
      }
    }

    setUserData(prev => ({ ...prev, [currentQuestion.id]: trimmedText }));
    addMessage(trimmedText, 'user');
    setInputValue('');

    setTimeout(() => {
      moveToNextQuestion();
    }, 100);
  }, [currentQuestionIndex, userData, addMessage, moveToNextQuestion]);

  const generateRecommendations = async () => {
    setIsLoading(true);

    try {
      // Construct request payload
      const requestData: RekomendasiBeasiswaRequest = {
        age: userData.age ? parseInt(userData.age) : undefined,
        gender: userData.gender === 'Laki-laki' ? 'LAKI_LAKI' : userData.gender === 'Perempuan' ? 'PEREMPUAN' : undefined,
        provinsi: userData.provinsi || undefined,
        education_level: userData.degree === 'SMA/SMK' ? 'sma' : userData.degree?.toLowerCase(),
        ipk: userData.nilai ? parseFloat(userData.nilai) : undefined,
        semester: userData.semester ? parseInt(userData.semester) : undefined,
        status_beasiswa_aktif: userData.statusBeasiswaAktif === 'Ya',
        status_keluarga_tidak_mampu: userData.statusKeluargaTidakMampu === 'Ya',
        status_disabilitas: userData.statusDisabilitas === 'Ya',
        user_prompt: buildUserPrompt(),
        limit: 10
      };

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const fullUrl = `${apiUrl}/scholarship/recommend-guest`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status}`);
      }

      const responseData = await response.json();

      // Handle backend API response structure
      if (responseData.code !== 200 || !responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Gagal mendapatkan rekomendasi');
      }

      const data = responseData.data;

      // Transform backend data to frontend format
      const transformedRecommendations: ScholarshipRecommendationDisplay[] = data.recommendations.map((rec: any) => ({
        id: rec.id,
        title: rec.nama,
        provider: rec.penyelenggara,
        deadline: new Date(rec.close_registration).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        amount: rec.jenis === 'PARTIAL' ? 'Partial Scholarship' : rec.jenis === 'FULL' ? 'Full Scholarship' : rec.jenis,
        requirements: [`Jenis: ${rec.jenis}`, `Kecocokan: ${rec.match_score}%`],
        description: `Beasiswa ${rec.jenis} dari ${rec.penyelenggara}`,
        eligibility: `Pendaftaran: ${new Date(rec.open_registration).toLocaleDateString('id-ID')} - ${new Date(rec.close_registration).toLocaleDateString('id-ID')}`,
        link: `/scholarship-recommendation/${rec.id}`,
        match_score: rec.match_score / 100
      }));

      // Save to localStorage and redirect to results page
      localStorage.setItem('scholarship_recommendations', JSON.stringify(transformedRecommendations));
      localStorage.setItem('scholarship_search_summary', data.search_summary);

      if (data.total_found > 0) {
        addMessage(`Ditemukan ${data.total_found} beasiswa yang sesuai. ${data.search_summary}`, 'bot');
      } else {
        addMessage('Tidak ditemukan beasiswa yang sesuai dengan kriteria Anda. Coba ubah beberapa kriteria pencarian.', 'bot');
      }

      // Redirect after delay
      if (data.total_found > 0) {
        setTimeout(() => {
          router.push('/scholarship-recommendation/results');
        }, 2000);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      addMessage(`Maaf, terjadi kesalahan: ${errorMessage}. Silakan coba lagi.`, 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const buildUserPrompt = (): string => {
    const parts: string[] = [];

    if (userData.scholarshipType) {
      parts.push(`Mencari beasiswa ${userData.scholarshipType}`);
    }
    if (userData.degree) {
      parts.push(`Jenjang: ${userData.degree}`);
    }
    if (userData.custom && userData.custom.toLowerCase() !== 'lewati') {
      parts.push(userData.custom);
    }

    return parts.join('. ') || 'Mencari beasiswa yang sesuai dengan profil saya';
  };

  const currentQuestion = questionFlow[currentQuestionIndex];
  const isApplicable = !currentQuestion.condition || currentQuestion.condition(userData);
  const showInput = !isComplete && isApplicable && !isLoading;

  // Filter provinces for dropdown search
  const filteredProvinces = PROVINCES.filter(p =>
    p.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-h-[700px] bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-[#1B7691] rounded-full flex items-center justify-center">
          <Typography className="font-semibold text-white text-sm">AI</Typography>
        </div>
        <div>
          <Typography className="font-semibold text-gray-900">Scholra Assistant</Typography>
          <Typography className="text-xs text-gray-500">Rekomendasi Beasiswa</Typography>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <Typography className="text-xs text-gray-500">Online</Typography>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'bot' && (
              <div className="w-7 h-7 bg-[#1B7691] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Typography className="text-white text-xs font-semibold">AI</Typography>
              </div>
            )}

            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${message.type === 'user'
                ? 'bg-[#1B7691] text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
            >
              <Typography className={`text-sm leading-relaxed ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {message.content}
              </Typography>
            </div>

            {message.type === 'user' && (
              <div className="w-7 h-7 bg-[#FB991A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiUser className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 bg-[#1B7691] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <Typography className="text-sm text-gray-600">Mencari rekomendasi beasiswa...</Typography>
            </div>
          </div>
        )}

        {/* End marker for scroll */}
        <div />
      </div>

      {/* Input Section */}
      <div className="p-5 border-t border-gray-100">
        {/* Options */}
        {showInput && currentQuestion?.type === 'options' && (
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className="px-4 py-2 bg-gray-50 hover:bg-[#1B7691] hover:text-white text-gray-700 rounded-full border border-gray-200 hover:border-[#1B7691] transition-all duration-200 text-sm font-medium"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Dropdown for provinces */}
        {showInput && currentQuestion?.type === 'dropdown' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-[#1B7691] transition-colors"
            >
              <span className="text-gray-400">Pilih provinsi...</span>
              <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden z-50">
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder="Cari provinsi..."
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B7691]"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredProvinces.map((province) => (
                    <button
                      key={province}
                      onClick={() => handleDropdownSelect(province)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {province}
                    </button>
                  ))}
                  {filteredProvinces.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">
                      Tidak ditemukan
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text/Number Input */}
        {showInput && (currentQuestion?.type === 'text' || currentQuestion?.type === 'number') && (
          <form onSubmit={(e) => { e.preventDefault(); handleTextSubmit(inputValue); }} className="relative">
            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#1B7691] focus-within:bg-white transition-all">
              <input
                type="text"
                inputMode={currentQuestion.type === 'number' ? 'decimal' : 'text'}
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  // For number type, only allow digits and decimal point
                  if (currentQuestion.type === 'number') {
                    // Allow only numbers and one decimal point
                    const sanitized = value.replace(/[^0-9.]/g, '');
                    // Prevent multiple decimal points
                    const parts = sanitized.split('.');
                    if (parts.length > 2) {
                      setInputValue(parts[0] + '.' + parts.slice(1).join(''));
                    } else {
                      setInputValue(sanitized);
                    }
                  } else {
                    setInputValue(value);
                  }
                }}
                onKeyDown={(e) => {
                  // For number type, prevent non-numeric keys
                  if (currentQuestion.type === 'number') {
                    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '.'];
                    const isNumber = /^[0-9]$/.test(e.key);
                    const isDecimal = e.key === '.' && !inputValue.includes('.');
                    if (!isNumber && !allowed.includes(e.key) && !isDecimal) {
                      e.preventDefault();
                    }
                  }
                }}
                placeholder={getPlaceholder(currentQuestion)}
                className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-sm placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="mr-2 p-2 bg-[#1B7691] text-white rounded-lg hover:bg-[#145a6e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Completed state */}
        {isComplete && !isLoading && (
          <div className="text-center py-2">
            <Typography className="text-sm text-gray-500">
              Pencarian selesai. Anda akan diarahkan ke halaman hasil.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
