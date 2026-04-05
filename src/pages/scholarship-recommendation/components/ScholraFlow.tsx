import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight, FiCheck, FiChevronLeft,
    FiStar, FiChevronRight, FiCheckCircle, FiTarget, FiActivity
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
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const getMascotDialogue = () => {
        if (isLoading) return 'Scholra sedang menghitung skor kecocokan berdasarkan profilmu.';
        if (!currentQuestion) return 'Analisis selesai. Rekomendasi beasiswa siap ditinjau.';

        const qId = currentQuestion.id;
        const dialogs: Record<string, string> = {
            jenjang: 'Silakan pilih jenjang pendidikanmu saat ini untuk memulai penyaringan dasar.',
            tujuan_negara: 'Pilihan tujuan studi membantu menyesuaikan beasiswa dalam negeri atau luar negeri.',
            jenis_bantuan: 'Silakan pilih tipe pendanaan yang paling sesuai dengan preferensimu.',
            umur: 'Informasi usia dipakai untuk mengecek syarat batas usia pada beasiswa tertentu.',
            ipk: 'Jika sudah tersedia, isi IPK untuk meningkatkan akurasi penilaian kecocokan.',
            semester: 'Semester saat ini membantu menilai kesesuaian pada program dengan syarat semester.',
            ekonomi: 'Informasi ini digunakan untuk memprioritaskan program afirmasi ekonomi secara tepat.',
            disabilitas: 'Jika relevan, sistem akan memprioritaskan program dengan dukungan kebutuhan khusus.',
            agama: 'Pertanyaan ini digunakan hanya untuk mencocokkan beasiswa berbasis lembaga keagamaan.',
            gender_khusus: 'Jawaban ini dipakai untuk menilai kecocokan pada program khusus perempuan.',
            bahasa: 'Sertifikat bahasa menjadi faktor penting terutama untuk beasiswa luar negeri.',
            double: 'Informasi ini membantu memastikan rekomendasi sesuai kebijakan rangkap beasiswa.'
        };

        return dialogs[qId] || 'Lengkapi profil agar sistem dapat memberikan rekomendasi yang akurat.';
    };

    const ensurerArray = (val: any): string[] => {
        if (!val) return [];

        const normalizeNarrative = (input: string): string[] => {
            if (!input) return [];

            let normalized = input.replace(/\r/g, '\n').trim();

            // Add virtual line breaks before common section markers to avoid one giant paragraph.
            normalized = normalized.replace(
                /(Syarat\s*&\s*Ketentuan|Benefit\s*Beasiswa|Dokumen\s*yang\s*Dibutuhkan|Persyaratan\s*:|Lainnya|Booklet|Informasi\s*Selengkapnya)/gi,
                '\n$1'
            );

            return normalized
                .split(/\n+|\|+/)
                .map(part => part.trim())
                .filter(Boolean);
        };

        let target = val;
        // Unwrap single-item array containing a stringified list
        if (Array.isArray(target) && target.length === 1 && typeof target[0] === 'string' && target[0].trim().startsWith('[')) {
            target = target[0];
        }
        if (Array.isArray(target)) {
            return target
                .flatMap(i => normalizeNarrative(String(i).replace(/[\[\]'"]/g, '').trim()))
                .filter(Boolean);
        }
        if (typeof target === 'string') {
            let cleaned = target.trim();
            if (cleaned.startsWith('[') && cleaned.endsWith(']')) cleaned = cleaned.slice(1, -1);
            return normalizeNarrative(cleaned.replace(/['"]/g, ''));
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
        jenis: raw.jenis,
        deadline_status: raw.deadline_status,
        days_left: raw.days_left,
        dims: raw.dims,
    });

    const fetchNextStep = async (updatedAnswers: Record<string, any>) => {
        setIsLoading(true);
        try {
            const response = await api.post('/scholarship/scholra', { answers: updatedAnswers });
            const {
                nextQuestion,
                results: rawResults,
                remainingCount,
                validationErrors: backendValidationErrors,
            } = response.data;

            const mappedResults = (rawResults || []).map(mapToResult);

            setCurrentQuestion(nextQuestion);
            setResults(mappedResults);
            setRemainingCount(remainingCount);
            setValidationErrors(Array.isArray(backendValidationErrors) ? backendValidationErrors : []);

            if (mappedResults.length > 0) {
                localStorage.setItem('scholarship_recommendations', JSON.stringify(mappedResults));
            }

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
        setValidationErrors([]);
        fetchNextStep({});
    };

    return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 mt-10 px-4">

            <aside className="space-y-5 lg:sticky lg:top-28 h-fit">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <Typography className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Ringkasan Profil
                    </Typography>
                    <div className="flex items-center justify-between mb-4">
                        <Typography className="text-sm text-gray-600">Kandidat Tersedia</Typography>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1B7691]/10 text-[#1B7691] font-bold text-sm">
                            <FiActivity size={15} /> {remainingCount}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Typography className="text-sm text-gray-600">Progress Profil</Typography>
                            <Typography className="text-sm font-bold text-gray-900">
                                {Math.min(100, Math.round((history.length / 12) * 100))}%
                            </Typography>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(history.length / 12) * 100}%` }}
                                className="h-full bg-[#1B7691]"
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={getMascotDialogue()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                    >
                        <Typography className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            Panduan Langkah
                        </Typography>
                        <Typography className="text-sm leading-relaxed text-gray-700">
                            {getMascotDialogue()}
                        </Typography>
                    </motion.div>
                </AnimatePresence>
            </aside>

            <section className="w-full min-h-[640px]">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 border-8 border-gray-100 border-t-[#1B7691] rounded-full animate-spin mb-6" />
                            <Typography className="text-gray-400 font-black uppercase tracking-widest text-xs">Memproses Data Beasiswa...</Typography>
                        </motion.div>
                    ) : currentQuestion ? (
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                        >
                            <div className="p-8 md:p-10 flex-1 flex flex-col">
                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-2 bg-[#1B7691]/10 px-3 py-1.5 rounded-lg text-[#1B7691] mb-5">
                                        <FiStar size={14} className="fill-current" />
                                        <Typography className="text-[10px] font-black uppercase tracking-[0.2em]">Langkah {history.length + 1}</Typography>
                                    </div>
                                    <Typography className="text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                                        {currentQuestion.text}
                                    </Typography>
                                </div>

                                {validationErrors.length > 0 && (
                                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
                                        <Typography className="text-xs font-black uppercase tracking-widest text-red-700 mb-2">
                                            Periksa Data Profil
                                        </Typography>
                                        {validationErrors.map((message, index) => (
                                            <Typography key={index} className="text-sm text-red-700 leading-relaxed">
                                                {message}
                                            </Typography>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 max-w-2xl mt-auto">
                                    {currentQuestion.type === 'input_number' ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                            <input
                                                type="number"
                                                step={currentQuestion.id === 'umur' ? '1' : '0.01'}
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                                                className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 focus:border-[#1B7691] focus:bg-white rounded-xl outline-none font-bold text-2xl transition-all"
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
                                                className="w-20 bg-[#1B7691] text-white rounded-xl font-black flex items-center justify-center hover:bg-[#15627a] transition-all"
                                            >
                                                <FiCheck size={28} />
                                            </button>
                                            </div>
                                            {currentQuestion.id === 'ipk' && (
                                                <button
                                                    onClick={() => handleAnswer(currentQuestion.id, 'skip')}
                                                    className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:border-[#1B7691] hover:text-[#1B7691] transition-all"
                                                >
                                                    Lewati untuk saat ini
                                                </button>
                                            )}
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
                                                        className="group w-full text-left px-5 py-4 bg-white border border-gray-200 rounded-xl hover:border-[#1B7691] hover:bg-[#1B7691]/5 transition-all flex items-center justify-between"
                                                    >
                                                        <Typography className="font-bold text-gray-700 group-hover:text-[#1B7691] text-base">{label}</Typography>
                                                        <FiChevronRight size={20} className="text-gray-300 group-hover:text-[#1B7691] transition-all transform group-hover:translate-x-1" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <button
                                    onClick={handleBack}
                                    disabled={history.length === 0}
                                    className="flex items-center gap-2 text-gray-500 hover:text-[#1B7691] font-bold uppercase text-[11px] tracking-wider transition-all disabled:opacity-40"
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
                            className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-10 md:p-14 text-center flex flex-col items-center justify-center"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-8 text-emerald-600">
                                <FiCheckCircle size={56} />
                            </div>
                            <Typography className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                                Analisis Selesai
                            </Typography>
                            <Typography className="text-gray-600 mb-10 max-w-lg leading-relaxed text-base font-medium">
                                Sistem telah menyiapkan rekomendasi beasiswa berdasarkan profil yang kamu isi.
                            </Typography>
                            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                                <button
                                    onClick={() => router.push('/scholra/results')}
                                    className="flex-1 py-4 bg-[#1B7691] text-white rounded-xl font-black text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 group hover:bg-[#15627a]"
                                >
                                    Lihat Beasiswa Pilihan <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={reset}
                                    className="w-full md:w-auto px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Ulangi
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
}
