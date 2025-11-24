'use client';

import React, { useState, useRef } from 'react';
import { FiSend, FiUser, FiZap } from 'react-icons/fi';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import { ChatMessage, ScholarshipRecommendation } from '../types/type';

interface ChatboxProps {
  onRecommendation?: (recommendations: ScholarshipRecommendation[]) => void;
}

export default function Chatbox({ onRecommendation }: ChatboxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Halo! Saya Haira, asisten AI untuk rekomendasi beasiswa. Ceritakan tentang profil akademik Anda dan saya akan bantu carikan beasiswa yang sesuai!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const mockRecommendations: ScholarshipRecommendation[] = [
    {
      id: '1',
      title: 'Beasiswa LPDP S1',
      provider: 'Lembaga Pengelola Dana Pendidikan',
      deadline: '31 Desember 2024',
      amount: 'Full Scholarship + Tunjangan Hidup',
      requirements: ['IPK minimal 3.0', 'Mahasiswa aktif', 'Tidak sedang menerima beasiswa lain'],
      description: 'Beasiswa penuh untuk mahasiswa berprestasi yang ingin melanjutkan studi.',
      eligibility: 'Mahasiswa S1 semester 4-8',
      link: '/scholarship-recommendation/1'
    },
    {
      id: '2',
      title: 'Beasiswa Psikologi Indonesia',
      provider: 'Himpunan Psikologi Indonesia',
      deadline: '15 Januari 2025',
      amount: 'Rp 5.000.000/semester',
      requirements: ['Jurusan Psikologi', 'IPK minimal 3.25', 'Essay motivasi'],
      description: 'Beasiswa khusus untuk mahasiswa psikologi berprestasi.',
      eligibility: 'Mahasiswa Psikologi semester 3-7',
      link: '/scholarship-recommendation/2'
    }
  ];

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('psikologi') || lowerMessage.includes('ui') || lowerMessage.includes('universitas indonesia')) {
      return `Berdasarkan profil Anda sebagai mahasiswa Psikologi UI semester 5, saya menemukan beberapa beasiswa yang sesuai! Berikut adalah rekomendasi terbaik untuk Anda:`;
    }
    
    return 'Terima kasih atas informasinya! Berdasarkan profil yang Anda berikan, berikut adalah beberapa rekomendasi beasiswa yang sesuai:';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(inputValue),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      
      // Trigger recommendations
      if (onRecommendation) {
        onRecommendation(mockRecommendations);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1B7691] to-[#FB991A] text-white rounded-t-2xl">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <FiZap className="w-5 h-5" />
        </div>
        <div>
          <Typography className="font-semibold text-white">Haira AI</Typography>
          <Typography className="text-sm text-white/80">Asisten Rekomendasi Beasiswa</Typography>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'bot' && (
              <div className="w-8 h-8 bg-[#1B7691] rounded-full flex items-center justify-center flex-shrink-0">
                <NextImage
                  src="/images/landing/haira-hero-mobile.png"
                  width={20}
                  height={20}
                  alt="Haira"
                  className="w-5 h-5"
                />
              </div>
            )}
            
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-[#FB991A] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <Typography className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {message.content}
              </Typography>
              <Typography className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Typography>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-[#FB991A] rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-[#1B7691] rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl">
              <Typography className="text-sm text-gray-600">Haira sedang mencari beasiswa untuk Anda...</Typography>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Contoh: Carikan beasiswa untuk mahasiswa UI jurusan Psikologi semester 5..."
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B7691] focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-3 bg-[#1B7691] text-white rounded-xl hover:bg-[#FB991A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
