import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight, FiCheck, FiRefreshCw, FiChevronLeft, FiAward,
    FiStar, FiChevronRight, FiCheckCircle, FiTrendingUp, FiTarget, FiActivity
} from 'react-icons/fi';
import api from '@/lib/api';
import { useRouter } from 'next/router';
import Typography from '@/components/Typography';

interface Question {
    id: string;
    text: string;
    options?: any[];
    type?: 'input_number' | 'select' | 'text';
}

interface ScholarshipResult {
    id: string;
    title: string;
    provider: string;
    deadline: string;
    amount: string;
    requirements: string[];
    description: string;
    eligibility: string;
    link: string;
    match_score?: number;
    matchLabel?: string;
    img_path?: string;
    jenis?: string;
}

export default function ScholraFlow() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [results, setResults] = useState<ScholarshipResult[]>([]);
    const [remainingCount, setRemainingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [history, setHistory] = useState<Record<string, any>[]>([]);
    const [mascotState, setMascotState] = useState(1);

    const getMascotDialogue = () => {
        if (isLoading) return "Tenang... Scholra lagi hitung skor kecocokan berdasarkan profilmu.";
        if (!currentQuestion) return "Wuihh! Analisis beres. Scholra udah kumpulin 20 beasiswa paling pas buatmu!";

        const qId = currentQuestion.id;
        const dialogs: Record<string, string> = {
            jenjang: "Halo! Aku Haira. Pertama, Scholra perlu tahu jenjang pendidikanmu sekarang.",
            ipk: "Wuih, mantap! Kalau boleh tahu, berapa nih IPK terakhirmu? Scholra mau cari yang sesuai nilaimu.",
            is_sktm: "Oke! Apakah kamu punya SKTM? Banyak program bantuan ekonomi yang keren-keren lho!",
            asal_daerah: "Wah seru! Kamu asalnya dari daerah mana? Scholra mau cariin yang khusus buat putra daerah.",
            gender: "Hampir beres! Jenis kelaminmu apa ya? Ada beberapa beasiswa yang khusus untuk kamu.",
            semester: "Sekarang kamu lagi di semester berapa? Biar makin akurat pilihannya!",
            funding: "Tipe pendanaan itu penting. Kamu cari yang Full-Funded atau bantuan parsial?",
            english: "Psst! Skor Bahasa Inggris bisa jadi kunci pembuka banyak pintu lho. Bagaimana kemampuanmu?",
            age_val: "Berapa usiamu saat ini? Ada beberapa beasiswa yang punya batasan umur lho."
        };

        return dialogs[qId] || "Ayo isi datamu agar Scholra bisa kasih rekomendasi terbaik!";
    };

    const ensurerArray = (val: any): string[] => {
        if (!val) return [];
        let target = val;
        // Unwrap single-item array containing a stringified list
        if (Array.isArray(target) && target.length === 1 && typeof target[0] === 'string' && target[0].trim().startsWith('[')) {
            target = target[0];
        }
        if (Array.isArray(target)) {
            return target.map(i => String(i).replace(/[\[\]'"]/g, '').trim()).filter(Boolean);
        }
        if (typeof target === 'string') {
            let cleaned = target.trim();
            if (cleaned.startsWith('[') && cleaned.endsWith(']')) cleaned = cleaned.slice(1, -1);
            return cleaned.split(/[,|\n]/).map(v => v.replace(/['"]/g, '').trim()).filter(Boolean);
        }
        return [];
    };

    const mapToResult = (raw: any): ScholarshipResult => ({
        id: raw.id || Math.random().toString(36).substr(2, 9),
        title: raw.nama || 'Beasiswa Terpilih',
        provider: raw.penyelenggara || 'Institusi',
        deadline: raw.close_registration || '',
        amount: raw.benefit || '-',
        requirements: ensurerArray(raw.persyaratan),
        description: raw.deskripsi || '',
        eligibility: Array.isArray(raw.jenjang) ? raw.jenjang.join(', ') : (raw.jenjang || ''),
        link: raw.link_pendaftaran || '#',
        match_score: raw.matchScore ? Math.round(raw.matchScore) : 0,
        matchLabel: raw.matchLabel || 'Cukup Cocok',
        img_path: raw.img_path,
        jenis: raw.jenis
    });

    const fetchNextStep = async (updatedAnswers: Record<string, any>) => {
        setIsLoading(true);
        try {
            const response = await api.post('/scholarship/scholra', { answers: updatedAnswers });
            const { nextQuestion, results: rawResults, remainingCount } = response.data;

            const mappedResults = (rawResults || []).map(mapToResult);

            setCurrentQuestion(nextQuestion);
            setResults(mappedResults);
            setRemainingCount(remainingCount);

            if (mappedResults.length > 0) {
                localStorage.setItem('scholarship_recommendations', JSON.stringify(mappedResults));
            }

            const nextMascot = ((history.length + Date.now()) % 7) + 1;
            setMascotState(nextMascot);
        } catch (error) {
            console.error('Scholra Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNextStep({});
    }, []);

    const handleAnswer = (questionId: string, value: any) => {
        const newAnswers = { ...answers, [questionId]: value };
        setHistory(prev => [...prev, answers]);
        setAnswers(newAnswers);
        fetchNextStep(newAnswers);
        setInputValue('');
    };

    const handleBack = () => {
        if (history.length === 0) return;
        const prevAnswers = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setAnswers(prevAnswers);
        fetchNextStep(prevAnswers);
    };

    const reset = () => {
        setAnswers({});
        setHistory([]);
        setResults([]);
        setMascotState(1);
        fetchNextStep({});
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start mt-12 px-4">

            {/* LEFT: CHARACTER & STATUS */}
            <div className="w-full md:w-[320px] shrink-0 sticky top-32 flex flex-col gap-6">
                <div className="relative pt-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={getMascotDialogue()}
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] bg-white p-6 rounded-[2.5rem] shadow-xl border border-blue-50 z-20"
                        >
                            <div className="relative">
                                <Typography className="text-sm font-bold text-gray-800 leading-relaxed text-center">
                                    {getMascotDialogue()}
                                </Typography>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white" />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center relative z-10">
                        <motion.img
                            key={mascotState}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={`/images/rekomendasi/haira-${mascotState}.png`}
                            className="w-56 h-auto object-contain drop-shadow-2xl mb-8"
                            alt="Haira Mascot"
                        />

                        <div className="w-full space-y-3">
                            <div className="bg-blue-50/50 p-4 rounded-3xl flex items-center justify-between px-6 border border-blue-50">
                                <div>
                                    <Typography className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Opsi Tersedia</Typography>
                                    <Typography className="text-2xl font-black text-[#1B7691]">{remainingCount}</Typography>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#1B7691]">
                                    <FiActivity size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1B7691] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <FiTarget className="text-orange-400" />
                        </div>
                        <Typography className="text-xs font-black uppercase tracking-widest text-blue-100">Profil Accuracy</Typography>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                        <Typography className="text-4xl font-black leading-none">{Math.min(100, Math.round((history.length / 6) * 100))}%</Typography>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(history.length / 6) * 100}%` }}
                            className="h-full bg-orange-400"
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT: INTERACTIVE CARD */}
            <div className="flex-1 w-full h-[650px] flex flex-col">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 bg-white rounded-[4rem] shadow-xl border border-gray-100 p-12 flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 border-8 border-gray-100 border-t-[#1B7691] rounded-full animate-spin mb-6" />
                            <Typography className="text-gray-400 font-black uppercase tracking-widest text-xs">Analyzing Database...</Typography>
                        </motion.div>
                    ) : currentQuestion ? (
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col"
                        >
                            <div className="p-12 md:p-16 flex-1 flex flex-col">
                                <div className="mb-12">
                                    <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl text-[#FB991A] mb-8 shadow-sm">
                                        <FiStar size={14} className="fill-current" />
                                        <Typography className="text-[10px] font-black uppercase tracking-[0.2em]">Step {history.length + 1}</Typography>
                                    </div>
                                    <Typography className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] tracking-tighter">
                                        {currentQuestion.text}
                                    </Typography>
                                </div>

                                <div className="grid grid-cols-1 gap-4 max-w-xl mt-auto">
                                    {currentQuestion.type === 'input_number' ? (
                                        <div className="flex gap-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className="flex-1 px-10 py-6 bg-gray-50 border-2 border-transparent focus:border-[#1B7691] focus:bg-white rounded-[2.5rem] outline-none font-black text-4xl transition-all shadow-inner"
                                                placeholder="0.00"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => inputValue && handleAnswer(currentQuestion.id, inputValue)}
                                                className="w-24 bg-[#1B7691] text-white rounded-[2.5rem] font-black flex items-center justify-center shadow-2xl shadow-blue-900/30 hover:bg-[#FB991A] hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <FiCheck size={40} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {currentQuestion.options?.map((opt: any, idx: number) => {
                                                const label = typeof opt === 'object' ? opt.label : opt;
                                                const value = typeof opt === 'object' ? opt.value : opt;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleAnswer(currentQuestion.id, value)}
                                                        className="group w-full text-left px-8 py-5 bg-white border border-gray-100 rounded-3xl hover:border-[#1B7691] hover:bg-blue-50/10 transition-all flex items-center justify-between shadow-sm hover:shadow-xl"
                                                    >
                                                        <Typography className="font-bold text-gray-700 group-hover:text-[#1B7691] text-lg">{label}</Typography>
                                                        <FiChevronRight size={24} className="text-gray-200 group-hover:text-[#1B7691] transition-all transform group-hover:translate-x-1" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-12 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    onClick={handleBack}
                                    disabled={history.length === 0}
                                    className="flex items-center gap-2 text-gray-400 hover:text-[#1B7691] font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-0"
                                >
                                    <FiChevronLeft size={16} /> Kembali
                                </button>
                                <div className="flex gap-2">
                                    {history.map((_, i) => (
                                        <div key={i} className="w-10 h-1.5 bg-[#1B7691]/10 rounded-full" />
                                    ))}
                                    <div className="w-16 h-1.5 bg-[#FB991A] rounded-full" />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="final"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-12 md:p-20 text-center flex flex-col items-center justify-center"
                        >
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-10 text-green-500 shadow-inner">
                                <FiCheckCircle size={56} />
                            </div>
                            <Typography className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">
                                Analisis Berhasil!
                            </Typography>
                            <Typography className="text-gray-500 mb-12 max-w-sm leading-relaxed text-lg font-medium">
                                Scholra telah berhasil menyaring database dan mengurasi 20 beasiswa paling relevan untukmu.
                            </Typography>
                            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                                <button
                                    onClick={() => router.push('/scholra/results')}
                                    className="flex-1 py-6 bg-[#1B7691] text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:-translate-y-2 transition-all flex items-center justify-center gap-3 group"
                                >
                                    Lihat Beasiswa Pilihan <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={reset}
                                    className="w-full md:w-auto px-10 py-6 bg-gray-100 text-gray-500 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Ulangi
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
