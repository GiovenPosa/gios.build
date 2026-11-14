// Each page's structured data (JSON-LD): the facts search engines read to
// understand who gios.build is, where it works, what it sells and what's on
// the page. vite.config.ts writes it into each page's HTML at build time;
// the app doesn't touch it, since every page is loaded fresh by a crawler.
//
// Everything here has to match what the page shows: Google ignores, or
// penalises, structured data that says more than the page does.
//
// Plain data only: vite.config.ts imports this file.

import { PAGES, SITE_NAME, SITE_URL, type PagePath } from './seo';
import { faqData } from './faq';
import { packagesData } from './packages';
import { servicesData } from './services';
import { workAbout, workBySlug, workPages, workStills, type WorkTitle } from './workAbout';
import { areaByPath, type Area } from './areas';
import { industryByPath, type Industry } from './industries';

/** a built asset's full address from its source file name (e.g.
 *  "gio-portrait.webp"), once Vite has given it its hashed name */
export type AssetUrl = (file: string) => string;

const BUSINESS = `${SITE_URL}/#business`;
const PERSON = `${SITE_URL}/#gio`;
const WEBSITE = `${SITE_URL}/#website`;

// Where the business works. Each place links to its Wikipedia page, so a
// search engine knows it's Bath in Somerset, not Bath in Maine.
const wiki = (page: string) => `https://en.wikipedia.org/wiki/${page}`;
export const AREAS = [
  { '@type': 'City', name: 'Bath', sameAs: wiki('Bath,_Somerset') },
  { '@type': 'City', name: 'Bristol', sameAs: wiki('Bristol') },
  { '@type': 'City', name: 'Trowbridge', sameAs: wiki('Trowbridge') },
  { '@type': 'AdministrativeArea', name: 'Bath and North East Somerset', sameAs: wiki('Bath_and_North_East_Somerset') },
  { '@type': 'AdministrativeArea', name: 'Somerset', sameAs: wiki('Somerset') },
  { '@type': 'AdministrativeArea', name: 'Wiltshire', sameAs: wiki('Wiltshire') },
  { '@type': 'Country', name: 'United Kingdom', sameAs: wiki('United_Kingdom') },
];

const SOCIALS = ['https://www.instagram.com/gios.build', 'https://www.linkedin.com/in/gio-posa-200541240'];

// What each service is, in a sentence, for its structured data (the cards on
// the page show only the titles; data/services.ts has their points)
const SERVICE_TYPES: Record<string, { type: string; description: string }> = {
  'New Websites': {
    type: 'Web design',
    description: 'New websites for small businesses, designed around your customers, mobile-friendly and live in about 4 weeks.',
  },
  Redesigns: {
    type: 'Website redesign',
    description: "A modern redesign of a dated website: faster pages and clearer messaging, keeping your domain and your Google rankings.",
  },
  'Leads & Bookings': {
    type: 'Lead generation',
    description: 'Enquiry and quote forms, booking and calendar integrations, instant notifications and simple lead tracking.',
  },
  'Getting Found': {
    type: 'Search engine optimisation',
    description: 'SEO foundations on every site, Google Search Console setup, and local SEO with your Google Business Profile.',
  },
  'Hosting & Care': {
    type: 'Website hosting and maintenance',
    description: 'Hosting and domain setup, monthly maintenance, security, backups and small content updates.',
  },
};

const price = (from: number, to?: number) => ({
  '@type': 'PriceSpecification',
  priceCurrency: 'GBP',
  minPrice: from,
  ...(to ? { maxPrice: to } : {}),
});

