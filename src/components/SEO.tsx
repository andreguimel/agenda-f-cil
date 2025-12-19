import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const defaultTitle = 'Agendaberta - Sistema de Agendamento Online para Clínicas';
const defaultDescription = 'Simplifique o agendamento da sua clínica com o Agendaberta. Sistema completo de agendamento online, gestão de pacientes e integração com Google Calendar.';
const defaultKeywords = 'agendamento online, sistema de agendamento, clínica, consultório, agenda médica, gestão de pacientes';
const siteUrl = 'https://agendaberta.com.br';

export function SEO({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  canonical,
  ogImage = '/og-image.png',
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | Agendaberta` : defaultTitle;
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonical} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullOgImage} />
      
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
    </Helmet>
  );
}
