import * as React from 'react';
import { useState } from 'react';

import BaseDialog from '@/components/dialog/BaseDialog';
import Footer from '@/layouts/Footer';
import Navbar from '@/layouts/Navbar';
import useDialogStore from '@/store/useDialogStore';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';
import { showToast, SUCCESS_TOAST, DANGER_TOAST } from '@/components/Toast';

type LayoutOpt = {
  children: React.ReactNode;
  withNavbar?: boolean;
  withFooter?: boolean;
} & React.ComponentPropsWithRef<'div'>;

export default function Layout({
  children,
  withNavbar = false,
  withFooter = false,
}: LayoutOpt) {
  const open = useDialogStore.useOpen();
  const state = useDialogStore.useState();
  const handleClose = useDialogStore.useHandleClose();
  const handleSubmit = useDialogStore.useHandleSubmit();

  const user = useAuthStore((s) => s.user);
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      showToast('Email verifikasi telah dikirim ulang. Silakan cek inbox atau folder spam Anda.', SUCCESS_TOAST);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengirim ulang email verifikasi', DANGER_TOAST);
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      {/* Persistent Verification Warning Banner */}
      {user && user.role !== 'ADMIN' && !user.is_email_verified && (
        <div className="bg-gradient-to-r from-amber-500 to-[#FB991A] text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 relative z-50 shadow-sm animate-fade-in">
          <span>⚠️ Akun Anda belum diverifikasi. Silakan cek inbox email Anda ({user.email}) atau folder spam/promosi.</span>
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="underline bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed font-black"
          >
            {resending ? 'Mengirim...' : 'Kirim Ulang Verifikasi'}
          </button>
        </div>
      )}

      {withNavbar && <Navbar />}
      {children}
      <BaseDialog
        onClose={handleClose}
        onSubmit={handleSubmit}
        open={open}
        options={state}
      />
      {withFooter && <Footer />}
    </div>
  );
}
