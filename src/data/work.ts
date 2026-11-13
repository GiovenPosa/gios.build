// Each project has a full-size reel (the larger view), a card-size cut
// (lighter: 960 wide, 30fps and capped bitrate), an AV1 copy of the cut
// only where AV1 comes out
// meaningfully smaller, and the cut's first frame as a still, shown the
// instant the page loads.
// Reels are recorded from the live site with a scripted scroll.
//
// The earlier projects (Van-Spec, Orbital, Staffly, CheckedIn, Lead Tracker,
// the IBM travel app) were taken off in November 2026 to start the catalog
// again with website work; their files are still in assets/ if wanted.
import PrimeStockReel from '../assets/project-videos/PrimeStockReel.mp4';
import PrimeStockCard from '../assets/project-videos/cards/PrimeStockAnimate.mp4';
import PrimeStockPoster from '../assets/project-videos/cards/PrimeStockAnimate.webp';
import OssaReel from '../assets/project-videos/OssaReel.mp4';
import OssaCard from '../assets/project-videos/cards/OssaAnimate.mp4';
import OssaPoster from '../assets/project-videos/cards/OssaAnimate.webp';
import KappeReel from '../assets/project-videos/KappeReel.mp4';
import KappeCard from '../assets/project-videos/cards/KappeAnimate.mp4';
import KappePoster from '../assets/project-videos/cards/KappeAnimate.webp';
// Each project's favicon (its own app icon, as made for the site itself)
import PrimeStockIcon from '../assets/project-images/favicons/primestock.webp';
import OssaIcon from '../assets/project-images/favicons/ossa.webp';
import KappeIcon from '../assets/project-images/favicons/kape.webp';

export interface WorkMedia {
  type: 'video' | 'image';
  /** the MP4 (or the image) */
  src: string;
  /** a smaller AV1 WebM copy, tried first by browsers that can play it */
  webm?: string;
  /** the video's first frame, shown until the video can play */
  poster?: string;
  /** Where the crop centres when the card's shape differs from the media's. */
  focus?: string;
}

export interface WorkItem {
  title: string;
  meta: string;
  /** The card's shape; varied so the columns stagger. */
  ratio: string;
  /** What plays in the card. */
  media: WorkMedia;
  /** What the larger view plays, full size and uncropped, when it differs from the card. */
  full?: WorkMedia;
  /** The larger view's media shape, so it opens at its size straight away. */
  aspect: string;
  /** Dark media: the header switches to light text over it. */
  dark?: boolean;
  /** The project's favicon, shown as its app icon (a square image). */
  icon?: string;
  /** What the larger view's side panel says about it. */
  about?: WorkAbout;
}

export interface WorkAbout {
  /** what kind of work, above the name, e.g. "Websites" */
  kind: string;
  /** a sentence or two on the business and the site */
  summary: string;
  /** when it was built, e.g. "Nov 2026" */
  when?: string;
  /** the facts, as label and values, each value on its own line */
  facts: { label: string; values: string[] }[];
}

// The one list of projects, for the home grid and the Work page.
export const workData: WorkItem[] = [
  {
    title: 'Prime Stock Central',
    meta: 'Website',
    about: {
      kind: 'Websites',
      summary: 'Prime Stock Central installs, stocks and looks after smart, cashless vending machines for workplaces in and around Bath.',
      when: 'Nov 2026',
      facts: [
        { label: 'Category', values: ['Vending'] },
        { label: 'Style', values: ['Bold colour', 'Dark', '3D', 'Scroll animation'] },
        { label: 'Type', values: ['Local business'] },
        { label: 'Framework', values: ['Next.js', 'React'] },
        { label: 'Library', values: ['three.js'] },
      ],
    },
    icon: PrimeStockIcon,
    dark: true,
    ratio: '16 / 10',
    aspect: '16 / 10',
    media: { type: 'video', src: PrimeStockCard, poster: PrimeStockPoster },
    full: { type: 'video', src: PrimeStockReel },
  },
  {
    title: 'Ossa Pilates',
    meta: 'Website',
    about: {
      kind: 'Websites',
      summary: 'Ossa is a boutique Pilates and yoga studio: six reformers, small classes, and seven ways to move.',
      when: 'Oct 2026',
      facts: [
        { label: 'Category', values: ['Fitness'] },
        { label: 'Style', values: ['Editorial', 'Large type', 'Warm', 'Image sequence'] },
        { label: 'Type', values: ['Boutique studio'] },
        { label: 'Framework', values: ['Next.js', 'React'] },
        { label: 'Library', values: ['Paper Shaders'] },
      ],
    },
    icon: OssaIcon,
    ratio: '16 / 10',
    aspect: '16 / 10',
    media: { type: 'video', src: OssaCard, poster: OssaPoster },
    full: { type: 'video', src: OssaReel },
  },
  {
    title: 'Kape Coffee',
    meta: 'Website',
    about: {
      kind: 'Websites',
      summary: 'Kape is a Filipino coffee shop pouring bold barako and ube lattes, with merienda in the afternoons and a welcome like home.',
      when: 'Oct 2026',
      facts: [
        { label: 'Category', values: ['Café'] },
        { label: 'Style', values: ['Playful', 'Illustrated', 'Textured', 'Scroll story'] },
        { label: 'Type', values: ['Coffee shop'] },
        { label: 'Framework', values: ['Next.js', 'React'] },
      ],
    },
    icon: KappeIcon,
    ratio: '16 / 10',
    aspect: '16 / 10',
    media: { type: 'video', src: KappeCard, poster: KappePoster },
    full: { type: 'video', src: KappeReel },
  },
];
