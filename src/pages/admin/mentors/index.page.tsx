import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiMail, FiPhone, FiMapPin, FiCreditCard, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

import AdminDashboard from '@/layouts/AdminDashboard';
import SEO from '@/components/SEO';
import withAuth from '@/components/hoc/withAuth';
import api from '@/lib/api';

type Mentor = {
  id: string;
  name: string;
  status: string;
  address: string | null;
  phone: string | null;
  email: string;
  accountNumber: string | null;
  bankName: string | null;
  created_at: string;
};

function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    status: 'Mentor',
    address: '',
    phone: '',
    email: '',
    accountNumber: '',
    bankName: '',
  });

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/mentors', {
        params: { search: search || undefined }
      });
      setMentors(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      toast.error('Gagal mengambil data mentor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMentors();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleOpenModal = (mentor?: Mentor) => {
    if (mentor) {
      setModalMode('edit');
      setEditingMentorId(mentor.id);
      setFormData({
        name: mentor.name,
        status: mentor.status || 'Mentor',
        address: mentor.address || '',
        phone: mentor.phone || '',
        email: mentor.email,
        accountNumber: mentor.accountNumber || '',
        bankName: mentor.bankName || '',
      });
    } else {
      setModalMode('create');
      setEditingMentorId(null);
      setFormData({
        name: '',
        status: 'Mentor',
        address: '',
        phone: '',
        email: '',
        accountNumber: '',
        bankName: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Nama dan Email wajib diisi');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/admin/mentors', formData);
        toast.success('Berhasil menambahkan mentor baru');
      } else if (modalMode === 'edit' && editingMentorId) {
        await api.put(`/admin/mentors/${editingMentorId}`, formData);
        toast.success('Berhasil memperbarui data mentor');
      }
      setIsModalOpen(false);
      fetchMentors();
    } catch (error: any) {
      console.error('Failed to save mentor:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan data mentor');
    }
  };

  const handleDeleteMentor = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus mentor "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/mentors/${id}`);
      toast.success('Mentor berhasil dihapus');
      fetchMentors();
    } catch (error) {
      console.error('Failed to delete mentor:', error);
      toast.error('Gagal menghapus mentor');
    }
  };

  return (
    <>
      <SEO title="Kelola Mentor | Admin Raih Asa" />
      <AdminDashboard withSidebar>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Kelola Mentor
              </h1>
              <p className="text-gray-500 mt-1">
                Daftar mentor aktif yang terintegrasi dengan generator kuitansi pembayaran.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Tambah Mentor</span>
            </button>
          </div>

          {/* Search bar & statistics bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <FiSearch className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Cari nama atau email mentor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-gray-400"
              />
            </div>
          </div>

          {/* Mentor list cards/table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-500 mt-4 font-medium">Memuat data mentor...</p>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                <FiUser className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada mentor ditemukan</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {search
                  ? `Tidak ada hasil untuk pencarian "${search}". Coba kata kunci lain.`
                  : 'Belum ada data mentor yang tersimpan. Klik tombol di atas untuk menambahkan.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {mentor.status || 'Mentor'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-1">
                          {mentor.name}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(mentor)}
                          title="Edit"
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMentor(mentor.id, mentor.name)}
                          title="Hapus"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="flex items-start text-sm text-gray-600 gap-2.5">
                        <FiMail className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="break-all">{mentor.email}</span>
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-600 gap-2.5">
                        <FiPhone className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{mentor.phone || <span className="text-gray-400 italic">Tidak ada nomor telp</span>}</span>
                      </div>

                      <div className="flex items-start text-sm text-gray-600 gap-2.5">
                        <FiMapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {mentor.address || <span className="text-gray-400 italic">Tidak ada alamat</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bank info footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center gap-2.5">
                    <FiCreditCard className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-gray-700">
                        {mentor.bankName || <span className="text-gray-400 font-normal italic">Bank belum diisi</span>}
                      </p>
                      <p className="text-gray-500">
                        {mentor.accountNumber || <span className="text-gray-400 italic">Rekening belum diisi</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Form */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl max-w-xl w-full shadow-xl transform transition-all my-8 overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">
                    {modalMode === 'create' ? 'Tambah Mentor Baru' : 'Edit Data Mentor'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit}>
                  <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    {/* Status & Email in Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Peran / Status <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="status"
                          required
                          value={formData.status}
                          onChange={handleInputChange}
                          placeholder="e.g. Mentor / Speaker"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Alamat Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="e.g. mentor@domain.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nomor Telepon
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 081234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Alamat Tinggal
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Tuliskan alamat lengkap mentor..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                      />
                    </div>

                    {/* Bank Details in Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Nama Bank
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          placeholder="e.g. Bank Central Asia (BCA)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Nomor Rekening
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          placeholder="e.g. 1234567890"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg focus:outline-none transition-colors"
                    >
                      {modalMode === 'create' ? 'Tambah' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AdminDashboard>
    </>
  );
}

export default withAuth(AdminMentorsPage, 'admin');
