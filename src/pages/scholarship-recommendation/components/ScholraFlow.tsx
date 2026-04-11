import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight, FiCheck, FiChevronLeft, FiTarget
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
    deadline_status?: 'open' | 'soon' | 'urgent' | 'closed' | 'unknown';
    days_left?: number | null;
    dims?: Record<string, number>;
    insights?: string[];
}

// Gamified Mascot Component utilizing existing 'haira' assets
const ScholraMascot = ({ isThinking }: { isThinking: boolean }) => {
    // We can show haira-3.png when thinking, and haira-1.png normally
    const imagePath = isThinking ? '/images/rekomendasi/haira-3.png' : '/images/rekomendasi/haira-1.png';
    return (
        <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="relative z-10 w-48 h-48 md:w-56 md:h-56 xl:w-64 xl:h-64 mx-auto mb-8 md:mb-0 drop-shadow-[0_20px_30px_rgba(27,118,145,0.2)]"
        >
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={imagePath}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    src={imagePath}
                    alt="Haira Mascot"
                    className="w-full h-full object-contain"
                />
            </AnimatePresence>
            
            {/* Thinking particles */}
            {isThinking && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-4 -right-4 bg-white px-3 py-1.5 rounded-2xl shadow-md border border-gray-100 flex gap-1"
                >
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1.5 h-1.5 bg-[#FB991A] rounded-full" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#FB991A] rounded-full" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#FB991A] rounded-full" />
                </motion.div>
            )}

            {/* Mascot Float Shadow */}
            <div className="absolute -bottom-8 left-[20%] right-[20%] h-4 bg-black/5 rounded-[100%] blur-sm pointer-events-none" />
        </motion.div>
    );
};

