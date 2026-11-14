// What each project's larger view says about it (data/work.ts), kept apart
// from the media so the build can read it too: vite.config.ts writes it into
// the Work page's structured data for search engines (data/schema.ts), and
// it can't import video files.
//
// Plain data only.

export interface WorkAbout {
  /** what kind of work, above the name, e.g. "Websites" */
  kind: string;
  /** a sentence or two on the business and the site */
  summary: string;
  /** when it was built, e.g. "Nov 2026" */
  when?: string;
  /** the same, for search engines: "2026-11" */
  date?: string;
  /** the facts, as label and values, each value on its own line */
  facts: { label: string; values: string[] }[];
}

export const workAbout = {
  'Prime Stock Central': {
    kind: 'Websites',
    summary: 'Prime Stock Central installs, stocks and looks after smart, cashless vending machines for workplaces in and around Bath.',
    when: 'Nov 2026',
    date: '2026-11',
    facts: [
      { label: 'Category', values: ['Vending'] },
      { label: 'Style', values: ['Bold colour', 'Dark', '3D', 'Scroll animation'] },
      { label: 'Type', values: ['Local business'] },
      { label: 'Framework', values: ['Next.js', 'React'] },
      { label: 'Library', values: ['three.js'] },
    ],
  },
  'Ossa Pilates': {
    kind: 'Websites',
    summary: 'Ossa is a boutique Pilates and yoga studio: six reformers, small classes, and seven ways to move.',
    when: 'Oct 2026',
    date: '2026-10',
    facts: [
      { label: 'Category', values: ['Fitness'] },
      { label: 'Style', values: ['Editorial', 'Large type', 'Warm', 'Image sequence'] },
      { label: 'Type', values: ['Boutique studio'] },
      { label: 'Framework', values: ['Next.js', 'React'] },
      { label: 'Library', values: ['Paper Shaders'] },
    ],
  },
  'Kape Coffee': {
    kind: 'Websites',
    summary: 'Kape is a Filipino coffee shop pouring bold barako and ube lattes, with merienda in the afternoons and a welcome like home.',
    when: 'Oct 2026',
    date: '2026-10',
    facts: [
      { label: 'Category', values: ['Café'] },
      { label: 'Style', values: ['Playful', 'Illustrated', 'Textured', 'Scroll story'] },
      { label: 'Type', values: ['Coffee shop'] },
      { label: 'Framework', values: ['Next.js', 'React'] },
    ],
  },
} satisfies Record<string, WorkAbout>;

export type WorkTitle = keyof typeof workAbout;

/** each project's still, by its file name in src/assets, for the Work
 *  page's structured data and the sitemap's images: the reel's first frame,
 *  or for Prime Stock (whose reel opens on its hero fading in) a settled one */
export const workStills: Record<WorkTitle, string> = {
  'Prime Stock Central': 'primestock-desktop.webp',
  'Ossa Pilates': 'OssaAnimate.webp',
  'Kape Coffee': 'KappeAnimate.webp',
};

/** Each project's own page: the larger view, at an address of its own
 *  (/work/<slug>), so it can be linked to, shared and found on Google. The
 *  title and description are what search results and link previews show;
 *  the image is its preview, in public/og. */
export const workPages: Record<WorkTitle, { slug: string; title: string; description: string; image: string }> = {
  'Prime Stock Central': {
    slug: 'prime-stock-central',
    title: 'Prime Stock Central Website | Web Design in Bath | gios.build',
    description:
      'Prime Stock Central: a website for a Bath vending company, by gios.build. Bold colour, a 3D machine brought to life as you scroll, and a quote form.',
    image: '/og/work-prime-stock-central.jpg',
  },
  'Ossa Pilates': {
    slug: 'ossa-pilates',
    title: 'Ossa Pilates Website | Studio Web Design | gios.build',
    description:
      'Ossa Pilates: a boutique Pilates and yoga studio website by gios.build. Editorial, warm and calm, with a Book button on every screen.',
    image: '/og/work-ossa-pilates.jpg',
  },
  'Kape Coffee': {
    slug: 'kape-coffee',
    title: 'Kape Coffee Website | Café Web Design | gios.build',
    description:
      'Kape Coffee: a Filipino coffee shop website by gios.build. Playful and illustrated, with the menu written out and a story told as you scroll.',
    image: '/og/work-kape-coffee.jpg',
  },
};

/** a project's page address, e.g. "/work/kape-coffee" */
export const workPath = (title: string) => {
  const page = workPages[title as WorkTitle];
  return page ? `/work/${page.slug}` : '/work';
};

/** the project at a page address's slug */
export const workBySlug = (slug: string) =>
  (Object.keys(workPages) as WorkTitle[]).find((title) => workPages[title].slug === slug);
