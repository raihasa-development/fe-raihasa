import { useRouter } from 'next/router';
import { useEffect, useCallback } from 'react';

import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function useActivityTracker() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const trackAction = useCallback(
    async (action: string, metadata?: any) => {
      // Hanya kirim log jika user sudah login (karena DB memerlukan account_id)
      if (!user?.id) return;

      try {
        await api.post('/auth/activity-log', {
          page_url: router.asPath,
          action,
          metadata: metadata || {},
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    },
    [user?.id, router.asPath],
  );

  useEffect(() => {
    if (!user?.id) return;

    // Log awal saat halaman pertama dimuat
    trackAction('VIEW_PAGE');

    // Log otomatis setiap kali rute halaman berubah
    const handleRouteChange = () => {
      // Panggil endpoint secara manual dengan rute baru
      api.post('/auth/activity-log', {
        page_url: router.asPath,
        action: 'VIEW_PAGE',
        metadata: {},
      }).catch((err) => {
        console.error('Failed to log page view:', err);
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, user?.id, trackAction]);

  return { trackAction };
}
