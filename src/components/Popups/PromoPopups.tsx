
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes popupFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popupSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {showPopup && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-poppins"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            animation: 'popupFadeIn 0.3s ease-out forwards',
          }}
        >
          <div
            className="relative w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden"
            style={{
              opacity: 0,
              transform: 'translateY(20px) scale(0.98)',
              animation: 'popupSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
            }}
          >
            <button
              onClick={handleCloseAll}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100/50 hover:bg-gray-100 rounded-full transition-all duration-200 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left Side: Visual/Brand */}
              <div className="relative w-full md:w-2/5 md:min-h-[520px] bg-[#1B7691] p-8 text-white flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern-dots.svg')] opacity-10"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FB991A] rounded-full blur-3xl opacity-30"></div>
                <div className="absolute top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-20"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-6 border border-white/20">
                    <Image
                      src="/images/landing/haira-hero-mobile.png"
                      alt="icon"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold leading-tight mb-2">
                    Unlock Your Potential
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Akses fitur premium untuk persiapan beasiswa yang lebih matang.
                  </p>
                </div>

                <div className="relative z-10 mt-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border border-[#1B7691]"></div>
                        ))}
                      </div>
                      <span className="text-xs font-medium">+1,200 joined</span>
                    </div>
                    <p className="text-xs italic text-white/90">"Platform ini sangat membantu saya lolos beasiswa LPDP!"</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center bg-white">
                <div className="mb-6 text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-[#FB991A]/10 text-[#FB991A] text-xs font-bold rounded-full mb-3 tracking-wide uppercase">
                    Limited Offer
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Mulai Trial Gratis
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Nikmati akses penuh ke semua fitur premium selama masa percobaan.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: FaGraduationCap, label: 'Scholarship Matching AI', color: 'text-blue-500' },
                    { icon: FaChalkboardTeacher, label: 'Video Materi Lengkap', color: 'text-green-500' },
                    { icon: FaFileAlt, label: 'Bank Dokumen & E-book', color: 'text-yellow-500' },
                    { icon: FaCalendarAlt, label: 'Kalender & Reminder', color: 'text-red-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors ${item.color}`}>
                        <item.icon size={18} />
                      </div>
                      <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900 transition-colors">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleTrialClick}
                  disabled={loading}
                  className="w-full bg-[#1B7691] hover:bg-[#166076] text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#1B7691]/20 transform hover:-translate-y-1 block text-center"
                >
                  {loading ? 'Memproses...' : 'Klaim Free Trial Sekarang'}
                </button>
                {/* <p className="text-center text-xs text-gray-400 mt-4">
                  Batalkan kapan saja • Tidak perlu kartu kredit
                </p> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {showExpiredPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-poppins"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)' }}>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-[popupSlideIn_0.3s_ease-out_forwards]">
            <button
              onClick={handleCloseAll}
              className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#1B7691]/10 to-[#FB991A]/10 rounded-full flex items-center justify-center mb-6">
              <Image
                src="/images/landing/haira-hero-mobile.png"
                alt="icon"
                width={48}
                height={48}
                className="w-12 h-12 object-contain drop-shadow-sm"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Masa Trial Habis �
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Wah, sepertinya kamu menikmati fitur premium kami. Lanjutkan aksesmu dengan berlangganan membership.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleGoPremium}
                className="w-full py-3.5 px-6 font-semibold text-white rounded-xl bg-gradient-to-r from-[#1B7691] to-[#155b70] shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all hover:-translate-y-0.5"
              >
                Upgrade ke Premium
              </button>

              <button
                onClick={handleCloseAll}
                className="w-full py-3.5 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}

      {showPricingPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-poppins"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-10 animate-[popupSlideIn_0.3s_ease-out_forwards]">
            <button
              onClick={handleCloseAll}
              className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Investasi Terbaik untuk Masa Depanmu 🚀
              </h2>
              <p className="text-gray-500">
                Pilih paket yang sesuai dengan kebutuhan belajarmu. Upgrade sekarang untuk akses tak terbatas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Starter",
                  price: "Rp29rb",
                  period: "/bulan",
                  desc: "Cukup untuk mulai belajar dasar.",
                  features: ["Akses Video Dasar", "E-book Gratis", "Forum Diskusi"],
                  cta: "Pilih Starter",
                  popular: false
                },
                {
                  name: "Pro Learner",
                  price: "Rp79rb",
                  period: "/bulan",
                  desc: "Paling direkomendasikan untukmu.",
                  features: [
                    "Semua Fitur Starter",
                    "Akses Semua Video Premium",
                    "Simulasi Wawancara AI",
                    "Review CV by Expert"
                  ],
                  cta: "Pilih Pro",
                  popular: true
                },
                {
                  name: "Ultimate",
                  price: "Rp149rb",
                  period: "/bulan",
                  desc: "Paket lengkap jaminan mutu.",
                  features: [
                    "Semua Fitur Pro",
                    "1-on-1 Mentoring (2x/bln)",
                    "Garansi Uang Kembali",
                    "Prioritas Support"
                  ],
                  cta: "Pilih Ultimate",
                  popular: false
                },
              ].map((pkg, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${pkg.popular
                    ? "border-[#FB991A] bg-[#FFFBF5] shadow-xl scale-100 md:scale-105 z-10"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg"
                    }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FB991A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className={`text-lg font-bold ${pkg.popular ? "text-[#FB991A]" : "text-gray-900"}`}>{pkg.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{pkg.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                    <span className="text-gray-400 text-sm font-medium">{pkg.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((f, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-gray-600">
                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${pkg.popular ? 'bg-[#FB991A]/20 text-[#FB991A]' : 'bg-gray-100 text-gray-500'}`}>
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => alert(`Langganan paket ${pkg.name}`)}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all ${pkg.popular
                      ? "bg-[#FB991A] text-white hover:bg-[#e08916] shadow-lg shadow-orange-500/20"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                  >
                    {pkg.cta}
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-gray-400">
              Butuh bantuan memilih paket? <a href="#" className="text-[#1B7691] font-medium hover:underline">Chat Tim Kami</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PromoPopup;
