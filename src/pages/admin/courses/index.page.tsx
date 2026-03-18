import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiSearch, FiX, FiVideo, FiClock, FiBookOpen, FiSave, FiDownload } from 'react-icons/fi';
import AdminDashboard from '@/layouts/AdminDashboard';
import SEO from '@/components/SEO';
import withAuth from '@/components/hoc/withAuth';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Parse YouTube URL to extract video ID.
 */
function parseYouTubeUrl(url: string): string {
    if (!url) return '';
    if (/^[\w-]{11}$/.test(url)) return url;
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
        if (u.hostname.includes('youtube.com')) {
            if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1]?.split('?')[0] || '';
            return u.searchParams.get('v') || '';
        }
    } catch {
        // not a valid URL
    }
    return url;
}

const AdminCourseManagement = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<any>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/lms/modul');
            setCourses(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCourse = async (id: string, name: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus '${name}'?`)) return;
        try {
            await api.delete(`/admin/modules/${id}`);
            alert('Kursus berhasil dihapus');
            fetchCourses();
        } catch (error) {
            alert('Gagal menghapus kursus');
        }
    };

    const filteredCourses = courses.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.instructor && c.instructor.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AdminDashboard withSidebar>
            <SEO title="Admin - Manajemen Kursus | Raihasa" />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Kursus</h1>
                        <p className="text-gray-500 mt-1">Kelola seluruh konten video BISA Learning secara dinamis.</p>
                    </div>
                    <button
                        onClick={() => {
                            setCurrentCourse(null);
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 bg-[#1B7691] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#15627a] transition-all transform hover:scale-105 active:scale-95"
                    >
                        <FiPlus className="w-5 h-5" />
                        Tambah Kursus Baru
                    </button>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari judul kursus atau instruktur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1B7691] focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                            <span className="text-sm text-blue-600 font-bold">{courses.length} Total</span>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <FiBookOpen className="mx-auto w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium">Belum ada kursus found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col">
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                    {(course.ThumbnailModule || course.videoId) ? (
                                        <img
                                            src={course.ThumbnailModule || `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`}
                                            alt={course.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e: any) => {
                                                if (course.videoId && !e.target.src.includes('mqdefault')) {
                                                    e.target.src = `https://img.youtube.com/vi/${course.videoId}/mqdefault.jpg`;
                                                } else {
                                                    e.target.style.display = 'none';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <FiVideo className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => { setCurrentCourse(course); setIsModalOpen(true); }}
                                            className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id, course.name)}
                                            className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${course.schema_type === 'DALAM_NEGERI' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                            {course.schema_type === 'DALAM_NEGERI' ? 'Dalam Negeri' : 'Luar Negeri'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wide">{course.categoryId || 'Uncategorized'}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{course.name}</h3>
                                    
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <FiClock className="w-3 h-3" />
                                            <span className="text-xs font-medium">{course.duration || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-orange-400">
                                            <FiStar className="w-3 h-3 fill-current" />
                                            <span className="text-xs font-bold text-gray-700">{course.rating || '4.5'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl max-h-full flex flex-col overflow-hidden bg-white rounded-[2.5rem] shadow-2xl my-8"
                        >
                            <div className="flex-1 overflow-y-auto">
                                <CourseForm 
                                    isEdit={!!currentCourse} 
                                    data={currentCourse} 
                                    onClose={() => { setIsModalOpen(false); setCurrentCourse(null); fetchCourses(); }} 
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminDashboard>
    );
};

const CourseForm = ({ isEdit, data, onClose }: any) => {
    const [formData, setFormData] = useState({
        name: data?.name || '',
        instructor: data?.instructor || '',
        instructor_role: data?.instructor_role || '',
        duration: data?.duration || '',
        lessons_count: data?.lessons_count || 0,
        tags: data?.tags ? (Array.isArray(data.tags) ? data.tags.join(', ') : data.tags) : '',
        schema_type: data?.schema_type || 'DALAM_NEGERI',
        categoryId: data?.categoryId || '',
        videoUrl: data?.videoId ? `https://youtube.com/watch?v=${data.videoId}` : '',
        deskripsi: data?.deskripsi || '',
        thumbnail: data?.ThumbnailModule || '',
        pdfUrl: data?.pdfUrl || '',
        pdfName: data?.pdfName || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsSaving(true);

        const videoId = parseYouTubeUrl(formData.videoUrl);

        const payload = {
            name: formData.name,
            instructor: formData.instructor,
            instructor_role: formData.instructor_role,
            duration: formData.duration,
            lessons_count: Number(formData.lessons_count),
            tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
            schema_type: formData.schema_type,
            categoryId: formData.categoryId,
            videoId: videoId,
            deskripsi: formData.deskripsi,
            thumbnail: formData.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null),
            pdfUrl: formData.pdfUrl,
            pdfName: formData.pdfName,
        };

        try {
            if (isEdit) {
                await api.put(`/admin/modules/${data.id}`, payload);
                alert('Kursus berhasil diperbarui!');
            } else {
                await api.post('/admin/modules', payload);
                alert('Kursus baru berhasil ditambahkan!');
            }
            onClose();
        } catch (error) {
            console.error('Failed to save course:', error);
            alert('Gagal menyimpan kursus. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/50">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {isEdit ? 'Edit Materi Kursus' : 'Tambah Materi Baru'}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Lengkapi informasi konten pembelajaran di bawah ini.</p>
                </div>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                    <FiX size={24} />
                </button>
            </div>

            <div className="p-8 space-y-8">
                {/* General Info */}
                <section>
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-blue-600 rounded-full" /> Informasi Utama
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Judul Kursus</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                                placeholder="e.g. A-Z Beasiswa Pertamina"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Kategori Program</label>
                            <input 
                                type="text" 
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                                placeholder="e.g. pertamina-sobat-bumi"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Tipe Beasiswa</label>
                            <select 
                                value={formData.schema_type}
                                onChange={e => setFormData({ ...formData, schema_type: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium appearance-none"
                            >
                                <option value="DALAM_NEGERI">Dalam Negeri</option>
                                <option value="LUAR_NEGERI">Luar Negeri</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Media & Resources */}
                <section>
                    <h3 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-orange-600 rounded-full" /> Media & Materi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                <FiVideo size={14} /> Link Video (YouTube)
                            </label>
                            <input 
                                type="text" 
                                value={formData.videoUrl}
                                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                <FiDownload size={14} /> URL Download PDF
                            </label>
                            <input 
                                type="text" 
                                value={formData.pdfUrl}
                                onChange={e => setFormData({ ...formData, pdfUrl: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                                placeholder="Link Google Drive / PDF"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Nama File PDF</label>
                            <input 
                                type="text" 
                                value={formData.pdfName}
                                onChange={e => setFormData({ ...formData, pdfName: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                                placeholder="e.g. Materi Beasiswa.pdf"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Thumbnail (Optional)</label>
                            <input 
                                type="text" 
                                value={formData.thumbnail}
                                onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                                placeholder="Kosongkan untuk otomatis YouTube"
                            />
                        </div>
                    </div>
                </section>

                {/* Instructor & Content */}
                <section>
                    <h3 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-purple-600 rounded-full" /> Instruktur & Detail
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Nama Instruktur</label>
                            <input 
                                type="text" 
                                value={formData.instructor}
                                onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Role / Awardee</label>
                            <input 
                                type="text" 
                                value={formData.instructor_role}
                                onChange={e => setFormData({ ...formData, instructor_role: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Durasi / Label</label>
                            <input 
                                type="text" 
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                                placeholder="e.g. 45 Menit / Video Tutorial"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Jumlah Topik</label>
                            <input 
                                type="number" 
                                value={formData.lessons_count}
                                onChange={e => setFormData({ ...formData, lessons_count: Number(e.target.value) })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Deskripsi Lengkap</label>
                            <textarea 
                                rows={6}
                                value={formData.deskripsi}
                                onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium resize-none text-sm"
                                placeholder="Tuliskan materi apa saja yang dibahas..."
                            ></textarea>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Tags (Pisahkan koma)</label>
                            <input 
                                type="text" 
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-medium text-xs"
                                placeholder="Pertamina, Essay, Beasiswa"
                            />
                        </div>
                    </div>
                </section>
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 font-bold text-gray-500 hover:text-gray-700 hover:bg-white rounded-2xl transition-all"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : <FiSave />}
                    {isEdit ? 'SIMPAN PERUBAHAN' : 'TERBITKAN KURSUS'}
                </button>
            </div>
        </form>
    );
};

export default withAuth(AdminCourseManagement, 'admin');
