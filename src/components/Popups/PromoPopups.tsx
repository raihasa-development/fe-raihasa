import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Minimize2, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/useAuthStore';
import { User } from '@/types/entities/user';
import { getToken } from '@/lib/cookies';
import { FaWhatsapp } from 'react-icons/fa';
import api from '@/lib/api';

type PopupConfig = {
  POPUP_ENABLED?: string;
  POPUP_HEADLINE?: string;
  POPUP_SUBHEADLINE?: string;
  POPUP_BADGE_TEXT?: string;
  POPUP_PRIMARY_CTA?: string;
  POPUP_SECONDARY_CTA?: string;
  POPUP_WA_NUMBER?: string;
  POPUP_WA_MESSAGE?: string;
};

type PricingPlansResponse = {
  plans: any[];
  is_new_user: boolean;
  new_user_offer?: any;
  popup_config?: PopupConfig | null;
};

const POPUP_DEFAULTS: Required<PopupConfig> = {
  POPUP_ENABLED:       'true',
  POPUP_HEADLINE:      'Dapatkan Kode Diskon Eksklusif',
  POPUP_SUBHEADLINE:   'Hubungi tim kami via WhatsApp dan dapatkan kode promo khusus untuk membership Raih Asa.',
  POPUP_BADGE_TEXT:    'Penawaran Terbatas',
  POPUP_PRIMARY_CTA:   'Klaim Kode via WhatsApp',
  POPUP_SECONDARY_CTA: 'Lihat Paket Membership',
  POPUP_WA_NUMBER:     '6285117323893',
  POPUP_WA_MESSAGE:    'Halo mimin Raih Asa, saya ingin mendapatkan kode diskon membership.\n\n1. Nama lengkap: \n2. Email: \n3. Universitas: \n4. Program studi: ',
};

const useCountdown = (userId: string | undefined) => {
  const key = `promoCountdownStart:${userId || 'guest'}`;
  const [remaining, setRemaining] = useState(86400);

  useEffect(() => {
    const DURATION = 24 * 60 * 60;
    let startTs = Number(localStorage.getItem(key));
    if (!startTs) {
      startTs = Date.now();
      localStorage.setItem(key, String(startTs));
    }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTs) / 1000);
      setRemaining(Math.max(0, DURATION - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [key]);

  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    h: Math.floor(remaining / 3600),
    m: Math.floor((remaining % 3600) / 60),
    s: remaining % 60,
    pad,
  };
};

const DigitBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className="w-[62px] h-[62px] rounded-2xl flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}
    >
      <span className="text-[1.7rem] font-semibold text-white tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-[10px] text-white/35 uppercase tracking-widest">{label}</span>
  </div>
);

