// Full-size reels, for the larger view
import VanSpecReel from '../assets/project-videos/VanSpecAnimate.mp4';
import OrbitalReel from '../assets/project-videos/OrbitalAnimate.mp4';
import StafflyReel from '../assets/project-videos/StafflyAnimate.mp4';
import CheckedInReel from '../assets/project-videos/CheckedInReel.mp4';
import IbmReel from '../assets/project-images/IbmAnimate.mp4';
// Card-size cuts: smaller, lighter, and cropped where the card always crops
import VanSpecCard from '../assets/project-videos/cards/VanSpecAnimate.mp4';
import OrbitalCard from '../assets/project-videos/cards/OrbitalAnimate.mp4';
import StafflyCard from '../assets/project-videos/cards/StafflyAnimate.mp4';
import CheckedInCard from '../assets/project-videos/cards/CheckedInAnimate.mp4';
import IbmCard from '../assets/project-videos/cards/IbmAnimate.mp4';
// Smaller AV1 copies of the card cuts, where AV1 came out meaningfully smaller
import VanSpecCardWebm from '../assets/project-videos/cards/VanSpecAnimate.webm';
import StafflyCardWebm from '../assets/project-videos/cards/StafflyAnimate.webm';
import CheckedInCardWebm from '../assets/project-videos/cards/CheckedInAnimate.webm';
// Each card cut's first frame as a still, shown the instant the page loads
import VanSpecPoster from '../assets/project-videos/cards/VanSpecAnimate.webp';
import OrbitalPoster from '../assets/project-videos/cards/OrbitalAnimate.webp';
import StafflyPoster from '../assets/project-videos/cards/StafflyAnimate.webp';
import CheckedInPoster from '../assets/project-videos/cards/CheckedInAnimate.webp';
import IbmPoster from '../assets/project-videos/cards/IbmAnimate.webp';
import LeadTracker from '../assets/project-images/lead-tracker.webp';

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
}

// The one list of projects, for the home grid and the Work page.
export const workData: WorkItem[] = [
  {
    title: 'Van-Spec',
    meta: 'Vanaways',
    dark: true,
    ratio: '3 / 2',
    aspect: '16 / 10',
    media: { type: 'video', src: VanSpecCard, webm: VanSpecCardWebm, poster: VanSpecPoster },
    full: { type: 'video', src: VanSpecReel },
  },
  {
    title: 'Orbital Intelligence',
    meta: 'Personal',
    dark: true,
    ratio: '4 / 5',
    aspect: '16 / 10',
    media: { type: 'video', src: OrbitalCard, poster: OrbitalPoster },
    full: { type: 'video', src: OrbitalReel },
  },
  {
    title: 'Staffly',
    meta: 'Product',
    ratio: '16 / 10',
    aspect: '16 / 10',
    media: { type: 'video', src: StafflyCard, webm: StafflyCardWebm, poster: StafflyPoster },
    full: { type: 'video', src: StafflyReel },
  },
  {
    title: 'CheckedIn',
    meta: 'Product',
    ratio: '3 / 4',
    aspect: '16 / 10',
    media: { type: 'video', src: CheckedInCard, webm: CheckedInCardWebm, poster: CheckedInPoster },
    full: { type: 'video', src: CheckedInReel },
  },
  {
    title: 'Lead Tracker',
    meta: 'Vanaways',
    dark: true,
    ratio: '5 / 4',
    aspect: '1800 / 1029',
    media: { type: 'image', src: LeadTracker },
  },
  {
    title: 'AI Travel App',
    meta: 'IBM',
    ratio: '1 / 1',
    aspect: '1920 / 1000',
    media: { type: 'video', src: IbmCard, poster: IbmPoster },
    full: { type: 'video', src: IbmReel },
  },
];
