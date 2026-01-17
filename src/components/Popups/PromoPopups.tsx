import FingerprintJS from '@fingerprintjs/fingerprintjs';
import React, { useState, useEffect } from 'react';
import { X, Check, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import useAuthStore from '@/store/useAuthStore';
import { User } from '@/types/entities/user';
import { getToken } from '@/lib/cookies';
import { FaWhatsapp } from 'react-icons/fa';

const PromoPopup: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const user = useAuthStore.useUser() as User | null;

  useEffect(() => {
    // Show popup only if not logged in or if logged in but hasn't seen it in session
    // (Adjust logic as needed, usually promo pops up for everyone or based on rules)
    const alreadyShown = sessionStorage.getItem('promoPopupShown');
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShowPopup(true);
      document.body.style.overflow = 'hidden';
      sessionStorage.setItem('promoPopupShown', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    document.body.style.overflow = 'unset';
  };

  const handleSelectPlan = (planId: string) => {
    // Redirect to payment page with product ID
    handleClose();
    if (!user) {
      router.push(`/auth/login?redirect=/payment?productId=${planId}`);
    } else {
      router.push(`/payment?productId=${planId}`);
    }
  };

  const handleConsultation = () => {
    const message = encodeURIComponent("Halo Admin Raih Asa, saya tertarik untuk paket Bisnis/Partner (Enterprise/Parents). Boleh minta info lebih lanjut?");
    window.open(`https://wa.me/6285117323893?text=${message}`, '_blank');
  };

  if (!showPopup) return null;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        @keyframes popupScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-poppins"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}
      >
        <div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 md:p-8 animate-[popupScaleIn_0.3s_ease-out_forwards]"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-gray-100/80 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>

          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10 pt-4">
            <span className="inline-block py-1 px-3 rounded-full bg-gradient-to-r from-[#FB991A]/10 to-[#DB4B24]/10 text-[#DB4B24] text-xs font-bold tracking-wider uppercase mb-3 border border-[#FB991A]/20">
              Special Offer
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Investasi Terbaik untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB991A] to-[#DB4B24]">Masa Depanmu</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Pilih paket membership yang sesuai dengan target beasiswamu. Akses materi eksklusif dan mentoring langsung dari ahlinya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* GO Package */}
            <div className="flex flex-col p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#FB991A]/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 relative group">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FB991A] transition-colors">GO Plan</h3>
                <p className="text-xs text-gray-500 mt-1">Start your journey</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">Rp49rb</span>
                  <span className="text-gray-400 text-sm font-medium">/ 3 bulan</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Akses Video dan berkas",
                  "Ebook Roadmap Kuliah",
                  "E-Learning Videos (LN & DN)",
                  "Monthly Live Class",
                  "5x Dreamshub Consultation"
                ].map((feat, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-[#FB991A] mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('new-card')}
                className="w-full py-3 rounded-xl font-semibold text-[#FB991A] bg-[#FB991A]/10 hover:bg-[#FB991A] hover:text-white transition-all duration-300"
              >
                Pilih Paket GO
              </button>
            </div>

            {/* PRO Package (Highlighted) */}
            <div className="flex flex-col p-6 rounded-2xl border-2 border-[#FB991A] bg-[#FFFBF5] shadow-xl relative scale-[1.02] z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FB991A] to-[#DB4B24] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Most Popular
              </div>
              <div className="mb-4 mt-2">
                <h3 className="text-xl font-bold text-[#DB4B24]">PRO Plan</h3>
                <p className="text-xs text-[#d97706]/80 mt-1">Best value for serious learners</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">Rp169rb</span>
                  <span className="text-gray-500 text-sm font-medium">/ 12 bulan</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Semua Fitur GO Plan",
                  "Akses Video dan berkas Premium",
                  "Ebook Roadmap Kuliah Lengkap",
                  "Monthly Exclusive Class",
                  "10x Dreamshub Consultation"
                ].map((feat, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-800">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-[#FB991A] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('ideal-plan')}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#FB991A] to-[#DB4B24] hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Pilih Paket PRO
              </button>
            </div>

            {/* Partner/Business Package */}
            <div className="flex flex-col p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#1B7691]/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">Bisnis / Partner</h3>
                <p className="text-xs text-gray-500 mt-1">For Enterprise & Parents</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">Custom</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Harga menyesuaikan kebutuhan</p>
              </div>

              <div className="flex-1 mb-6 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Solusi terbaik untuk Sekolah, Yayasan/Enterprise, atau Orang Tua yang ingin bimbingan intensif dan personal.
                </p>
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-500 italic text-center">
                    "Recommended for School Partnership program"
                  </p>
                </div>
              </div>

              <button
                onClick={handleConsultation}
                className="w-full py-3 rounded-xl font-semibold text-[#1B7691] border border-[#1B7691]/20 bg-[#1B7691]/5 hover:bg-[#1B7691] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5" />
                Hubungi Kami
              </button>
            </div>

          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Masih bingung? <a href="https://wa.me/6285117323893" target="_blank" rel="noreferrer" className="text-[#FB991A] hover:underline">Chat Tim Kami</a> untuk konsultasi gratis.
          </p>
        </div>
      </div>
    </>
  );
};

export default PromoPopup;
