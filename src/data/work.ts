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
import { workAbout, type WorkAbout } from './workAbout';

export type { WorkAbout };

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
  /** What the larger view's side panel says about it (data/workAbout.ts). */
  about?: WorkAbout;
}

// The one list of projects, for the home grid and the Work page.
export const workData: WorkItem[] = [
  {
    title: 'Prime Stock Central',
    meta: 'Website',
    about: workAbout['Prime Stock Central'],
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
    about: workAbout['Ossa Pilates'],
    icon: OssaIcon,
    ratio: '16 / 10',
    aspect: '16 / 10',
    media: { type: 'video', src: OssaCard, poster: OssaPoster },
    full: { type: 'video', src: OssaReel },
  },
  {
    title: 'Kape Coffee',
    meta: 'Website',
    about: workAbout['Kape Coffee'],
    icon: KappeIcon,
    ratio: '16 / 10',
    aspect: '16 / 10',
    media: { type: 'video', src: KappeCard, poster: KappePoster },
    full: { type: 'video', src: KappeReel },
  },
];
