import { SiInstagram } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/bookingContext';
import { track } from '../lib/analytics';
import { servicesData } from '../data/services';
import './component-styles/footer.css';

// `tag` adds a small pill beside the link
const PAGES: { to: string; label: string; tag?: string }[] = [
  { to: '/', label: 'Home' },
  { to: '/work', label: 'Work' },
  { to: '/packages', label: 'Packages' },
  { to: '/ui', label: 'UI Library', tag: 'New' },
];

const WORDMARK = 'gios.build';

/**
 * The dark footer every page reveals as you reach its end: the logo and
 * three columns of links, a quiet bottom row (copyright, privacy, socials),
 * and the name set huge along the bottom edge, cut off by it. Its parts rise
 * in one after another as the footer scrolls into view.
 */
export function Footer() {
  const { openBooking } = useBooking();
  const footerRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const footerHeight = footerRef.current?.offsetHeight ?? 0;
      const scrollPosition = window.scrollY + window.innerHeight;
      const footerStart = document.documentElement.scrollHeight - footerHeight;
      // start a little way into the footer, then play over the rest of it
      const animationDelay = footerHeight * 0.3;
      const animationRange = Math.max(1, footerHeight - animationDelay);
      setScrollProgress(Math.max(0, Math.min(1, (scrollPosition - footerStart - animationDelay) / animationRange)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // each part rises in a beat after the one before
  const getItemStyle = (index: number) => {
    const staggerDelay = index * 0.12;
    const adjusted = Math.max(0, Math.min(1, (scrollProgress - staggerDelay) / (1 - staggerDelay)));
    const eased = 1 - Math.pow(1 - adjusted, 3);
    return { transform: `translateY(${60 * (1 - eased)}px)`, opacity: eased };
  };

  // the wordmark's letters rise one after another, finishing as the footer
  // is fully in view
  const getLetterStyle = (index: number) => {
    const start = 0.45 + index * 0.04;
    const adjusted = Math.max(0, Math.min(1, (scrollProgress - start) / 0.19));
    const eased = 1 - Math.pow(1 - adjusted, 3);
    return { transform: `translateY(${40 * (1 - eased)}%)`, opacity: eased };
  };

  return (
    <footer className='footer' id='contact' ref={footerRef}>
      <div className='footer-container'>
        <div className='footer-top'>
          <Link to='/' className='footer-logo footer-animate-item' style={getItemStyle(0)} aria-label='gios.build, home'>
            gios.build
          </Link>

          <nav className='footer-columns' aria-label='Footer'>
            <div className='footer-column footer-animate-item' style={getItemStyle(1)}>
              <p className='footer-column-title'>Pages</p>
              <ul>
                {PAGES.map((page) => (
                  <li key={page.to}>
                    <Link to={page.to}>
                      {page.label}
                      {page.tag && <span className='footer-pill'>{page.tag}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className='footer-column footer-animate-item' style={getItemStyle(2)}>
              <p className='footer-column-title'>Services</p>
              <ul>
                {servicesData.map((service) => (
                  <li key={service.title}>
                    <Link to='/packages'>{service.title}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className='footer-column footer-animate-item' style={getItemStyle(3)}>
              <p className='footer-column-title'>Contact</p>
              <ul>
                <li>
                  <button type='button' onClick={() => openBooking('Footer')}>
                    Get a mockup<span className='footer-pill'>Free</span>
                  </button>
                </li>
                <li>
                  <a href='mailto:contact@gios.build' onClick={() => track('Contact link', { to: 'email' })}>
                    Email me
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className='footer-bottom footer-animate-item' style={getItemStyle(4)}>
          <p className='footer-copy'>© {new Date().getFullYear()} gios.build. Bath, UK.</p>
          <div className='footer-bottom-end'>
            <Link to='/privacy' className='footer-small-link'>Privacy</Link>
            <span className='footer-rule' aria-hidden />
            <div className='footer-social'>
              <a href='https://www.instagram.com/gios.build' target='_blank' rel='noopener noreferrer' aria-label='Instagram, @gios.build' onClick={() => track('Contact link', { to: 'instagram' })}>
                <SiInstagram aria-hidden />
              </a>
              <a href='https://www.linkedin.com/in/gio-posa-200541240' target='_blank' rel='noopener noreferrer' aria-label='LinkedIn' onClick={() => track('Contact link', { to: 'linkedin' })}>
                <FaLinkedinIn aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* the name, huge and faint, cut off by the footer's bottom edge */}
      <p className='footer-wordmark' aria-hidden>
        {[...WORDMARK].map((letter, index) => (
          <span key={index} className='footer-wordmark-letter' style={getLetterStyle(index)}>
            {letter}
          </span>
        ))}
      </p>
    </footer>
  );
}