const PromoWidget: React.FC = () => {
  const [visible, setVisible]   = useState(false);
  const [expanded, setExpanded] = useState(false);   // false = minimized pill
  const router                   = useRouter();
  const user                     = useAuthStore.useUser() as User | null;
  const isAuthenticated          = useAuthStore.useIsAuthenticated();

  const { data: pricingData } = useQuery<PricingPlansResponse>({
    queryKey: ['pricing-plans-popup', user?.id || 'guest'],
    queryFn: async () => {
      const res = await api.get('/pricing/plans');
      return res.data?.data || { plans: [], is_new_user: false };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const cfg: Required<PopupConfig> = { ...POPUP_DEFAULTS, ...(pricingData?.popup_config || {}) };
  const popupEnabled = cfg.POPUP_ENABLED !== 'false';
  const { h, m, s, pad } = useCountdown(user?.id);

  useEffect(() => {
    if (!isAuthenticated || !popupEnabled || !pricingData) return;

    const check = async () => {
      try {
        const token = getToken();
        if (token) {
          const sub = await api.get('/pricing/subscription/status');
          if (sub.data?.data?.active) return;
        }
      } catch { /* show anyway */ }

      const minKey = `promoWidgetMinimized:${user?.id || 'guest'}`;
      const wasMinimized = localStorage.getItem(minKey) === 'true';
      setExpanded(!wasMinimized);
      setTimeout(() => setVisible(true), 1500);
    };

    check();
  }, [pricingData, popupEnabled, user?.id, isAuthenticated]);

  const minimize = () => {
    setExpanded(false);
    localStorage.setItem(`promoWidgetMinimized:${user?.id || 'guest'}`, 'true');
  };

  const maximize = () => {
    setExpanded(true);
    localStorage.setItem(`promoWidgetMinimized:${user?.id || 'guest'}`, 'false');
  };

  const openWA = () =>
    window.open(
      `https://wa.me/${cfg.POPUP_WA_NUMBER}?text=${encodeURIComponent(cfg.POPUP_WA_MESSAGE)}`,
      '_blank',
    );

  if (!isAuthenticated || !popupEnabled || !visible) return null;

  return (
    <>
      {/* ─────── MINIMIZED PILL — bottom left ─────── */}
      {!expanded && (
        <div
          className="fixed bottom-5 left-5 z-[9990] flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-2xl shadow-xl cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, #134f61 0%, #08303f 100%)',
            animation: 'slideUp 0.4s cubic-bezier(.22,.68,0,1.25) both',
          }}
          onClick={maximize}
          role="button"
          aria-label="Lihat penawaran"
        >
          {/* Icon */}
          <span className="text-base leading-none">🎁</span>

          {/* Text */}
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-medium text-white/60 tracking-wide">
              {cfg.POPUP_BADGE_TEXT}
            </span>
            <span className="text-[13px] font-semibold text-white tabular-nums font-mono tracking-tight">
              {pad(h)}:{pad(m)}:{pad(s)}
            </span>
          </div>

          {/* Expand icon */}
          <div
            className="ml-1 w-7 h-7 rounded-xl flex items-center justify-center transition-colors group-hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <Maximize2 size={13} className="text-white/50" />
          </div>
        </div>
      )}

      {/* ─────── MAXIMIZED MODAL — centered overlay ─────── */}
      {expanded && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(5,14,22,0.72)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="relative w-full max-w-[400px] rounded-[1.75rem] overflow-hidden shadow-2xl"
            style={{ animation: 'popupIn 0.38s cubic-bezier(.22,.68,0,1.3) both' }}
          >
            {/* Minimize button */}
            <button
              onClick={minimize}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
            >
              <Minimize2 size={15} />
            </button>

            {/* Dark top: badge + headline + countdown */}
            <div
              className="px-7 pt-9 pb-8 text-center"
              style={{ background: 'linear-gradient(160deg, #1a6e87 0%, #08303f 100%)' }}
            >
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
                style={{ background: 'rgba(251,153,26,0.14)', border: '1px solid rgba(251,153,26,0.30)' }}
              >
                <span className="text-[11px] font-medium tracking-widest uppercase text-[#FB991A]">
                  {cfg.POPUP_BADGE_TEXT}
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-white text-[1.45rem] font-semibold leading-snug tracking-tight mb-2">
                {cfg.POPUP_HEADLINE}
              </h2>

              <p className="text-white/35 text-[11px] uppercase tracking-[0.14em] font-medium mb-5">
                Penawaran berakhir dalam
              </p>

              {/* Countdown */}
              <div className="flex items-start justify-center gap-2.5">
                <DigitBox value={h} label="Jam" />
                <span className="text-white/20 text-2xl font-light pb-7 leading-none">:</span>
                <DigitBox value={m} label="Menit" />
                <span className="text-white/20 text-2xl font-light pb-7 leading-none">:</span>
                <DigitBox value={s} label="Detik" />
              </div>
            </div>

            {/* White bottom: description + CTAs */}
            <div className="bg-white px-7 py-6">
              <p className="text-gray-400 text-[13px] leading-relaxed text-center mb-5">
                {cfg.POPUP_SUBHEADLINE}
              </p>

              <button
                onClick={openWA}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-[14px] flex items-center justify-center gap-2 mb-2.5 transition-all hover:opacity-90 active:scale-[.98]"
                style={{ background: 'linear-gradient(135deg, #25D366 0%, #0f9b55 100%)' }}
              >
                <FaWhatsapp className="w-4 h-4" />
                {cfg.POPUP_PRIMARY_CTA}
              </button>

              <button
                onClick={() => { minimize(); router.push('/products'); }}
                className="w-full py-2.5 rounded-xl text-[12.5px] font-medium text-gray-400 hover:text-[#1B7691] hover:bg-gray-50 transition-all"
              >
                {cfg.POPUP_SECONDARY_CTA}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default PromoWidget;
