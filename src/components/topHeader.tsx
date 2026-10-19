import './component-styles/topHeader.css';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LuPackage2 } from "react-icons/lu";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";

export function TopHeader() {
  const { pathname } = useLocation();
  // the red dot that marks a link on hover, and stays on the current page
  const navClass = (path: string) => `nav-link${pathname === path ? ' is-current' : ''}`;
  const dot = <i className='nav-dot' aria-hidden />;
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

      const darkRects = [...document.querySelectorAll('.work-card.is-dark .work-surface')].map((el) =>
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
        className={`top-header ${isVisible ? 'visible' : 'hidden'} ${isDarkBackground ? 'dark-bg' : ''}`}
      >
        <div className='top-header-container'>
          <Link to='/' className='top-header-logo' onClick={closeMenu} aria-label='gios.build, home'>
            <p>gios.build</p>
          </Link>

          <div className='top-header-links'>
            <Link to='/work' className={navClass('/work')} aria-current={pathname === '/work' ? 'page' : undefined}>
              {dot}
              <p>WORK</p>
            </Link>
            <Link to='/packages' className='top-header-button' aria-current={pathname === '/packages' ? 'page' : undefined}>
              <p>Packages</p>
              <LuPackage2 aria-hidden />
            </Link>
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
      </nav>
    </>
  )
}