/** the business, Gio and the site: the same on every page */
function site(asset: AssetUrl) {
  return [
    {
      '@type': 'ProfessionalService',
      '@id': BUSINESS,
      name: SITE_NAME,
      alternateName: "Gio's Build",
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-512.png`, width: 512, height: 512 },
      image: `${SITE_URL}/og/home.png`,
      email: 'contact@gios.build',
      slogan: "Most websites blend in. Yours won't.",
      description:
        'Website design and development for small businesses in Bath, Bristol, Somerset, Wiltshire and across the UK: new websites, redesigns, enquiry and booking forms, SEO and local SEO, hosting and care. Every project starts with a free homepage mockup.',
      priceRange: '£600–£1,800+',
      currenciesAccepted: 'GBP',
      // a service-area business: no premises to visit, so just the town
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bath',
        addressRegion: 'Somerset',
        addressCountry: 'GB',
      },
      areaServed: AREAS,
      founder: { '@id': PERSON },
      sameAs: SOCIALS,
      knowsAbout: [
        'Web design',
        'Website redesign',
        'Web development',
        'Small business websites',
        'Search engine optimisation',
        'Local SEO',
        'Google Business Profile',
        'React',
        'Next.js',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Website services',
        itemListElement: servicesData.map((service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.title,
            serviceType: SERVICE_TYPES[service.title]?.type,
            description: SERVICE_TYPES[service.title]?.description,
            provider: { '@id': BUSINESS },
            areaServed: AREAS,
          },
        })),
      },
      makesOffer: packagesData.map((pkg) => ({
        '@type': 'Offer',
        name: `${pkg.name} website`,
        description: `${pkg.for} ${pkg.items.join(', ')}. ${pkg.timeline}.`,
        url: `${SITE_URL}/packages`,
        priceSpecification: price(pkg.from, pkg.to),
        areaServed: AREAS,
      })),
    },
    {
      '@type': 'Person',
      '@id': PERSON,
      name: 'Gio Posa',
      jobTitle: 'Web Designer & Software Engineer',
      image: asset('gio-portrait.webp'),
      url: `${SITE_URL}/#story`,
      worksFor: { '@id': BUSINESS },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Bristol', sameAs: wiki('University_of_Bristol') },
      homeLocation: { '@type': 'City', name: 'Bath', sameAs: wiki('Bath,_Somerset') },
      knowsAbout: ['Web design', 'Web development', 'UI design', 'Software engineering', 'Search engine optimisation'],
      sameAs: ['https://github.com/GiovenPosa', 'https://www.linkedin.com/in/gio-posa-200541240', 'https://www.instagram.com/gios.build'],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE,
      name: SITE_NAME,
      alternateName: "Gio's Build",
      url: `${SITE_URL}/`,
      inLanguage: 'en-GB',
      publisher: { '@id': BUSINESS },
    },
  ];
}

/** the page itself, and its place in the site */
function webPage(path: PagePath, type: string, extra: Record<string, unknown> = {}) {
  const page = PAGES[path];
  const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const nodes: Record<string, unknown>[] = [
    {
      '@type': type,
      '@id': `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: 'en-GB',
      isPartOf: { '@id': WEBSITE },
      about: { '@id': BUSINESS },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}${page.image}`, width: 2400, height: 1260 },
      ...(path === '/' ? {} : { breadcrumb: { '@id': `${url}#breadcrumb` } }),
      ...extra,
    },
  ];
  if (path !== '/') {
    nodes.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      // a project's page sits under the Work page
      itemListElement: [
        { name: PAGES['/'].crumb, item: `${SITE_URL}/` },
        ...(path.startsWith('/work/') ? [{ name: PAGES['/work'].crumb, item: `${SITE_URL}/work` }] : []),
        { name: page.crumb, item: url },
      ].map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })),
    });
  }
  return nodes;
}

/** a page's questions, with their answers: the home page's by default */
function faqPage(items = faqData, url = `${SITE_URL}/`) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** the projects on the Work page */
function workList(asset: AssetUrl) {
  const titles = Object.keys(workAbout) as WorkTitle[];
  return {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/work#projects`,
    name: 'Recent websites',
    numberOfItems: titles.length,
    itemListElement: titles.map((title, index) => {
      const about = workAbout[title];
      const facts = Object.fromEntries(about.facts.map((fact) => [fact.label, fact.values]));
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          '@id': `${SITE_URL}/work/${workPages[title].slug}#project`,
          url: `${SITE_URL}/work/${workPages[title].slug}`,
          name: `${title} website`,
          description: about.summary,
          image: asset(workStills[title]),
          dateCreated: about.date,
          genre: facts.Category?.[0],
          keywords: [...(facts.Style ?? []), ...(facts.Framework ?? [])].join(', '),
          creator: { '@id': PERSON },
          publisher: { '@id': BUSINESS },
        },
      };
    }),
  };
}

