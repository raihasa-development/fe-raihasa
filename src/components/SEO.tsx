import { NextSeo, NextSeoProps } from 'next-seo';

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string[];
} & NextSeoProps;

export default function SEO({ title, description, keywords, ...rest }: SEOProps) {
  const additionalMetaTags = [...(rest.additionalMetaTags || [])];

  if (keywords && keywords.length > 0) {
    additionalMetaTags.push({
      name: 'keywords',
      content: keywords.join(', '),
    });
  }

  // Use a new object for rest props excluding additionalMetaTags to avoid conflicts
  const { additionalMetaTags: _, ...otherProps } = rest;

  return (
    <NextSeo
      title={title}
      description={description}
      additionalMetaTags={additionalMetaTags}
      {...otherProps}
    />
  );
}
