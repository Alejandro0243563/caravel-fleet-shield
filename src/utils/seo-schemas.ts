// JSON-LD Schemas for SEO

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CARAVEL",
  "url": "https://caravel.com",
  "logo": "/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png",
  "description": "Protección integral contra multas vehiculares en México",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Guadalajara",
    "addressRegion": "Jalisco",
    "addressCountry": "México"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+52-331-849-7494",
    "contactType": "customer service",
    "availableLanguage": "Spanish"
  },
  "sameAs": []
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "CARAVEL",
  "url": "https://caravel.com",
  "description": "Protege tu flotilla contra multas vehiculares en México desde $200/mes",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://caravel.com/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Protección contra Multas Vehiculares",
  "description": "Servicio integral de protección contra multas de tránsito para flotillas en México",
  "provider": {
    "@type": "Organization",
    "name": "CARAVEL"
  },
  "areaServed": {
    "@type": "Country",
    "name": "México"
  },
  "offers": {
    "@type": "Offer",
    "price": "200",
    "priceCurrency": "MXN",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "200",
      "priceCurrency": "MXN",
      "unitText": "por vehículo por mes"
    }
  }
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cómo funciona CARAVEL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CARAVEL protege tu flotilla contra multas vehiculares mediante un servicio legal y transparente por $200 MXN por vehículo por mes."
      }
    },
    {
      "@type": "Question", 
      "name": "¿En qué estados de México opera CARAVEL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CARAVEL opera en todo México, brindando protección integral contra multas vehiculares a nivel nacional."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta el servicio de CARAVEL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El servicio de CARAVEL cuesta $200 MXN por vehículo por mes, con descuentos por pago anual."
      }
    }
  ]
};

export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Plan de Protección CARAVEL",
  "description": "Protección integral contra multas vehiculares desde $200 MXN por vehículo por mes",
  "brand": {
    "@type": "Brand",
    "name": "CARAVEL"
  },
  "offers": {
    "@type": "Offer",
    "price": "200",
    "priceCurrency": "MXN",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2025-12-31"
  }
};