/** one project, on its own page */
function project(title: WorkTitle, asset: AssetUrl) {
  const about = workAbout[title];
  const url = `${SITE_URL}/work/${workPages[title].slug}`;
  const facts = Object.fromEntries(about.facts.map((fact) => [fact.label, fact.values]));
  return {
    '@type': 'CreativeWork',
    '@id': `${url}#project`,
    name: `${title} website`,
    description: about.summary,
    url,
    image: [asset(workStills[title]), `${SITE_URL}${workPages[title].image}`],
    dateCreated: about.date,
    genre: facts.Category?.[0],
    keywords: [...(facts.Style ?? []), ...(facts.Framework ?? []), ...(facts.Library ?? [])].join(', '),
    creator: { '@id': PERSON },
    publisher: { '@id': BUSINESS },
    isPartOf: { '@id': `${SITE_URL}/work#projects` },
  };
}

/** the packages and their prices */
function packageCatalog() {
  return {
    '@type': 'OfferCatalog',
    '@id': `${SITE_URL}/packages#packages`,
    name: 'Website packages',
    itemListElement: packagesData.map((pkg) => ({
      '@type': 'Offer',
      name: `${pkg.name} website`,
      description: `${pkg.for} ${pkg.items.join(', ')}. ${pkg.timeline}.`,
      priceSpecification: price(pkg.from, pkg.to),
      seller: { '@id': BUSINESS },
      areaServed: AREAS,
      itemOffered: { '@type': 'Service', name: `${pkg.name} website`, serviceType: 'Web design', provider: { '@id': BUSINESS } },
    })),
  };
}

/** an area page's service: web design in the town and the places around it */
function areaService(area: Area) {
  const url = `${SITE_URL}${area.path}`;
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: `Web design in ${area.town}`,
    serviceType: 'Web design',
    description: `Websites for small businesses in ${area.town} and the places around it, built to be found on Google, with a free homepage mockup first.`,
    url,
    provider: { '@id': BUSINESS },
    areaServed: [
      { '@type': 'City', name: area.town, sameAs: wiki(area.wiki) },
      ...area.nearby.map((name) => ({ '@type': 'City', name })),
      { '@type': 'AdministrativeArea', name: area.county, sameAs: wiki(area.county.replace(/ /g, '_')) },
    ],
    offers: packagesData.map((pkg) => ({
      '@type': 'Offer',
      name: `${pkg.name} website`,
      priceSpecification: price(pkg.from, pkg.to),
    })),
  };
}

/** an industry page's service: web design for that kind of business,
 *  anywhere in the UK */
function industryService(industry: Industry) {
  const url = `${SITE_URL}${industry.path}`;
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: `Websites for ${industry.name}`,
    serviceType: 'Web design',
    description: `${industry.hero.sub} Websites for ${industry.name} across the UK.`,
    url,
    provider: { '@id': BUSINESS },
    audience: { '@type': 'BusinessAudience', audienceType: industry.audience },
    areaServed: AREAS,
    offers: packagesData.map((pkg) => ({
      '@type': 'Offer',
      name: `${pkg.name} website`,
      priceSpecification: price(pkg.from, pkg.to),
    })),
  };
}

/** everything for one page, as a single JSON-LD graph */
export function pageSchema(path: PagePath, asset: AssetUrl) {
  const graph: Record<string, unknown>[] = [...site(asset)];
  switch (path) {
    case '/':
      graph.push(...webPage('/', 'WebPage'), faqPage());
      break;
    case '/work':
      graph.push(...webPage('/work', 'CollectionPage', { mainEntity: { '@id': `${SITE_URL}/work#projects` } }), workList(asset));
      break;
    case '/packages':
      graph.push(...webPage('/packages', 'WebPage', { mainEntity: { '@id': `${SITE_URL}/packages#packages` } }), packageCatalog());
      break;
    default: {
      const area = areaByPath(path);
      const industry = industryByPath(path);
      const work = path.startsWith('/work/') ? workBySlug(path.slice('/work/'.length)) : undefined;
      if (work) {
        graph.push(...webPage(path, 'ItemPage', { mainEntity: { '@id': `${SITE_URL}${path}#project` } }), project(work, asset));
      } else if (industry) {
        const url = `${SITE_URL}${industry.path}`;
        graph.push(...webPage(path, 'WebPage', { mainEntity: { '@id': `${url}#service` } }), industryService(industry), faqPage(industry.faq, url));
      } else if (area) {
        const url = `${SITE_URL}${area.path}`;
        graph.push(...webPage(path, 'WebPage', { mainEntity: { '@id': `${url}#service` } }), areaService(area), faqPage(area.faq, url));
      } else graph.push(...webPage(path, 'WebPage'));
    }
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
