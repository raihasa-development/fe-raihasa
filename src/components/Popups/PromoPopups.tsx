import FingerprintJS from '@fingerprintjs/fingerprintjs';
import React, { useState, useEffect } from 'react';
import { X, Check, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import useAuthStore from '@/store/useAuthStore';
import { User } from '@/types/entities/user';
import { getToken } from '@/lib/cookies';
import { FaWhatsapp } from 'react-icons/fa';

import api from '@/lib/api';

const PromoPopup: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const user = useAuthStore.useUser() as User | null;

  useEffect(() => {
    // Check if already shown in this session
    const alreadyShown = sessionStorage.getItem('promoPopupShown');
    if (alreadyShown) return;

    let timer: NodeJS.Timeout;

    const checkPremiumAndShow = async () => {
      try {
        const token = getToken();
        // If logged in, check premium status
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.user_id || payload.id || payload.sub;

          if (userId) {
            const res = await api.get(`/lms/user/${userId}`);
            const lmsData = res.data?.data;

            // If user has active subscription, don't show popup
            if (lmsData?.end && new Date(lmsData.end) > new Date()) {
              // Mark as shown so we don't check again this session
              sessionStorage.setItem('promoPopupShown', 'true');
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error checking premium status for popup:", error);
        // On error, we proceed to show popup (safer to show than not)
      }

      // If not premium (or not logged in), show popup after delay
      timer = setTimeout(() => {
        setShowPopup(true);
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem('promoPopupShown', 'true');
      }, 2000);
    };

    checkPremiumAndShow();

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    document.body.style.overflow = 'unset';
  };

  const handleSelectPlan = (planId: string) => {
    handleClose();
    router.push('/products');
  };

  const handleConsultation = () => {
    const message = encodeURIComponent(`Halo Raih Asa!
Saya tertarik untuk berdiskusi mengenai paket Enterprise/Partnership.

Nama:
Nama Institusi:
Asal Kota Institusi:
Pertanyaan/Kebutuhan:

Terima kasih!`);
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
              Awali langkah   <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB991A] to-[#DB4B24]">#JadiBisa </span>
              bareng Raih Asa sekarang!

            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Pilih paket membership yang sesuai dengan target beasiswamu. Akses materi eksklusif dan mentoring langsung dari ahlinya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* BISA Basic Package */}
            <div className="flex flex-col p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#FB991A]/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 relative group">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FB991A] transition-colors">BISA Basic</h3>
                <p className="text-xs text-gray-500 mt-1">Start your journey</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">49k</span>
                  <span className="text-gray-400 text-sm font-medium">/ 3 bulan</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Akses Seluruh Tutorial Beasiswa Dalam Negeri dan Luar Negeri",
                  "Exclusive E-Book",
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
                Pilih BISA Basic
              </button>
            </div>

            {/* BISA Plus+ Package (Highlighted) */}
            <div className="flex flex-col p-6 rounded-2xl border-2 border-[#FB991A] bg-[#FFFBF5] shadow-xl relative scale-[1.02] z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FB991A] to-[#DB4B24] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Most Popular
              </div>
              <div className="mb-4 mt-2">
                <h3 className="text-xl font-bold text-[#DB4B24]">BISA Plus+</h3>
                <p className="text-xs text-[#d97706]/80 mt-1">Best value for serious learners</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">169k</span>
                  <span className="text-gray-500 text-sm font-medium">/ 12 bulan</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Akses Seluruh Tutorial Beasiswa Dalam Negeri dan Luar Negeri",
                  "Exclusive E-Book",
                  "Monthly Live Class with Mentors",
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
                Pilih BISA Plus+
              </button>
            </div>

            {/* For Enterprise & Partners Package */}
            <div className="flex flex-col p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#1B7691]/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">For Enterprise & Partners</h3>
                <p className="text-xs text-gray-500 mt-1">Untuk Sekolah, Yayasan, & Komunitas</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">Custom</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Harga menyesuaikan kebutuhan</p>
              </div>

              <div className="flex-1 mb-6 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Berikan akses pendidikan beasiswa terbaik untuk seluruh siswa atau anak didik Anda secara terintegrasi. Solusi tepat untuk sekolah dan komunitas yang ingin mencetak lebih banyak peraih beasiswa dengan pemantauan terukur.
                </p>
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