export default function ScholraFlow() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [results, setResults] = useState<ScholarshipResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [history, setHistory] = useState<Record<string, any>[]>([]);

    const mapToResult = (raw: any): ScholarshipResult => ({
        id: raw.id || Math.random().toString(36).substr(2, 9),
        title: raw.nama || 'Beasiswa Terpilih',
        provider: raw.penyelenggara || 'Institusi',
        deadline: raw.close_registration || '',
        amount: raw.benefit || '-',
        requirements: [],
        description: raw.deskripsi || '',
        eligibility: Array.isArray(raw.jenjang) ? raw.jenjang.join(', ') : (raw.jenjang || ''),
        link: raw.link_pendaftaran || '#',
        match_score: raw.matchScore ? Math.round(raw.matchScore) : 0,
        matchLabel: raw.matchLabel || 'Cukup Cocok',
        img_path: raw.img_path,
        jenis: raw.jenis,
        deadline_status: raw.deadline_status,
        days_left: raw.days_left,
        dims: raw.dims,
        insights: raw.insights || [],
    });

    const fetchNextStep = async (updatedAnswers: Record<string, any>) => {
        setIsLoading(true);
        try {
            const response = await api.post('/scholarship/scholra', { answers: updatedAnswers });
            const { nextQuestion, results: rawResults } = response.data;

            const mappedResults = (rawResults || []).map(mapToResult);

            setCurrentQuestion(nextQuestion);
            setResults(mappedResults);

            // IMPORTANT: Synchronize local storage properly
            localStorage.setItem('scholarship_recommendations', JSON.stringify(mappedResults || []));

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

    return (
        <div className="w-full max-w-5xl mx-auto px-4 mt-8 pb-10" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {/* Gamified Workspace Area */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 md:gap-16">
                
                {/* Visual Mascot */}
                <div className="w-full md:w-5/12 flex flex-col items-center justify-center md:sticky md:top-24">
                    <ScholraMascot isThinking={isLoading} />
                    
                    {/* Back Button positioned casually under the mascot */}
                    <AnimatePresence>
                        {history.length > 0 && currentQuestion && !isLoading && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                onClick={handleBack}
                                className="mt-8 flex items-center gap-2 px-6 py-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-[#1B7691] hover:border-[#1B7691] hover:shadow-md transition-all font-bold uppercase text-[11px] tracking-widest active:scale-95"
                            >
                                <FiChevronLeft size={16} /> Kembali
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Speech Bubble & Interaction Column */}
                <div className="w-full md:w-7/12 min-h-[460px] flex flex-col justify-center relative">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-lg border border-gray-100/50 p-10 text-center flex flex-col items-center justify-center min-h-[300px]"
                            >
                                <div className="w-12 h-12 border-[4px] border-gray-100 border-t-[#FB991A] rounded-full animate-spin mb-4" />
                                <Typography className="text-[#1B7691] font-black uppercase tracking-widest text-sm">Menyelaraskan Database...</Typography>
                            </motion.div>
                        ) : currentQuestion ? (
                            <motion.div
                                key={currentQuestion.id}
                                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                                className="flex flex-col gap-6"
                            >
                                {/* Speech Bubble */}
                                <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-gray-100">
                                    {/* Triangle pointer to Mascot */}
                                    <div className="hidden md:block absolute top-[50%] left-[-18px] w-0 h-0 border-y-[16px] border-y-transparent border-r-[18px] border-r-white -translate-y-1/2 drop-shadow-[-2px_0px_2px_rgba(0,0,0,0.02)]" />
                                    
                                    <Typography className="text-2xl md:text-3xl font-black text-[#1B7691] leading-tight text-center md:text-left">
                                        "{currentQuestion.text}"
                                    </Typography>
                                </div>

                                {/* Gamified Options */}
                                <div className="grid grid-cols-1 gap-3 md:pl-6 w-full">
                                    {currentQuestion.type === 'input_number' ? (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={inputValue}
                                                onChange={(e) => {
                                                    // Allow only digits and optional decimal point
                                                    if (/^[0-9.]*$/.test(e.target.value)) {
                                                        setInputValue(e.target.value);
                                                    }
                                                }}
                                                className="flex-1 px-8 py-5 bg-white/60 backdrop-blur-md border border-gray-200/60 rounded-2xl text-2xl font-black text-center text-gray-800 outline-none focus:ring-4 focus:ring-[#1B7691]/20 focus:bg-white shadow-sm transition-all"
                                                placeholder={currentQuestion.id === 'umur' ? 'Contoh: 21' : 'Contoh: 3.45'}
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => {
                                                    if (!inputValue) return;
                                                    const parsed = Number.parseFloat(inputValue);
                                                    if (Number.isNaN(parsed)) return;
                                                    handleAnswer(currentQuestion.id, parsed);
                                                }}
                                                className="px-10 py-5 bg-gradient-to-r from-[#1B7691] to-[#15627a] text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(27,118,145,0.3)] flex justify-center items-center"
                                            >
                                                <FiCheck size={32} />
                                            </button>
                                        </div>
                                    ) : (
                                        currentQuestion.options?.map((opt: any, idx: number) => {
                                            const label = typeof opt === 'object' ? opt.label : opt;
                                            const value = typeof opt === 'object' ? opt.value : opt;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(currentQuestion.id, value)}
                                                    className="group relative w-full text-center px-6 py-5 bg-white/70 backdrop-blur-md border-2 border-white rounded-2xl hover:bg-gradient-to-r hover:from-[#1B7691] hover:to-[#15627a] hover:border-transparent hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden"
                                                >
                                                    <span className="relative z-10 font-bold text-gray-600 group-hover:text-white text-lg">
                                                        {label}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}

                                    {/* Skip option nicely styled */}
                                    {currentQuestion.id === 'ipk' && (
                                        <button
                                            onClick={() => handleAnswer(currentQuestion.id, 'skip')}
                                            className="mt-3 px-6 py-3 text-gray-400 font-bold hover:text-gray-700 hover:bg-white/50 rounded-xl transition-all"
                                        >
                                            Lewati (Belum Ada IPK)
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="final"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-[#1B7691] to-[#0d5a6e] rounded-3xl shadow-2xl p-10 md:p-14 text-center flex flex-col items-center justify-center relative overflow-hidden"
                            >
                                <div className="absolute inset-0 pattern-dots text-white opacity-5"></div>
                                <div className="relative z-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center mb-6 text-[#FB991A] border border-white/20 shadow-lg">
                                    <FiTarget size={40} />
                                </div>
                                <Typography className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                                    Selesai!
                                </Typography>
                                <Typography className="text-white/90 max-w-md mx-auto leading-relaxed text-lg font-medium mb-10">
                                    Berdasarkan jawabanmu, kami menemukan kandidat unggulan dari database beasiswa.
                                </Typography>
                                
                                <button
                                    onClick={() => router.push('/scholra/results')}
                                    className="w-full sm:w-auto px-10 py-5 bg-white text-[#1B7691] rounded-2xl font-black text-base uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10"
                                >
                                    Lihat Hasil Akhir <FiArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                     {/* Dot Progress Indicator at bottom of the column */}
                    {currentQuestion && !isLoading && (
                        <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-2">
                             {Array.from({ length: 12 }).map((_, i) => (
                                 <div 
                                    key={i} 
                                    className={`h-2 rounded-full transition-all duration-500 ${i < history.length ? 'w-6 bg-[#1B7691]' : i === history.length ? 'w-8 bg-[#FB991A]' : 'w-2 bg-gray-200'}`} 
                                 />
                             ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
