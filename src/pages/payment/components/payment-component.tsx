import React, { useState } from 'react';
import { FiCreditCard, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import Typography from '@/components/Typography';
import api from '@/lib/api';
import { getToken } from '@/lib/cookies';

interface PaymentComponentProps {
  productId: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  onPaymentSuccess: (orderId: string) => void;
}

export default function PaymentComponent({
  productId,
  productName,
  productPrice,
  productDescription,
  onPaymentSuccess,
}: PaymentComponentProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = getToken();
      
      if (!token) {
        setError('Anda harus login terlebih dahulu');
        setLoading(false);
        return;
      }

      // Decode JWT to get user_id
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 JWT Payload:', payload); // Debug: lihat isi token
      const user_id = payload.user_id || payload.id || payload.sub;
      
      if (!user_id) {
        setError('Tidak dapat mengidentifikasi user. Silakan login kembali.');
        setLoading(false);
        return;
      }
      
      // Log untuk debugging
      console.log('🔐 Token:', token ? 'Available' : 'Missing');
      console.log('👤 User ID:', user_id);
      console.log('📦 Payload:', {
        product_id: productId,
        user_id: user_id,
      });

      const response = await api.post(
        '/payments/create',
        {
          product_id: productId,
          user_id: user_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Payment response:', response.data);

      // Handle response
      const paymentData = response.data.data || response.data;
      
      if (paymentData.redirect_url) {
        console.log('🔗 Redirecting to:', paymentData.redirect_url);
        window.location.href = paymentData.redirect_url;
      } else if (paymentData.token) {
        console.log('💳 Opening Snap with token');
        // Check if Snap is loaded
        if (typeof window.snap === 'undefined') {
          setError('Midtrans Snap belum dimuat. Silakan refresh halaman.');
          return;
        }
        
        // @ts-ignore - Midtrans Snap global
        window.snap.pay(paymentData.token, {
          onSuccess: (result: any) => {
            console.log('✅ Payment success:', result);
            onPaymentSuccess(result.order_id);
          },
          onPending: (result: any) => {
            console.log('⏳ Payment pending:', result);
            setError('Pembayaran sedang diproses. Silakan cek email untuk instruksi lebih lanjut.');
          },
          onError: (result: any) => {
            console.error('❌ Payment error:', result);
            setError('Pembayaran gagal. Silakan coba lagi.');
          },
          onClose: () => {
            console.log('🚪 Payment popup closed');
            setLoading(false);
          },
        });
      } else {
        setError('Response tidak valid dari server. Silakan hubungi customer support.');
      }
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 404) {
        setError('Endpoint pembayaran tidak ditemukan. Silakan hubungi customer support.');
      } else if (err.response?.status === 401) {
        setError('Sesi Anda telah berakhir. Silakan login kembali.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Data tidak valid. Periksa kembali input Anda.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          'Terjadi kesalahan. Silakan coba lagi.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <Typography className="text-red-700 text-sm">{error}</Typography>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FB991A] focus:border-transparent transition-all duration-200"
            placeholder="Masukkan nama lengkap"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FB991A] focus:border-transparent transition-all duration-200"
            placeholder="nama@email.com"
          />
        </div>
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
          Nomor Telepon <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiPhone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FB991A] focus:border-transparent transition-all duration-200"
            placeholder="08123456789"
          />
        </div>
      </div>

      {/* Product Summary */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-5 border border-orange-200">
        <div className="flex items-center gap-3 mb-3">
          <FiCreditCard className="w-5 h-5 text-[#FB991A]" />
          <Typography className="text-sm font-semibold text-gray-900">
            Anda akan membeli: {productName}
          </Typography>
        </div>
        <Typography className="text-xs text-gray-600 leading-relaxed">
          {productDescription}
        </Typography>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#FB991A] to-[#C0172A] text-white py-4 rounded-lg font-bold text-base hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <FiCreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Bayar Sekarang - Rp {productPrice.toLocaleString('id-ID')}</span>
          </>
        )}
      </button>

      {/* Terms */}
      <Typography className="text-xs text-gray-500 text-center leading-relaxed">
        Dengan melanjutkan pembayaran, Anda menyetujui{' '}
        <a href="/terms" className="text-[#FB991A] hover:underline">Syarat & Ketentuan</a>
        {' '}serta{' '}
        <a href="/privacy" className="text-[#FB991A] hover:underline">Kebijakan Privasi</a>
        {' '}kami.
      </Typography>
    </form>
  );
}
