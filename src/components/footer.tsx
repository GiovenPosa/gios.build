import { GoArrowUpRight } from 'react-icons/go';
import { SiInstagram } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/bookingContext';
import { track } from '../lib/analytics';
import './component-styles/footer.css';

/**
 * The site's contact section, on the dark footer that every page reveals as
 * you reach its end (it used to be the separate /contact page). Its items
 * rise in one after another as the footer scrolls into view.
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

  // each item rises in a beat after the one before
  const getItemStyle = (index: number) => {
    const staggerDelay = index * 0.12;
    const adjusted = Math.max(0, Math.min(1, (scrollProgress - staggerDelay) / (1 - staggerDelay)));
    const eased = 1 - Math.pow(1 - adjusted, 3);
    return { transform: `translateY(${60 * (1 - eased)}px)`, opacity: eased };
  };

  return (
    <footer className='footer' id='contact' ref={footerRef}>
      <div className='footer-container'>
        <div className='footer-main footer-animate-item' style={getItemStyle(0)}>
          <p className='footer-label'>Contact</p>
          <h2 className='footer-title'>Get in touch</h2>
          <p className='footer-text'>Tell me about your business. I'll reply within 24 hours.</p>
          <button type='button' className='footer-button' onClick={() => openBooking('Footer')}>
            <p>Get a free mockup</p>
            <GoArrowUpRight aria-hidden />
          </button>
        </div>

        <div className='footer-details'>
          <div className='footer-detail footer-animate-item' style={getItemStyle(1)}>
            <p className='footer-detail-label'>Email</p>
            <a href='mailto:contact@gios.build' className='footer-detail-value' onClick={() => track('Contact link', { to: 'email' })}>contact@gios.build</a>
          </div>

          <div className='footer-detail footer-animate-item' style={getItemStyle(2)}>
            <p className='footer-detail-label'>Connect</p>
            <div className='footer-social'>
              <a href='https://www.linkedin.com/in/gio-posa-200541240' target='_blank' rel='noopener noreferrer' aria-label='LinkedIn' onClick={() => track('Contact link', { to: 'linkedin' })}>
                <FaLinkedinIn />
              </a>
              <a href='https://www.instagram.com/gios.build' target='_blank' rel='noopener noreferrer' aria-label='Instagram, @gios.build' onClick={() => track('Contact link', { to: 'instagram' })}>
                <SiInstagram />
              </a>
            </div>
          </div>

          <div className='footer-detail footer-animate-item' style={getItemStyle(3)}>
            <p className='footer-detail-label'>Based in</p>
            <p className='footer-detail-value'>Bath, UK. Working with businesses across the UK.</p>
          </div>
        </div>

        <div className='footer-bottom footer-animate-item' style={getItemStyle(4)}>
          <nav className='footer-nav' aria-label='Footer'>
            <Link to='/'>Home</Link>
            <Link to='/work'>Work</Link>
            <Link to='/packages'>Packages</Link>
            <Link to='/privacy'>Privacy</Link>
          </nav>
          <p className='footer-tag'>{new Date().getFullYear()} crafted by Gio Posa</p>
        </div>
      </div>
    </footer>
  );
}
