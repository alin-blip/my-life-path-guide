import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://ceomindos.com';

interface SeoHeadProps {
  title: string;
  description: string;
  /** Route path override (e.g. "/warrior"). Defaults to current pathname. */
  path?: string;
  ogType?: 'website' | 'article' | 'book' | 'product';
  image?: string;
  /** RO/EN locale for hreflang. Defaults to 'ro'. */
  locale?: 'ro' | 'en';
  /** Optional English-equivalent path for hreflang="en". */
  enPath?: string;
  /** Optional Romanian-equivalent path for hreflang="ro". */
  roPath?: string;
  noindex?: boolean;
}

/**
 * Reusable head component that guarantees a self-referencing canonical
 * and og:url on every public route, plus hreflang pairs when available.
 */
export const SeoHead = ({
  title,
  description,
  path,
  ogType = 'website',
  image,
  locale = 'ro',
  enPath,
  roPath,
  noindex,
}: SeoHeadProps) => {
  const location = useLocation();
  const routePath = path ?? location.pathname ?? '/';
  const url = `${SITE_URL}${routePath}`;
  const ogImage = image ?? `${SITE_URL}/og-image.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={locale === 'en' ? 'en_US' : 'ro_RO'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {roPath && <link rel="alternate" hrefLang="ro" href={`${SITE_URL}${roPath}`} />}
      {enPath && <link rel="alternate" hrefLang="en" href={`${SITE_URL}${enPath}`} />}
      {(roPath || enPath) && (
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${roPath ?? routePath}`} />
      )}
    </Helmet>
  );
};

export default SeoHead;
