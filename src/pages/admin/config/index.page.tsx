import React, { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiRefreshCw, FiClock, FiTag, FiInfo } from 'react-icons/fi';

import SEO from '@/components/SEO';
import withAuth from '@/components/hoc/withAuth';
import api from '@/lib/api';
import AdminDashboard from '@/layouts/AdminDashboard';

type PromoCode = {
  id: string;
  code: string;
  type: string;
  is_active: boolean;
  discount_percent: number | null;
  discount_amount: number | null;
};

const AdminConfigPage = () => {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [editedConfigs, setEditedConfigs] = useState<Record<string, string>>({});
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([fetchConfigs(), fetchPromoCodes()]).finally(() => setIsLoading(false));
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/pricing/admin/config');
      const data = response.data?.data || {};
      setConfigs(data);
      setEditedConfigs(data);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const response = await api.get('/pricing/admin/promos');
      const data = response.data?.data || [];
      setPromoCodes(data);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
    }
  };

  const hasChanges = () => {
    return Object.keys(editedConfigs).some(key => editedConfigs[key] !== configs[key]);
  };

  const handleSave = async () => {
    const changedConfigs = Object.entries(editedConfigs)
      .filter(([key, value]) => value !== configs[key])
      .map(([key, value]) => ({ key, value }));

    if (changedConfigs.length === 0) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);
      await api.patch('/pricing/admin/config', { configs: changedConfigs });
      setConfigs({ ...editedConfigs });
      setSaveMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      setSaveMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal menyimpan konfigurasi',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setEditedConfigs({ ...configs });
    setSaveMessage(null);
  };

  const activePromos = promoCodes.filter(p => p.is_active);
  const selectedPromo = promoCodes.find(p => p.code === editedConfigs['NEW_USER_OFFER_PROMO_CODE']);

  const formatDiscount = (promo: PromoCode) => {
    if (promo.discount_percent) return `${promo.discount_percent}%`;
    if (promo.discount_amount) return `Rp${promo.discount_amount.toLocaleString('id-ID')}`;
    return '-';
  };

  return (
    <AdminDashboard withSidebar>
      <SEO title="Admin - Konfigurasi Sistem | Raihasa" />

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiSettings className="text-[#1B7691]" />
              Konfigurasi Sistem
            </h1>
            <p className="text-gray-500 mt-2">
              Atur parameter flash sale onboarding dan konfigurasi lainnya. Perubahan langsung berlaku tanpa restart.
            </p>
          </div>
        </div>

        {saveMessage && (
          <div className={`mb-6 px-5 py-3 rounded-2xl text-sm font-medium ${
            saveMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {saveMessage.text}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#1B7691] to-[#0d5a6e] px-8 py-5">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <FiClock className="w-5 h-5" />
                  Onboarding Flash Sale (Timebomb)
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Diskon otomatis untuk user baru setelah mendaftar
                </p>
              </div>

              <div className="p-8 space-y-6">
                {/* Durasi Flash Sale */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <FiClock className="w-5 h-5" />
                    Durasi Flash Sale (menit)
                  </label>
                  <input
                    type="number"
                    value={editedConfigs['NEW_USER_OFFER_WINDOW_MINUTES'] || ''}
                    onChange={e => setEditedConfigs(prev => ({ ...prev, NEW_USER_OFFER_WINDOW_MINUTES: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] focus:border-transparent text-gray-800 transition-all"
                    placeholder="60"
                    min="1"
                  />
                  <p className="text-xs text-gray-400 flex items-start gap-1">
                    <FiInfo className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    Berapa menit setelah user baru daftar, flash sale masih aktif. Contoh: 60 = 1 jam, 1440 = 1 hari.
                  </p>
                </div>

                {/* Kode Promo - Dropdown */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <FiTag className="w-5 h-5" />
                    Kode Promo Flash Sale
                  </label>
                  <select
                    value={editedConfigs['NEW_USER_OFFER_PROMO_CODE'] || ''}
                    onChange={e => setEditedConfigs(prev => ({ ...prev, NEW_USER_OFFER_PROMO_CODE: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B7691] focus:border-transparent text-gray-800 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Pilih Kode Promo --</option>
                    {activePromos.map(promo => (
                      <option key={promo.id} value={promo.code}>
                        {promo.code} ({promo.type} — diskon {formatDiscount(promo)})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 flex items-start gap-1">
                    <FiInfo className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    Pilih kode promo yang otomatis diterapkan untuk user baru. Hanya promo aktif yang ditampilkan.
                  </p>
                  {selectedPromo && (
                    <div className="mt-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                      <span className="font-semibold text-blue-700">{selectedPromo.code}</span>
                      <span className="text-blue-600 ml-2">
                        — {selectedPromo.type} · Diskon {formatDiscount(selectedPromo)}
                        {!selectedPromo.is_active && <span className="text-red-500 ml-1">(Nonaktif)</span>}
                      </span>
                    </div>
                  )}
                  {activePromos.length === 0 && (
                    <div className="mt-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                      Belum ada kode promo aktif. Buat dulu di halaman <a href="/admin/promos" className="underline font-semibold">Manajemen Promo</a>.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleReset}
                disabled={!hasChanges() || isSaving}
                className="px-6 py-3 rounded-2xl font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges() || isSaving}
                className="px-8 py-3 rounded-2xl font-bold bg-[#1B7691] text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2 mb-2">
                <FiInfo className="w-4 h-4" />
                Cara Kerja Flash Sale
              </h3>
              <ul className="text-amber-700 text-sm space-y-1.5">
                <li>• User baru mendaftar → timer flash sale mulai berjalan</li>
                <li>• Selama durasi yang diatur, user melihat countdown + harga diskon di halaman pricing</li>
                <li>• Kode promo yang dipilih harus sudah ada dan aktif di halaman Manajemen Promo</li>
                <li>• Diskon flash sale bisa stack dengan kode promo lain (maks 70% total, min Rp10.000 final)</li>
                <li>• Perubahan di sini langsung berlaku untuk user baru berikutnya</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};

export default withAuth(AdminConfigPage, 'admin');
