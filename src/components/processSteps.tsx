import { GoArrowRight } from 'react-icons/go';
import { processData } from '../data/process';
import { WhatsAppLink } from './whatsappLink';
import { PinnedPanels, type PinnedPanel } from './pinnedPanels';
import { DiscoverArt } from './serviceArt/discoverArt';
import { DeliverArt } from './serviceArt/deliverArt';
import KapeMerienda from '../assets/project-images/mobile/kape-5-merienda.webp';
import PrimeStockAlwaysOn from '../assets/project-images/mobile/primestock-2-always-on.webp';
import KapeNewOnMenu from '../assets/project-images/mobile/kape-3-new-on-menu.webp';
import OssaSeen from '../assets/project-images/mobile/ossa-2-seen.webp';

// Each step's picture: an animated graphic on a colour card (drawn in that
// colour's line work, see serviceArt/), or two phone screenshots from the
// sites already built.
const art: Pick<PinnedPanel, 'color' | 'Art' | 'phones'>[] = [
  // Discover: espresso line work on warm sand
  { color: '#dfd5cb', Art: DiscoverArt },
  // Design: pages from two sites, each designed in its own look (Kape's
  // merienda, Prime Stock's "always on")
  { phones: [KapeMerienda, PrimeStockAlwaysOn] },
  // Refine: finished, refined pages from two sites (Ossa's "Seen.
  // Supported." and Kape's "New on the menu")
  { phones: [OssaSeen, KapeNewOnMenu] },
  // Deliver: light mint line work on deep forest
  { color: '#1c3b36', Art: DeliverArt },
];

const panels: PinnedPanel[] = processData.map((step, index) => ({
  title: step.title,
  items: step.items,
  ...art[index % art.length],
}));

/**
 * The four steps, in the same format as the services: a pinned list beside
 * their panels (see pinnedPanels.tsx).
 */
export function ProcessSteps() {
  return (
    <PinnedPanels
      id='process-title'
      headline={['Four steps.', 'No surprises.']}
      panels={panels}
      foot='From first conversation to launch, you always know what happens next.'
      action={
        <WhatsAppLink className='hero-action-button' from='Four steps' revealNumber>
          <p>WhatsApp me</p>
          <GoArrowRight aria-hidden />
        </WhatsAppLink>
      }
    />
  );
}
