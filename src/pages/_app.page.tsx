import '@/styles/globals.css'    
import '@/styles/nprogress.css';
import "aos/dist/aos.css";

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

import GoogleAnalytics from '@/components/GoogleAnalytics';
import MetaPixel from '@/components/MetaPixel';
import Toast from '@/components/Toast';
import api from '@/lib/api';
import SEO from '@/seo.config';

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
    <QueryClientProvider client={queryClient}>
      <GoogleAnalytics />
      <MetaPixel />
      <Toast />
      <DefaultSeo {...SEO} />
      <HeroUIProvider>
        <Component {...pageProps} />
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
