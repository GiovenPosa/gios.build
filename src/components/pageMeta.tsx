import { Helmet } from 'react-helmet-async';
import { PAGES, SITE_URL, type PagePath, type PageSeo } from '../data/seo';

/** A page's title, description, canonical link and link-preview tags,
 *  from data/seo.ts (the build bakes the same ones into each page's HTML). */
export function PageMeta({ path }: { path: PagePath }) {
  const page: PageSeo = PAGES[path];
  const url = `${SITE_URL}${path}`;
  const shareTitle = page.shareTitle ?? page.title;
  const shareDescription = page.shareDescription ?? page.description;
  return (
    <Helmet>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      {page.keywords && <meta name="keywords" content={page.keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={shareTitle} />
      <meta property="og:description" content={shareDescription} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={shareTitle} />
      <meta name="twitter:description" content={shareDescription} />
    </Helmet>
  );
}
