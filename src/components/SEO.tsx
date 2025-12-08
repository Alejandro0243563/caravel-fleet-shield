import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string; // Added keywords prop
  ogImage?: string;
  ogType?: string;
  jsonLd?: object;
  noIndex?: boolean;
}

export const SEO = ({
  title,
  description,
  canonical,
  keywords,
  ogImage = '/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png',
  ogType = 'website',
  jsonLd,
  noIndex = false
}: SEOProps) => {
  const fullTitle = title.includes('CARAVEL') ? title : `${title} | CARAVEL`;
  const currentUrl = canonical || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="author" content="CARAVEL" />
      <meta name="language" content="es-MX" />

      {/* Canonical and hreflang */}
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" hrefLang="es-MX" href={currentUrl} />
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="CARAVEL - Protección contra multas vehiculares" />
      <meta property="og:locale" content="es_MX" />
      <meta property="og:site_name" content="CARAVEL" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="CARAVEL - Protección contra multas vehiculares" />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};