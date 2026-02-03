// @SEE https://www.npmjs.com/package/next-seo#default-seo-configuration

import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://www.raihasa.id/',
    siteName: 'Raih Asa',
    title: 'Raih Asa | Platform Mentoring Beasiswa & Study Abroad',
    description: 'Platform mentoring beasiswa terbaik untuk persiapan kuliah ke luar negeri & dalam negeri. Dapatkan bimbingan essay, simulasi interview, dan strategi lolos beasiswa bersama mentor profesional.',
    images: [
      {
        url: 'https://www.raihasa.id/assets/og-image.jpg', // Ensure this exists or use a generic one
        width: 1200,
        height: 630,
        alt: 'Raih Asa - Mentoring Beasiswa',
      },
    ],
  },
  titleTemplate: '%s | Mentoring Beasiswa - Raih Asa',
  defaultTitle: 'Raih Asa | Platform Mentoring Beasiswa Terbaik',
  description: 'Platform mentoring beasiswa terbaik untuk persiapan kuliah ke luar negeri & dalam negeri. Dapatkan bimbingan essay, simulasi interview, dan strategi lolos beasiswa bersama mentor profesional.',
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
  ],
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'mentoring beasiswa, bimbingan beasiswa, konsultan pendidikan, kuliah luar negeri, beasiswa lpdp, beasiswa aas, beasiswa chevening, raih asa, bimbingan essay beasiswa, beasiswa dalam negeri',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
  ],
  twitter: {
    handle: '@raihasa_id',
    site: '@raihasa_id',
    cardType: 'summary_large_image',
  },
};

export default config;
