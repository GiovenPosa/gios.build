import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { Reveal } from './reveal';
import './component-styles/pinnedPanels.css';

export interface PinnedPanel {
  title: string;
  /** the short points that open under the title while it's active */
  items: string[];
  /** the colour of the graphic's card */
  color?: string;
  /** the graphic, drawn in line work to suit that colour; plays while active */
  Art?: ComponentType<{ active: boolean }>;
  /** or, instead of the graphic: two phone screenshots side by side, the
   *  left one raised (its lower half in view), the right one lowered (its
   *  upper half in view) */
  phones?: [string, string];
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A pinned list beside a column of big panels, shared by the services and
 * the process. The left side (headline, the list, a closing line) stays put
 * while the panels on the right scroll past; whichever panel crosses the
 * middle of the screen is the active one: its name darkens, its points open
 * under it, and its graphic plays. Clicking a name scrolls its panel into
 * place. On phones nothing is pinned: each panel carries its own name and
 * points.
 */
export function PinnedPanels({
  id,
  headline,
  panels,
  foot,
  action,
}: {
  /** for the headline, which names the section */
  id: string;
  /** the two halves of the headline, one per line */
  headline: [string, string];
  panels: PinnedPanel[];
  foot: ReactNode;
  /** a button under the closing line */
  action?: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // the panel on the middle line of the screen is the active one
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    panelRefs.current.forEach((panel) => panel && observer.observe(panel));
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) =>
    panelRefs.current[index]?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });

  return (
    <section className='pinned' aria-labelledby={id}>
      <div className='pinned-side'>
        <Reveal as='h2' className='pinned-headline' id={id}>
          <span>{headline[0]}</span> <span>{headline[1]}</span>
        </Reveal>

        <ol className='pinned-list'>
          {panels.map((panel, index) => {
            const isActive = active === index;
            return (
              <Reveal as='li' key={panel.title} className={`pinned-item${isActive ? ' is-active' : ''}`} delay={index * 50}>
                <button type='button' className='pinned-name' aria-current={isActive || undefined} onClick={() => goTo(index)}>
                  {panel.title}
                </button>
                {/* a one-row grid, so the points can open and close smoothly */}
                <div className='pinned-details' aria-hidden={!isActive}>
                  <ul>
                    {panel.items.map((item, k) => (
                      <li key={item} style={{ '--k': k } as CSSProperties}>{item}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </ol>

        <Reveal as='p' className='pinned-foot' delay={120}>
          {foot}
        </Reveal>

        {/* an optional button under the closing line; it stays on short screens */}
        {action && (
          <Reveal className='pinned-foot-action' delay={160}>
            {action}
          </Reveal>
        )}
      </div>

      <div className='pinned-panels'>
        {panels.map(({ title, items, color, Art, phones }, index) => (
          <div
            key={title}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            data-index={index}
            className={`pinned-panel${active === index ? ' is-active' : ''}`}
          >
            {/* a soft grey placeholder, with the animation on a card of its
                own inside it in the panel's colour (like the story photos) */}
            <div className='pinned-canvas' style={{ '--panel': color } as CSSProperties} aria-hidden>
              {phones ? (
                <div className='pinned-phones'>
                  {phones.map((src) => (
                    <img key={src} className='pinned-phone' src={src} alt='' loading='lazy' decoding='async' />
                  ))}
                </div>
              ) : (
                Art && (
                  <div className='pinned-tile'>
                    <Art active={active === index} />
                  </div>
                )
              )}
            </div>
            {/* phones only: the name and points travel with their panel */}
            <div className='pinned-caption'>
              <h3>{title}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
