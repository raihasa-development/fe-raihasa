'use client';

import React, { useState, useRef } from 'react';
import { FiSend, FiUser } from 'react-icons/fi';
import Typography from '@/components/Typography';
import { ChatMessage, ScholarshipRecommendationDisplay, RekomendasiBeasiswaRequest, AIRecommendationResponse } from '../types/type';
import { useRouter } from 'next/router';

interface ChatboxProps {
  onRecommendation?: (recommendations: ScholarshipRecommendationDisplay[]) => void;
}

interface QuestionFlow {
  id: string;
  question: string;
  type: 'options' | 'text';
  options?: string[];
  templates?: string[];
}

interface UserData {
  gender?: string;
  age?: string;
  region?: string;
  degree?: string;
  gpa?: string;
  scholarshipType?: string;
  custom?: string;
}

export default function Chatbox({ onRecommendation }: ChatboxProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Halo! Saya akan membantu mencari beasiswa yang tepat untuk Anda. Mari mulai dengan jenis kelamin Anda?',
      timestamp: new Date()
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [userData, setUserData] = useState<UserData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questionFlow: QuestionFlow[] = [
    {
      id: 'gender',
      question: 'Jenis kelamin Anda?',
      type: 'options',
      options: ['Laki-laki', 'Perempuan']
    },
    {
      id: 'age',
      question: 'Berapa usia Anda?',
      type: 'text'
    },
    {
      id: 'region',
      question: 'Asal daerah Anda?',
      type: 'options',
      options: ['Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Sumatra', 'Kalimantan', 'Sulawesi', 'Papua', 'Lainnya']
    },
    {
      id: 'degree',
      question: 'Jenjang pendidikan yang sedang ditempuh?',
      type: 'options',
      options: ['SMA/SMK', 'D3', 'S1', 'S2', 'S3']
    },
    {
      id: 'gpa',
      question: 'IPK atau nilai rata-rata Anda?',
      type: 'text'
    },
    {
      id: 'scholarshipType',
      question: 'Jenis beasiswa yang Anda cari?',
      type: 'options',
      options: ['Dalam Negeri', 'Luar Negeri', 'Keduanya']
    },
    {
      id: 'custom',
      question: 'Ada detail spesifik lain? sesuaikan dengan preferensimu(universitas, jurusan, semester)',
      type: 'text',
      templates: [
        'Mahasiswa Universitas [Nama universitasmu] jurusan [Jurusanmu] semester [Semestermu]',
        'Siswa SMA [Nama SMA mu] kelas [Kelasmu] jurusan [Jurusanmu]'
      ]
    }
  ];

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleOptionSelect = (option: string) => {
    const currentQuestion = questionFlow[currentQuestionIndex];
    setUserData(prev => ({ ...prev, [currentQuestion.id as keyof UserData]: option }));
    
    addMessage(option, 'user');
    
    if (currentQuestionIndex < questionFlow.length - 1) {
      const nextQuestion = questionFlow[currentQuestionIndex + 1];
      addMessage(nextQuestion.question, 'bot');
      setCurrentQuestionIndex(prev => prev + 1);
      setShowTemplates(true);
    } else {
      setShowTemplates(false);
      addMessage('Terima kasih! Saya akan mencari beasiswa yang sesuai untuk Anda...', 'bot');
      generateRecommendations();
    }
  };

  const handleTextSubmit = (text: string) => {
    if (!text.trim()) return;
    
    const currentQuestion = questionFlow[currentQuestionIndex];
    setUserData(prev => ({ ...prev, [currentQuestion.id as keyof UserData]: text }));
    
    addMessage(text, 'user');
    setInputValue('');
    
    if (currentQuestionIndex < questionFlow.length - 1) {
      const nextQuestion = questionFlow[currentQuestionIndex + 1];
      addMessage(nextQuestion.question, 'bot');
      setCurrentQuestionIndex(prev => prev + 1);
      setShowTemplates(true);
    } else {
      setShowTemplates(false);
      addMessage('Sempurna! Saya akan mencari beasiswa yang cocok untuk Anda...', 'bot');
      generateRecommendations();
    }
  };

  const handleTemplateClick = (template: string) => {
    setInputValue(template);
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // Construct request payload
      const requestData: RekomendasiBeasiswaRequest = {
        age: userData.age ? parseInt(userData.age) : undefined,
        gender: userData.gender === 'Laki-laki' ? 'LAKI_LAKI' : userData.gender === 'Perempuan' ? 'PEREMPUAN' : undefined,
        provinsi: userData.region && ['Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur'].includes(userData.region) ? userData.region : undefined,
        kota_kabupaten: userData.region && !['Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur'].includes(userData.region) ? userData.region : undefined,
        education_level: userData.degree === 'SMA/SMK' ? 'sma' : userData.degree?.toLowerCase(),
        ipk: userData.gpa ? parseFloat(userData.gpa) : undefined,
        status_beasiswa_aktif: false,
        status_keluarga_tidak_mampu: false,
        status_disabilitas: false,
        semester: undefined,
        user_prompt: `${userData.custom || ''} Saya mencari beasiswa ${userData.scholarshipType || 'yang sesuai dengan profil saya'}. Jenjang pendidikan: ${userData.degree || 'tidak disebutkan'}.`.trim(),
        limit: 10
      };

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const fullUrl = `${apiUrl}/scholarship/recommend-guest`;
      
      // Debug logging
      console.log('API URL:', fullUrl);
      console.log('Request Data:', requestData);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Full response:', responseData);
      
      // Handle backend API response structure
      if (responseData.code !== 200 || !responseData.status || !responseData.data) {
        throw new Error(`API Error: ${responseData.message || 'Invalid response format'}`);
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
        requirements: [`Jenis: ${rec.jenis}`, `Match Score: ${rec.match_score}%`],
        description: `Beasiswa ${rec.jenis} dari ${rec.penyelenggara}`,
        eligibility: `Pendaftaran: ${new Date(rec.open_registration).toLocaleDateString('id-ID')} - ${new Date(rec.close_registration).toLocaleDateString('id-ID')}`,
        link: `/scholarship-recommendation/${rec.id}`,
        match_score: rec.match_score / 100 // Convert to decimal for consistency
      }));

      // Save to localStorage and redirect to results page
      localStorage.setItem('scholarship_recommendations', JSON.stringify(transformedRecommendations));
      localStorage.setItem('scholarship_search_summary', data.search_summary);
      
      addMessage(`${data.search_summary} Mengarahkan Anda ke halaman hasil...`, 'bot');
      
      // Small delay for better UX
      setTimeout(() => {
        router.push('/scholarship-recommendation/scholarship-result');
      }, 2000);
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      
      // Show error message with more helpful info
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addMessage(`Terjadi kesalahan saat mencari rekomendasi: ${errorMessage}. Pastikan backend berjalan di ${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000'}`, 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = questionFlow[currentQuestionIndex];
  const showOptions = showTemplates && currentQuestion && !isLoading;

  return (
    <div className="flex flex-col h-full max-h-[700px] bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center">
          <Typography className="font-medium text-white text-sm">AI</Typography>
        </div>
        <div>
          <Typography className="font-medium text-gray-900">Haira Assistant</Typography>
          <Typography className="text-sm text-gray-500">Pencari Beasiswa AI</Typography>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'bot' && (
              <div className="w-7 h-7 bg-primary-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Typography className="text-white text-xs font-medium">AI</Typography>
              </div>
            )}
            
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-primary-blue text-white rounded-br-md'
                  : 'bg-gray-50 text-gray-800 rounded-bl-md'
              }`}
            >
              <Typography className={`text-sm leading-relaxed ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {message.content}
              </Typography>
            </div>

            {message.type === 'user' && (
              <div className="w-7 h-7 bg-primary-orange rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FiUser className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 bg-primary-blue rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-bl-md">
              <Typography className="text-sm text-gray-600">Mencari beasiswa...</Typography>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-6 border-t border-gray-100">
        {/* Quick Options */}
        {showOptions && currentQuestion?.type === 'options' && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className="px-4 py-2 bg-white hover:bg-primary-blue hover:text-white text-gray-700 rounded-full border border-gray-200 hover:border-primary-blue transition-all duration-200 text-sm font-medium"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Template Buttons */}
        {showOptions && currentQuestion?.type === 'text' && currentQuestion.templates && (
          <div className="mb-4">
            <Typography className="text-xs text-gray-400 mb-3 font-medium tracking-wide">
              Contoh
            </Typography>
            <div className="space-y-2">
              {currentQuestion.templates.map((template) => (
                <button
                  key={template}
                  onClick={() => handleTemplateClick(template)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-left text-sm border-0"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Input */}
        {currentQuestion?.type === 'text' && (
          <form onSubmit={(e) => { e.preventDefault(); handleTextSubmit(inputValue); }} className="relative">
            <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 focus-within:border-primary-blue focus-within:bg-white transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentQuestion.id === 'age' ? 'Masukkan usia Anda...' :
                  currentQuestion.id === 'gpa' ? 'Masukkan IPK/nilai rata-rata...' :
                  'Ketik detail tambahan...'
                }
                className="flex-1 px-5 py-4 bg-transparent focus:outline-none text-sm placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="mr-2 p-2 bg-primary-blue text-white rounded-full hover:bg-primary-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
