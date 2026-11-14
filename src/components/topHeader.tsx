import './component-styles/topHeader.css';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";
import { GoArrowRight } from "react-icons/go";
import { SiInstagram } from 'react-icons/si';
import { track } from '../lib/analytics';
import { useBooking } from '../context/bookingContext';
import { WhatsAppLink } from './whatsappLink';

export function TopHeader() {
  const { pathname } = useLocation();
  // the red dot that marks a link on hover, and stays on the current page
  const navClass = (path: string) => `nav-link${pathname === path ? ' is-current' : ''}`;
  // on one of the nav's own pages, the other links step back
  const navPages = ['/work', '/packages'];
  const headerNavClass = (path: string) =>
    `${navClass(path)}${navPages.includes(pathname) && pathname !== path ? ' is-muted' : ''}`;
  const dot = <i className='nav-dot' aria-hidden />;
  // once the page moves, the header gets its white bar and hairline
  const [isScrolled, setIsScrolled] = useState(false);
  // the free mockup button at the far right: on the home page it slides in
  // once the hero has scrolled away; on every other page it's always there
  const [isPastHero, setIsPastHero] = useState(pathname !== '/');
  const { openBooking } = useBooking();
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
      // on the home page, once the hero's foot has gone up behind the
      // header; every other page shows the button all along
      const hero = pathname === '/' ? document.querySelector('.home-page-hero-section') : null;
      const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      setIsPastHero(hero ? hero.getBoundingClientRect().bottom < headerBottom : pathname !== '/');
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const checkBackgroundColor = () => {
      if (!headerRef.current) return;
      
      // Light text only when it's dark behind the header's words themselves:
      // behind the logo, and behind the nav (or the menu button on phones).
      // A dark card elsewhere along the bar no longer flips it.
      const header = headerRef.current;
      const probes = [
        header.querySelector('.top-header-logo'),
        header.querySelector('.top-header-links'),
        header.querySelector('.mobile-menu-button'),
      ]
        .map((el) => el?.getBoundingClientRect())
        .filter((rect): rect is DOMRect => !!rect && rect.width > 0);

      // dark work cards, and any dark band that marks itself (the /ui page's)
      const darkRects = [...document.querySelectorAll('.work-card.is-dark .work-surface, [data-header-dark]')].map((el) =>
        el.getBoundingClientRect()
      );
      const isDarkBehind = (probe: DOMRect) => {
        const x = probe.left + probe.width / 2;
        const y = probe.top + probe.height / 2;
        return darkRects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
      };

      let isOverDark = probes.length > 0 && probes.every(isDarkBehind);
      
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 200;
      const footerStart = documentHeight - footerHeight;
      
      if (scrollPosition > footerStart + 50) {
        isOverDark = true;
      }
      
      setIsDarkBackground(isOverDark);
    };

    window.addEventListener('scroll', checkBackgroundColor, { passive: true });
    
    const timeoutId = setTimeout(checkBackgroundColor, 100);
    
    return () => {
      window.removeEventListener('scroll', checkBackgroundColor);
      clearTimeout(timeoutId);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // links navigate themselves; leaving the menu closes it
  const closeMenu = () => setIsMobileMenuOpen(false);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  return (
    <>
      <div 
        ref={headerRef}
        className={`top-header${isScrolled ? ' is-scrolled' : ''}${isDarkBackground && !isScrolled ? ' dark-bg' : ''}`}
      >
        <div className='top-header-container'>
          {/* the logo, with the nav beside it */}
          <div className='top-header-start'>
            <Link to='/' className='top-header-logo' onClick={closeMenu} aria-label='gios.build, home'>
              <p>gios.build</p>
            </Link>
            <nav className='top-header-links' aria-label='Main'>
              <Link to='/work' className={headerNavClass('/work')} aria-current={pathname === '/work' ? 'page' : undefined}>
                {dot}
                <p>Work</p>
              </Link>
              <Link to='/packages' className={headerNavClass('/packages')} aria-current={pathname === '/packages' ? 'page' : undefined}>
                {dot}
                <p>Packages</p>
              </Link>
            </nav>
          </div>

          {/* Instagram, then a thin rule and the free mockup button */}
          <div className='top-header-end'>
            <a
              className='top-header-social'
              href='https://www.instagram.com/gios.build'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram, @gios.build'
              onClick={() => track('Contact link', { to: 'instagram', from: 'header' })}
            >
              <SiInstagram aria-hidden />
            </a>
            {/* opens from nothing (the rule with it), so its width pushes
                Instagram left */}
            <div className={`top-header-cta${isPastHero ? ' is-shown' : ''}`} inert={!isPastHero}>
              <div className='top-header-cta-clip'>
                <span className='top-header-rule' aria-hidden />
                <button type='button' className='top-header-button' onClick={() => openBooking('Header')}>
                  <p>Get a free mockup</p>
                  <GoArrowRight aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <button type='button' className='mobile-menu-button' onClick={() => setIsMobileMenuOpen(true)} aria-label='Open menu' aria-expanded={isMobileMenuOpen} aria-controls='mobile-menu'>
            <HiOutlineMenuAlt4 aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {/* inert while closed, so Tab and screen readers skip the hidden links */}
      <nav id='mobile-menu' className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} aria-label='Menu' inert={!isMobileMenuOpen}>
        <button type='button' className='mobile-menu-close' onClick={closeMenu} aria-label='Close menu'>
          <IoCloseOutline aria-hidden />
        </button>
        <Link to='/' className={navClass('/')} onClick={closeMenu}>
          {dot}
          <p>HOME</p>
        </Link>
        <Link to='/work' className={navClass('/work')} onClick={closeMenu}>
          {dot}
          <p>WORK</p>
        </Link>
        <Link to='/packages' className={navClass('/packages')} onClick={closeMenu}>
          {dot}
          <p>PACKAGES</p>
        </Link>
        {/* on phones WhatsApp is one tap away, so it closes the menu */}
        <WhatsAppLink className='hero-action-button mobile-menu-whatsapp' from='Menu' onClick={closeMenu}>
          <p>WhatsApp me</p>
          <GoArrowRight aria-hidden />
        </WhatsAppLink>
      </nav>
    </>
  )
}