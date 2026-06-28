import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/layouts/Layout';
import api from '@/lib/api';
import { showToast, SUCCESS_TOAST, DANGER_TOAST } from '@/components/Toast';
import SuccessVerify from '@/pages/auth/email-verification/components/SuccesVerify';
import VerifyEmail from '@/pages/auth/email-verification/components/VerifyEmail';

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function EmailVerificationPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [emailFromToken, setEmailFromToken] = useState<string | undefined>(undefined);
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const queryParam = router.query;

  useEffect(() => {
    if (queryParam.token && typeof queryParam.token === 'string') {
      const decoded = decodeJwt(queryParam.token);
      if (decoded && decoded.user_email) {
        setEmailFromToken(decoded.user_email);
      }
    }
  }, [queryParam.token]);

  useQuery({
    queryKey: ['token', queryParam.token],
    queryFn: async () => {
      const res = await api.get(`/mailer/verify?token=${queryParam.token}`);
      if (res.data.code === 200) setIsVerified(true);
      return res.data;
    },
    enabled: !!queryParam.token,
  });

  const handleResend = async (email: string) => {
    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      showToast('Email verifikasi baru telah dikirimkan! 😊', SUCCESS_TOAST);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Gagal mengirim email verifikasi.';
      showToast(errMsg, DANGER_TOAST);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Layout withFooter withNavbar>
      {isVerified ? (
        <SuccessVerify />
      ) : (
        <VerifyEmail
          email={emailFromToken}
          onResend={handleResend}
          isResending={isResending}
        />
      )}
    </Layout>
  );
}
