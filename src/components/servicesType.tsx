import { useRef, useState, type CSSProperties } from 'react';
import { servicesData } from '../data/services';
import { useScrollFocus } from '../hooks/useScrollFocus';
import { Reveal } from './reveal';
import { SectionBar } from './sectionBar';
import { HostingArt } from './serviceArt/hostingArt';
import { NewSiteArt } from './serviceArt/newSiteArt';
import { RedesignArt } from './serviceArt/redesignArt';
import { BookingArt } from './serviceArt/bookingArt';
import { FoundArt } from './serviceArt/foundArt';
import './component-styles/servicesType.css';

// Which side each line's notes hang on, and the placeholder colour for the
// image that opens up inside the line while it's active (swap for real
// thumbnails later).
const layout = [
  // New Websites: white line work on soft baby blue
  { notes: 'after', thumb: '#7cc4e4', art: 'site' },
  // Redesigns: espresso line work on fresh green
  { notes: 'before', thumb: '#95fc9c', art: 'redesign' },
  // Leads & Bookings: deep forest line work on soft sage
  { notes: 'after', thumb: '#e1ead9', art: 'booking' },
  // Getting Found: light mint line work on deep forest
  { notes: 'before', thumb: '#1c3b36', art: 'found' },
  // Hosting & Care: the first animated graphic (light slot, black line work)
  { notes: 'after', thumb: '#e9e9eb', art: 'hosting' },
] as const;

/**
 * Services as a typeset stack, after shopify.design: each service is one
 * poster-sized line, centred, so opening its image pushes both halves out
 * evenly. One line is always the
 * active one (the first, until another is hovered or tapped): it turns red,
 * an image opens up between its words (on touch screens, the line passing the
 * middle of the screen as you scroll), and its sub-items, hung beside it as
 * small mono notes, darken and step in one by one.
 */
export function ServicesType() {
  const [active, setActive] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  // touch screens: the line crossing the middle of the screen opens itself
  useScrollFocus(stackRef, '.svc-row', setActive);

  return (
    <div className='svc'>
      <SectionBar label='What I do' className='svc-bar'>
        <span>{String(servicesData.length).padStart(2, '0')} services</span>
      </SectionBar>

      <div className='svc-stack' ref={stackRef}>
        {servicesData.map((service, index) => {
          const { notes, thumb, ...tone } = layout[index % layout.length];
          const art = 'art' in tone ? tone.art : null;
          const [first, ...rest] = service.title.split(' ');
          const isActive = active === index;
          const list = (
            <ul className={`svc-notes svc-notes-${notes}`} aria-hidden={!isActive}>
              {service.items.map((item, k) => (
                <li key={item} style={{ '--k': k } as CSSProperties}>{item}</li>
              ))}
            </ul>
          );

          return (
            <Reveal
              as="div"
              key={service.title}
              className={`svc-row${isActive ? ' is-active' : ''}`}
              delay={index * 60}
            >
              <button
                type='button'
                className='svc-line'
                aria-pressed={isActive}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
              >
                {notes === 'before' && list}
                <span className='svc-title'>
                  {first}
                  <span className='svc-thumb' style={{ backgroundColor: thumb }} aria-hidden>
                    {art === 'hosting' ? <HostingArt active={isActive} /> : art === 'site' ? <NewSiteArt active={isActive} /> : art === 'redesign' ? <RedesignArt active={isActive} /> : art === 'booking' ? <BookingArt active={isActive} /> : art === 'found' ? <FoundArt active={isActive} /> : <span>Image</span>}
                  </span>
                  {rest.length > 0 && ` ${rest.join(' ')}`}
                </span>
                {notes === 'after' && list}
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
