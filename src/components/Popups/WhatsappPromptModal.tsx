import React, { useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';
import { showToast, SUCCESS_TOAST, DANGER_TOAST } from '@/components/Toast';
import Button from '@/components/buttons/Button';
import Typography from '@/components/Typography';

export default function WhatsappPromptModal() {
  const user = useAuthStore.useUser();
  const isAuthenticated = useAuthStore.useIsAuthenticated();
  const login = useAuthStore.useLogin();

  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal only triggers for standard authenticated users who haven't filled in their whatsapp
  const showModal = isAuthenticated && user && user.role === 'USER' && !user.whatsapp;

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation (must start with 08 or +62 or 62 and be at least 9 chars)
    const cleanedVal = whatsapp.trim().replace(/[^0-9+]/g, '');
    if (!/^(08|\+?62|62)\d{7,13}$/.test(cleanedVal)) {
      showToast('Format nomor WhatsApp kurang pas. Gunakan format seperti 081234567xxx atau +6281234567xxx.', DANGER_TOAST);
      return;
    }

    setLoading(true);
    try {
      await api.patch('/auth/me', { whatsapp: cleanedVal });
      
      // Update Zustand local storage with the new user profile state
      login({
        ...user,
        whatsapp: cleanedVal,
      });

      showToast('Nomor WhatsApp berhasil disimpan! Selamat datang di Raih Asa. 🚀', SUCCESS_TOAST);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Gagal menyimpan nomor WhatsApp. Coba lagi ya!';
      showToast(errMsg, DANGER_TOAST);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div 
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 transform scale-100 transition-all duration-300 flex flex-col items-center text-center"
      >
        {/* Decorative Badge Icon */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.331A9.972 9.972 0 0012.01 19.99c5.507 0 9.989-4.478 9.99-9.984A9.995 9.995 0 0012.012 2zm5.723 14.15c-.244.688-1.201 1.252-1.657 1.298-.444.043-.902.052-2.735-.67-2.34-.925-3.83-3.232-3.946-3.387-.116-.156-.948-1.233-.948-2.35 0-1.116.59-1.654.802-1.872.21-.218.463-.272.617-.272.155 0 .309.001.442.008.14.006.326-.052.51.385.19.45.65 1.558.707 1.674.056.115.093.25.016.398-.076.155-.115.25-.23.385-.115.136-.242.302-.346.406-.115.116-.237.242-.102.47.135.228.601.968 1.29 1.566.885.772 1.63 1.01 1.857 1.117.228.106.362.09.497-.061.136-.156.59-.672.748-.9.155-.228.31-.19.522-.116.212.076 1.348.621 1.58.73.23.11.383.167.44.264.057.1.057.57-.187 1.259z"/>
          </svg>
        </div>

        <Typography variant="h5" className="font-extrabold text-gray-900 mb-2">
          Satu Langkah Lagi! 🚀
        </Typography>
        
        <Typography className="text-gray-500 text-xs font-semibold leading-relaxed mb-6">
          Yuk isi nomor WhatsApp aktif kamu untuk mempermudah penerimaan status pendaftaran, promo harga, dan konsultasi mentor beasiswa.
        </Typography>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input
              type="text"
              required
              placeholder="Contoh: 081234567xxx"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-250 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-center font-bold text-gray-800 placeholder-gray-400 text-sm transition-all shadow-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center"
          >
            {loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
          </Button>
        </form>
      </div>
    </div>
  );
}
