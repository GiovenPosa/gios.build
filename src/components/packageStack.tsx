import { useRef, useState, type CSSProperties } from 'react';
import { GoArrowUpRight } from 'react-icons/go';
import { packagesData, formatPrice } from '../data/packages';
import { useBooking } from '../context/bookingContext';
import { useScrollFocus } from '../hooks/useScrollFocus';
import { Reveal } from './reveal';
import { SectionBar } from './sectionBar';
import { NewSiteArt } from './serviceArt/newSiteArt';
import { RedesignArt } from './serviceArt/redesignArt';
import { BookingArt } from './serviceArt/bookingArt';
import './component-styles/packageStack.css';

const ART = { site: NewSiteArt, redesign: RedesignArt, booking: BookingArt };

/**
 * The packages as a price list of poster-sized prices, one per row between
 * hairlines. One row is always the active one (the middle, until another is
 * hovered or tapped; on touch screens, whichever row is passing the middle of
 * the screen as you scroll): its price comes forward, a slot opens beside it playing
 * that package's graphic, and its notes darken. Each row also carries a
 * small ladder of bars, one per tier, because each package includes
 * everything in the one before it.
 */
export function PackageStack() {
  const [active, setActive] = useState(1);
  const { openBooking } = useBooking();
  const listRef = useRef<HTMLDivElement>(null);

  // touch screens: the row crossing the middle of the screen is the active one
  useScrollFocus(listRef, '.pk-row', setActive);

  return (
    <section className='pk' aria-label='Packages'>
      <SectionBar label='Packages' className='pk-bar'>
        <span>From {formatPrice(packagesData[0].from)}</span>
      </SectionBar>

      <div className='pk-list' ref={listRef}>
        {packagesData.map((pkg, index) => {
          const Art = ART[pkg.art];
          const isActive = active === index;
          const below = packagesData[index - 1];

          return (
            <Reveal
              as="div"
              key={pkg.id}
              className={`pk-row${isActive ? ' is-active' : ''}`}
              delay={index * 60}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <div className='pk-name'>
                <span className='pk-ladder' role='img' aria-label={`Tier ${index + 1} of ${packagesData.length}`}>
                  {packagesData.map((_, bar) => (
                    <i key={bar} className={bar <= index ? 'is-on' : ''} style={{ '--b': bar } as CSSProperties} />
                  ))}
                </span>
                <h2>{pkg.name}</h2>
                <p>{pkg.for}</p>
              </div>

              <div className='pk-price'>
                <span className='pk-from'>From</span>
                <span className='pk-amount'>
                  <span className='price-sign'>£</span>
                  {pkg.from.toLocaleString('en-GB')}
                  {!pkg.to && <span className='price-plus'>+</span>}
                </span>
                <span className='pk-slot' style={{ backgroundColor: pkg.slot }} aria-hidden>
                  <Art active={isActive} />
                </span>
              </div>

              <div className='pk-notes'>
                <ul>
                  {below && (
                    <li className='pk-plus' style={{ '--k': 0 } as CSSProperties}>
                      Everything in {below.name}, plus
                    </li>
                  )}
                  {pkg.items.map((item, k) => (
                    <li key={item} style={{ '--k': k + (below ? 1 : 0) } as CSSProperties}>{item}</li>
                  ))}
                </ul>
                <p className='pk-range'>{pkg.timeline}</p>
                <button
                  type='button'
                  className='pk-choose'
                  onClick={(e) => {
                    e.stopPropagation();
                    openBooking('Package list', { packageId: pkg.id });
                  }}
                >
                  Choose {pkg.name}
                  <GoArrowUpRight />
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
