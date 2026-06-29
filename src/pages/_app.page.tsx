import '@/styles/globals.css'    
import '@/styles/nprogress.css';
import "aos/dist/aos.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

import { HeroUIProvider } from '@heroui/react';
import {
  QueryClient,
  QueryClientProvider,
  QueryOptions,
} from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Router from 'next/router';
import { DefaultSeo } from 'next-seo';
import nProgress from 'nprogress';
import { useEffect } from 'react';

import { Analytics } from '@vercel/analytics/react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import MetaPixel from '@/components/MetaPixel';
import Toast from '@/components/Toast';
import WhatsappPromptModal from '@/components/Popups/WhatsappPromptModal';
import api from '@/lib/api';
import SEO from '@/seo.config';
import useActivityTracker from '@/hooks/useActivityTracker';

Router.events.on('routeChangeStart', nProgress.start);
Router.events.on('routeChangeError', nProgress.done);
Router.events.on('routeChangeComplete', nProgress.done);

const defaultQueryFn = async ({ queryKey }: QueryOptions) => {
  const { data } = await api.get(`${queryKey?.[0]}`);
  return data;
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  useActivityTracker();
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        e.preventDefault();
        target.blur();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <QueryClientProvider client={queryClient}>
        <GoogleAnalytics />
        <MetaPixel />
        <Analytics />
        <Toast />
        <WhatsappPromptModal />
        <DefaultSeo {...SEO} />
        <HeroUIProvider>
          <Component {...pageProps} />
        </HeroUIProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
