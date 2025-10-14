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
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const user = useAuthStore.useUser() as User | null;

  // Cek status popup pernah muncul di sessionStorage
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('promoPopupShown');
    if (alreadyShown) return; 
  }, []);

  // Fingerprint
  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
      console.log('Device ID:', result.visitorId);
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
      console.error('Gagal cek status trial', err);
      return false;
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const alreadyShown = sessionStorage.getItem('promoPopupShown');
    if (alreadyShown) return; 

    const showPopupWithBlur = () => {
      setShowPopup(true);
      document.body.style.overflow = 'hidden';
      const mainContent = document.querySelector('main');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = 'blur(2px) brightness(0.4)';
        (mainContent as HTMLElement).style.transition = 'filter 0.3s ease-in-out';
      }

      sessionStorage.setItem('promoPopupShown', 'true');
    };

    const runCheck = async () => {
      const token = getToken();
      if (!token) {
        timer = setTimeout(showPopupWithBlur, 1500);
        return;
      }

      if (user?.id && user.token) {
        const hasNoTrial = await checkTrialStatus(user.id, user.token);
        if (hasNoTrial) timer = setTimeout(showPopupWithBlur, 1500);
      }
    };

    runCheck();

    return () => {
      if (timer) clearTimeout(timer);
      document.body.style.overflow = 'unset';
      const mainContent = document.querySelector('main');
      if (mainContent) (mainContent as HTMLElement).style.filter = 'none';
    };
  }, [user, checkTrialStatus]);

  const handleClose = () => {
    setShowPopup(false);
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
      console.log('Product ID:', productId);

      const trialBody = {
        product_id: productId,
        device_id: deviceId,
      };

      const trialRes = await api.post('/lms/trial', trialBody, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const message = trialRes.data?.message || 'Trial berhasil dimulai!';
      showToast(message, SUCCESS_TOAST);

      handleClose();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error response:', err.response?.data);

      let message = 'Terjadi kesalahan, coba lagi.';

      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;

        if (status === 401) {
          message = 'Token tidak valid, silakan login ulang.';
        } else if (status === 409) {
          message = serverMessage || 'Trial sudah pernah dibuat untuk device ini.';
        } else if (status === 400) {
          message = serverMessage || 'Request tidak valid.';
        } else if (status >= 500) {
          showToast('Berhasil Trial', SUCCESS_TOAST);
        } else {
          message = serverMessage || message;
        }
      } else if (err.message) {
        message = err.message;
      }

      showToast(message, DANGER_TOAST);
    } finally {
      setLoading(false);
    }
  };

  if (!showPopup) return null;

  return (
    <>
      {/* animasi popup tetap sama */}
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

      {/* ... isi popup sama seperti sebelumnya */}
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
            onClick={handleClose}
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
    </>
  );
};

export default PromoPopup;
