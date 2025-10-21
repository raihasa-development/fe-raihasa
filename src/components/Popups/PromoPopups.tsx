
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import api from '@/lib/api';
import { User } from '@/types/entities/user';
import { getToken } from '@/lib/cookies';
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaFileAlt,
  FaCalendarAlt,
} from 'react-icons/fa';
import useAuthStore from '@/store/useAuthStore';
import {
  DANGER_TOAST,
  showToast,
  SUCCESS_TOAST,
  WARNING_TOAST,
} from '@/components/Toast';

const PromoPopup: React.FC = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);
  const [showPricingPopup, setShowPricingPopup] = useState(false);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const user = useAuthStore.useUser() as User | null;

  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
    };
    loadFingerprint();
  }, []);

  const checkTrialStatus = useCallback(async (userId: number, token: string) => {
    try {
      const res = await api.get(`/lms/trial/user/${userId}/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return !res.data.status;
    } catch (err: any) {
      if (err.response?.status === 404) return true;
      return false;
    }
  }, []);

  useEffect(() => {
  const runCheck = async () => {
    const token = getToken();
    if (!token || !user) return; // kalau belum login, skip

    const expired = await checkTrialStatus(user.id, user.token);

    if (expired) {
      setIsTrialExpired(true);
      setShowExpiredPopup(true);
    }
  };

  const timer = setTimeout(runCheck, 1000);
  return () => clearTimeout(timer);
}, [user]);


  useEffect(() => {
    const runCheck = async () => {
      const token = getToken();
      const alreadyShown = sessionStorage.getItem('promoPopupShown');
      if (alreadyShown) return;

      if (!token || !user) {
        setTimeout(() => {
          setShowPopup(true);
          document.body.style.overflow = 'hidden';
          const mainContent = document.querySelector('main');
          if (mainContent) {
            (mainContent as HTMLElement).style.filter = 'blur(2px) brightness(0.4)';
            (mainContent as HTMLElement).style.transition = 'filter 0.3s ease-in-out';
          }
          sessionStorage.setItem('promoPopupShown', 'true');
        }, 1500);
        return;
      }

    const result = await checkTrialStatus(user.id, user.token);
    console.log('[PromoPopup] Trial expired status:', result);
  
      if (result) {
        setIsTrialExpired(true);
        setShowExpiredPopup(true);
      }
      
    };
    runCheck();

    return () => {
      document.body.style.overflow = 'unset';
      const mainContent = document.querySelector('main');
      if (mainContent) (mainContent as HTMLElement).style.filter = 'none';
    };
  }, [user, checkTrialStatus]);

  const handleCloseAll = () => {
    setShowPopup(false);
    setShowExpiredPopup(false);
    setShowPricingPopup(false);
    document.body.style.overflow = 'unset';
    const mainContent = document.querySelector('main');
    if (mainContent) (mainContent as HTMLElement).style.filter = 'none';
  };

  const handleTrialClick = async () => {
    if (!user?.token) {
      showToast('Silahkan Register atau Login Dahulu', WARNING_TOAST);
      router.replace('/auth/register');
      return;
    }
    setLoading(true);
    try {
      await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const res = await api.get('/products/booster?program=LMS', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const productId = res.data?.data[0]?.id;
      const trialBody = { product_id: productId, device_id: deviceId };
      const trialRes = await api.post('/lms/trial', trialBody, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const message = trialRes.data?.message || 'Trial berhasil dimulai!';
      showToast(message, SUCCESS_TOAST);
      handleCloseAll();
      router.push('/dashboard');
    } catch (err: any) {
      let message = 'Terjadi kesalahan, coba lagi.';
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;
        if (status === 401) message = 'Token tidak valid, silakan login ulang.';
        else if (status === 409) message = serverMessage || 'Trial sudah pernah dibuat.';
        else if (status === 400) message = serverMessage || 'Request tidak valid.';
        else if (status >= 500) showToast('Berhasil Trial', SUCCESS_TOAST);
        else message = serverMessage || message;
      } else if (err.message) message = err.message;
      showToast(message, DANGER_TOAST);
    } finally {
      setLoading(false);
    }
  };

  const handleGoPremium = () => {
    setShowPopup(false);
    setShowExpiredPopup(false);
    setShowPricingPopup(true);
  };


  return (
    <>
      <style jsx global>{`
        @keyframes popupFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      {showPopup && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          animation: 'popupFadeIn 0.4s ease-out forwards',
        }}
      >
        <div
          className="relative w-full max-w-sm mx-auto my-8 overflow-hidden bg-white shadow-2xl rounded-2xl sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
          style={{
            opacity: 0,
            transform: 'translateY(20px) scale(0.96)',
            animation: 'popupSlideIn 0.4s ease-out 0.1s forwards',
          }}
        >
          <button
            onClick={handleCloseAll}
            className="absolute z-10 flex items-center justify-center p-2 transition-all duration-200 bg-white rounded-full top-3 right-3 bg-opacity-90 hover:bg-opacity-100 hover:scale-110"
          >
            <X size={20} className="text-gray-600" />
          </button>

          <div
            className="px-4 pt-10 pb-5 text-center text-white sm:px-6"
            style={{
              background: 'linear-gradient(135deg, #1B7691 0%, #FB991A 70%)',
            }}
          >
            <div className="inline-flex items-center justify-center mb-3 bg-white rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-opacity-20">
              <Image
                src="/images/landing/haira-hero-mobile.png"
                alt="icon"
                width={56}
                height={56}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
            <h2 className="mb-2 text-xl font-bold sm:text-2xl md:text-3xl">
              Saatnya <span style={{ color: '#26aebe' }}>#JadiBisa</span>
            </h2>
            <p className="text-xs text-white sm:text-md md:text-base text-opacity-90">
              <span style={{ color: '#26aebe' }}>#JadiBisa</span> Wujudkan Impianmu 🚀
            </p>
          </div>

          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <div className="mb-6 space-y-5 sm:mb-8 sm:space-y-6">
              {[
                {
                  icon: <FaGraduationCap size={24} className="mt-1 text-blue-600" />,
                  title: 'Sholra Scholarship Matching',
                  desc: 'Ngga bingung dan takut ketinggalan beasiswa yang 100% sesuai profilmu',
                },
                {
                  icon: <FaChalkboardTeacher size={24} className="mt-1 text-green-600" />,
                  title: 'A-Z Scholarship Series',
                  desc: 'Video tutorial daftar dan tips lengkap dari mentor berpengalaman',
                },
                {
                  icon: <FaFileAlt size={24} className="mt-1 text-yellow-600" />,
                  title: 'E-book dan Contoh berkas asli',
                  desc: 'Akses ke panduan dan berkas awardee',
                },
                {
                  icon: <FaCalendarAlt size={24} className="mt-1 text-red-600" />,
                  title: 'Konsultasi Langsung bersama mentor via komunitas',
                  desc: 'Diskusi Real-Time Bareng Mentor, Biar Persiapan beasiswamu naik level.',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-3">
                  {item.icon}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 sm:text-base md:text-lg">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleTrialClick}
              className="w-full text-white font-semibold py-2.5 sm:py-3 md:py-4 px-5 sm:px-6 rounded-lg transition-all duration-200 hover:-translate-y-0.5 shadow-lg text-sm sm:text-base md:text-lg"
              style={{
                background: 'linear-gradient(135deg, #1B7691 0%, #FB991A 100%)',
                boxShadow: '0 4px 15px rgba(27, 118, 145, 0.2)',
              }}
            >
              Ambil Kesempatan Sekarang
            </button>

            <p className="mt-3 text-[10px] sm:text-xs md:text-sm text-center text-gray-500">
              Tidak ada biaya tersembunyi • Batalkan kapan saja
            </p>
          </div>
        </div>
      </div>
      )}
       {showExpiredPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-[popupSlideIn_0.3s_ease-out_forwards]">
            <button
              onClick={handleCloseAll}
              className="absolute p-2 transition rounded-full top-3 right-3 bg-white/80 hover:scale-110"
            >
              <X className="text-gray-700" size={20} />
            </button>

            <Image
              src="/images/landing/haira-hero-mobile.png"
              alt="icon"
              width={64}
              height={64}
              className="mx-auto mb-4 rounded-full bg-gradient-to-r from-[#1B7691] to-[#FB991A] p-2"
            />

            <h2 className="text-xl font-bold text-gray-800">
              Cie ada yang nyaman pake fitur premium nih 😅
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Yuk mending langsung upgrade ke{" "}
              <span className="font-semibold text-[#1B7691]">Membership</span> biar
              persiapan beasiswamu makin maksimal.
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleGoPremium}
                className="w-full py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-[#1B7691] to-[#FB991A] hover:scale-[1.02] transition"
              >
                Gas Upgrade
              </button>

              <button
                onClick={handleCloseAll}
                className="text-sm text-gray-500 underline hover:text-gray-700"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}
       {showPricingPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 animate-[popupSlideIn_0.3s_ease-out_forwards]">
            <button
              onClick={handleCloseAll}
              className="absolute p-2 transition rounded-full top-3 right-3 bg-white/80 hover:scale-110"
            >
              <X className="text-gray-700" size={20} />
            </button>

            <h2 className="text-2xl font-bold text-center text-[#1B7691] mb-2">
              Pilih Paket Premium ✨
            </h2>
            <p className="mb-6 text-sm text-center text-gray-600">
              Akses semua fitur eksklusif & bimbingan mentor berpengalaman.
            </p>

            {/* Paket Pricing */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                {
                  name: "Basic",
                  price: "Rp29.000",
                  features: ["Akses video tutorial", "E-book gratis", "Forum komunitas"],
                },
                {
                  name: "Pro",
                  price: "Rp79.000",
                  features: [
                    "Semua Basic",
                    "Kelas mentor eksklusif",
                    "Simulasi berkas beasiswa",
                  ],
                  highlight: true,
                },
                {
                  name: "Ultimate",
                  price: "Rp149.000",
                  features: [
                    "Semua Pro",
                    "1-on-1 konsultasi mentor",
                    "Prioritas event & beasiswa",
                  ],
                },
              ].map((pkg, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-5 shadow-lg border ${
                    pkg.highlight
                      ? "border-[#FB991A] scale-[1.02] bg-gradient-to-br from-[#FFF9F2] to-[#FFFDF9]"
                      : "border-gray-200"
                  } transition`}
                >
                  <h3 className="text-lg font-semibold text-gray-800">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-[#1B7691] mt-2">{pkg.price}</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600">
                    {pkg.features.map((f, idx) => (
                      <li key={idx}>• {f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => alert(`Langganan paket ${pkg.name}`)}
                    className={`mt-5 w-full py-2.5 rounded-lg font-semibold text-white ${
                      pkg.highlight
                        ? "bg-gradient-to-r from-[#1B7691] to-[#FB991A]"
                        : "bg-[#1B7691] hover:opacity-90"
                    }`}
                  >
                    Langganan
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-center text-gray-500">
              Semua harga sudah termasuk PPN • Batalkan kapan saja
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PromoPopup;
