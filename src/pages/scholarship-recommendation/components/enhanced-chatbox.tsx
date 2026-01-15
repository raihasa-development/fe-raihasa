'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiCheck, FiChevronDown } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import Typography from '@/components/Typography';
import { ChatMessage, ScholarshipRecommendationDisplay, RekomendasiBeasiswaRequest } from '../types/type';
import { INDONESIA_PROVINCES, getCitiesByProvince, EDUCATION_LEVELS, GENDER_OPTIONS } from '../types/indonesia-location';
import { useRouter } from 'next/router';

interface ChatboxProps {
    onRecommendation?: (recommendations: ScholarshipRecommendationDisplay[]) => void;
}

interface FormData {
    gender: string;
    age: string;
    provinsi: string;
    kota_kabupaten: string;
    education_level: string;
    semester: string;
    ipk: string;
    is_sktm: boolean;
    has_scholarships: boolean;
    has_disability: boolean;
    user_prompt: string;
}

type FormStep = 'gender' | 'age' | 'location' | 'education' | 'academic' | 'status' | 'prompt' | 'complete';

const STEPS: FormStep[] = ['gender', 'age', 'location', 'education', 'academic', 'status', 'prompt', 'complete'];

export default function EnhancedChatbox({ onRecommendation }: ChatboxProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<FormStep>('gender');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        gender: '',
        age: '',
        provinsi: '',
        kota_kabupaten: '',
        education_level: '',
        semester: '',
        ipk: '',
        is_sktm: false,
        has_scholarships: false,
        has_disability: false,
        user_prompt: ''
    });

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            type: 'bot',
            content: 'Halo! Saya Scholra, AI yang akan membantu menemukan beasiswa yang tepat untukmu. Mari mulai dengan data dirimu.',
            timestamp: new Date()
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    // Scroll to bottom when messages change
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // Get cities based on selected province
    const availableCities = formData.provinsi ? getCitiesByProvince(formData.provinsi) : [];

    // Add message helper
    const addMessage = (content: string, type: 'user' | 'bot') => {
        const message: ChatMessage = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
    };

    // Step handlers
    const handleGenderSelect = (gender: string) => {
        setFormData(prev => ({ ...prev, gender }));
        const label = GENDER_OPTIONS.find(g => g.value === gender)?.label;
        addMessage(label || gender, 'user');
        setTimeout(() => {
            addMessage('Berapa usiamu saat ini?', 'bot');
            setCurrentStep('age');
        }, 500);
    };

    const handleAgeSubmit = () => {
        if (!formData.age) return;
        addMessage(`${formData.age} tahun`, 'user');
        setTimeout(() => {
            addMessage('Di mana domisilimu saat ini?', 'bot');
            setCurrentStep('location');
        }, 500);
    };

    const handleLocationSubmit = () => {
        if (!formData.provinsi) return;
        const locationText = formData.kota_kabupaten
            ? `${formData.kota_kabupaten}, ${formData.provinsi}`
            : formData.provinsi;
        addMessage(locationText, 'user');
        setTimeout(() => {
            addMessage('Apa jenjang pendidikanmu saat ini?', 'bot');
            setCurrentStep('education');
        }, 500);
    };

    const handleEducationSelect = (level: string) => {
        setFormData(prev => ({ ...prev, education_level: level }));
        const label = EDUCATION_LEVELS.find(e => e.value === level)?.label;
        addMessage(label || level, 'user');

        const isSchool = level === 'sma';

        setTimeout(() => {
            if (isSchool) {
                addMessage('Masukkan informasi kelas (10-12) dan nilai rata-rata rapormu.', 'bot');
            } else {
                addMessage('Masukkan informasi semester dan IPK terakhirmu.', 'bot');
            }
            setCurrentStep('academic');
        }, 500);
    };

    const handleAcademicSubmit = () => {
        const isSchool = formData.education_level === 'sma';
        const academicText = [];

        if (formData.semester) {
            academicText.push(`${isSchool ? 'Kelas' : 'Semester'} ${formData.semester}`);
        }

        if (formData.ipk) {
            academicText.push(`${isSchool ? 'Nilai' : 'IPK'} ${formData.ipk}`);
        }

        if (academicText.length > 0) {
            addMessage(academicText.join(', '), 'user');
        }
        setTimeout(() => {
            addMessage('Apakah ada kondisi khusus yang perlu kami ketahui?', 'bot');
            setCurrentStep('status');
        }, 500);
    };

    const handleStatusSubmit = () => {
        const statusTexts = [];
        if (formData.is_sktm) statusTexts.push('Keluarga Tidak Mampu (SKTM)');
        if (formData.has_scholarships) statusTexts.push('Sedang Menerima Beasiswa');
        if (formData.has_disability) statusTexts.push('Penyandang Disabilitas');

        addMessage(statusTexts.length > 0 ? statusTexts.join(', ') : 'Tidak ada kondisi khusus', 'user');
        setTimeout(() => {
            addMessage('Terakhir, ceritakan detail lain seperti jurusan, universitas, atau beasiswa spesifik yang kamu cari.', 'bot');
            setCurrentStep('prompt');
        }, 500);
    };

    const handlePromptSubmit = () => {
        if (!formData.user_prompt.trim()) {
            setFormData(prev => ({ ...prev, user_prompt: 'Cari beasiswa yang sesuai dengan profil saya' }));
        }
        addMessage(formData.user_prompt || 'Cari beasiswa yang sesuai dengan profil saya', 'user');
        setTimeout(() => {
            addMessage('Baik, Scholra sedang mencari rekomendasi beasiswa terbaik untukmu.', 'bot');
            setCurrentStep('complete');
            generateRecommendations();
        }, 500);
    };

    const generateRecommendations = async () => {
        setIsLoading(true);

        try {
            const requestData: RekomendasiBeasiswaRequest = {
                age: formData.age ? parseInt(formData.age) : undefined,
                gender: formData.gender || undefined,
                provinsi: formData.provinsi || undefined,
                kota_kabupaten: formData.kota_kabupaten || undefined,
                education_level: formData.education_level || undefined,
                ipk: formData.ipk ? parseFloat(formData.ipk) : undefined,
                status_beasiswa_aktif: formData.has_scholarships,
                status_keluarga_tidak_mampu: formData.is_sktm,
                status_disabilitas: formData.has_disability,
                semester: formData.semester ? parseInt(formData.semester) : undefined,
                user_prompt: formData.user_prompt || 'Cari beasiswa yang sesuai dengan profil saya',
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
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const responseData = await response.json();

            if (responseData.code !== 200 || !responseData.status || !responseData.data) {
                throw new Error(`API Error: ${responseData.message || 'Invalid response format'}`);
            }

            const data = responseData.data;

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
                match_score: rec.match_score / 100
            }));

            localStorage.setItem('scholarship_recommendations', JSON.stringify(transformedRecommendations));
            localStorage.setItem('scholarship_search_summary', data.search_summary);

            addMessage(`${data.search_summary} Mengarahkan ke halaman hasil...`, 'bot');

            setTimeout(() => {
                router.push('/scholarship-recommendation/results');
            }, 2000);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addMessage(`Terjadi kesalahan: ${errorMessage}. Silakan coba lagi.`, 'bot');
            setCurrentStep('prompt');
        } finally {
            setIsLoading(false);
        }
    };

    // Progress indicator
    const currentStepIndex = STEPS.indexOf(currentStep);
    const progress = ((currentStepIndex) / (STEPS.length - 1)) * 100;

    return (
        <div className="flex flex-col h-full max-h-[750px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] p-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                        <HiSparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <Typography className="font-bold text-white text-lg">Scholra AI</Typography>
                        <Typography className="text-white/80 text-sm">Asisten Beasiswa Cerdas</Typography>
                    </div>
                    {/* <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white/80 text-xs">Online</span>
                    </div> */}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#FB991A]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.type === 'bot' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                    <HiSparkles className="text-white w-4 h-4" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${message.type === 'user'
                                    ? 'bg-gradient-to-r from-[#FB991A] to-[#f08c10] text-white rounded-br-md'
                                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                                    }`}
                            >
                                <Typography className={`text-sm leading-relaxed ${message.type === 'user' ? 'text-white' : 'text-gray-700'}`}>
                                    {message.content}
                                </Typography>
                            </div>

                            {message.type === 'user' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-[#FB991A] to-[#f08c10] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                    <FiUser className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Animation */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                            <div className="flex gap-1">
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="w-2 h-2 bg-[#1B7691] rounded-full"
                                />
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                    className="w-2 h-2 bg-[#1B7691] rounded-full"
                                />
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                    className="w-2 h-2 bg-[#1B7691] rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="p-5 bg-white border-t border-gray-100">
                <AnimatePresence mode="wait">
                    {/* Gender Selection */}
                    {currentStep === 'gender' && (
                        <motion.div
                            key="gender"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <Typography className="text-sm text-gray-600 font-medium">Pilih jenis kelamin:</Typography>
                            <div className="grid grid-cols-2 gap-3">
                                {GENDER_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleGenderSelect(option.value)}
                                        className="p-4 bg-gray-50 hover:bg-[#1B7691] hover:text-white text-gray-700 rounded-xl border border-gray-200 hover:border-[#1B7691] transition-all duration-300 font-medium text-sm"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Age Input */}
                    {currentStep === 'age' && (
                        <motion.div
                            key="age"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <Typography className="text-sm text-gray-600 font-medium">Masukkan usiamu:</Typography>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                                    placeholder="Contoh: 20"
                                    min="10"
                                    max="60"
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all"
                                />
                                <button
                                    onClick={handleAgeSubmit}
                                    disabled={!formData.age}
                                    className="px-6 py-3 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <FiSend className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Location Selection */}
                    {currentStep === 'location' && (
                        <motion.div
                            key="location"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <Typography className="text-sm text-gray-600 font-medium">Pilih lokasi:</Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="relative">
                                    <select
                                        value={formData.provinsi}
                                        onChange={(e) => setFormData(prev => ({ ...prev, provinsi: e.target.value, kota_kabupaten: '' }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all"
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        {INDONESIA_PROVINCES.map((prov) => (
                                            <option key={prov.id} value={prov.name}>{prov.name}</option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <div className="relative">
                                    <select
                                        value={formData.kota_kabupaten}
                                        onChange={(e) => setFormData(prev => ({ ...prev, kota_kabupaten: e.target.value }))}
                                        disabled={!formData.provinsi}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all disabled:opacity-50"
                                    >
                                        <option value="">Pilih Kota/Kabupaten</option>
                                        {availableCities.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            <button
                                onClick={handleLocationSubmit}
                                disabled={!formData.provinsi}
                                className="w-full px-6 py-3 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                Lanjutkan
                            </button>
                        </motion.div>
                    )}

                    {/* Education Selection */}
                    {currentStep === 'education' && (
                        <motion.div
                            key="education"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <Typography className="text-sm text-gray-600 font-medium">Pilih jenjang pendidikan:</Typography>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {EDUCATION_LEVELS.map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() => handleEducationSelect(level.value)}
                                        className="p-3 bg-gray-50 hover:bg-[#1B7691] hover:text-white text-gray-700 rounded-xl border border-gray-200 hover:border-[#1B7691] transition-all duration-300 font-medium text-sm"
                                    >
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Academic Info */}
                    {currentStep === 'academic' && (
                        <motion.div
                            key="academic"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <Typography className="text-sm text-gray-600 font-medium">
                                {formData.education_level === 'sma'
                                    ? 'Detail akademik (Kelas & Nilai):'
                                    : 'Detail akademik (Semester & IPK):'}
                            </Typography>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    value={formData.semester}
                                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                                    placeholder={formData.education_level === 'sma' ? "Kelas (10-12)" : "Semester (1-14)"}
                                    min={formData.education_level === 'sma' ? "10" : "1"}
                                    max={formData.education_level === 'sma' ? "12" : "14"}
                                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all"
                                />
                                <input
                                    type="number"
                                    step={formData.education_level === 'sma' ? "1" : "0.01"}
                                    value={formData.ipk}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ipk: e.target.value }))}
                                    placeholder={formData.education_level === 'sma' ? "Rata-rata (0-100)" : "IPK (0.00 - 4.00)"}
                                    min="0"
                                    max={formData.education_level === 'sma' ? "100" : "4"}
                                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all"
                                />
                            </div>
                            <button
                                onClick={handleAcademicSubmit}
                                className="w-full px-6 py-3 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                            >
                                Lanjutkan
                            </button>
                        </motion.div>
                    )}

                    {/* Status Checkboxes */}
                    {currentStep === 'status' && (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <Typography className="text-sm text-gray-600 font-medium">Kondisi khusus (jika ada):</Typography>
                            <div className="space-y-2">
                                {/* SKTM Checkbox */}
                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.is_sktm ? 'bg-[#1B7691] border-[#1B7691]' : 'border-gray-300'}`}>
                                        {formData.is_sktm && <FiCheck className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_sktm}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_sktm: e.target.checked }))}
                                        className="sr-only"
                                    />
                                    <div>
                                        <Typography className="text-sm font-medium text-gray-800">Keluarga Tidak Mampu (SKTM)</Typography>
                                        <Typography className="text-xs text-gray-500">Memiliki Surat Keterangan Tidak Mampu</Typography>
                                    </div>
                                </label>

                                {/* Has Scholarship Checkbox */}
                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.has_scholarships ? 'bg-[#1B7691] border-[#1B7691]' : 'border-gray-300'}`}>
                                        {formData.has_scholarships && <FiCheck className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.has_scholarships}
                                        onChange={(e) => setFormData(prev => ({ ...prev, has_scholarships: e.target.checked }))}
                                        className="sr-only"
                                    />
                                    <div>
                                        <Typography className="text-sm font-medium text-gray-800">Sedang Menerima Beasiswa</Typography>
                                        <Typography className="text-xs text-gray-500">Saat ini aktif menerima beasiswa lain</Typography>
                                    </div>
                                </label>

                                {/* Disability Checkbox */}
                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.has_disability ? 'bg-[#1B7691] border-[#1B7691]' : 'border-gray-300'}`}>
                                        {formData.has_disability && <FiCheck className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.has_disability}
                                        onChange={(e) => setFormData(prev => ({ ...prev, has_disability: e.target.checked }))}
                                        className="sr-only"
                                    />
                                    <div>
                                        <Typography className="text-sm font-medium text-gray-800">Penyandang Disabilitas</Typography>
                                        <Typography className="text-xs text-gray-500">Memiliki kebutuhan khusus atau disabilitas</Typography>
                                    </div>
                                </label>
                            </div>
                            <button
                                onClick={handleStatusSubmit}
                                className="w-full px-6 py-3 bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                            >
                                Lanjutkan
                            </button>
                        </motion.div>
                    )}

                    {/* User Prompt */}
                    {currentStep === 'prompt' && (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <Typography className="text-sm text-gray-600 font-medium">Ceritakan lebih detail tentang dirimu:</Typography>
                            <textarea
                                value={formData.user_prompt}
                                onChange={(e) => setFormData(prev => ({ ...prev, user_prompt: e.target.value }))}
                                placeholder="Contoh: Saya mahasiswa Teknik Informatika UI semester 5, mencari beasiswa S2 ke luar negeri..."
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all resize-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, user_prompt: 'Carikan beasiswa yang sesuai dengan profil saya' }))}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Skip (Gunakan default)
                                </button>
                                <button
                                    onClick={handlePromptSubmit}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FB991A] to-[#f08c10] text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                                >
                                    <HiSparkles className="w-5 h-5" />
                                    Cari Beasiswa!
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Complete/Loading State */}
                    {currentStep === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <Typography className="text-gray-600">Sedang mencari beasiswa terbaik untukmu...</Typography>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
