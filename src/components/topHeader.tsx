import './component-styles/topHeader.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LuPackage2 } from "react-icons/lu";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";

export function TopHeader() {
  const navigate = useNavigate();
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
      
      const headerRect = headerRef.current.getBoundingClientRect();
      const headerBottom = headerRect.bottom;
      
      const darkElements = document.querySelectorAll(
        '.project-placeholder, .work-project-placeholder, .about-project-placeholder'
      );
      
      let isOverDark = false;
      
      darkElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < headerBottom && rect.bottom > 0) {
          isOverDark = true;
        }
      });
      
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

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <div 
        ref={headerRef}
        className={`top-header ${isVisible ? 'visible' : 'hidden'} ${isDarkBackground ? 'dark-bg' : ''}`}
      >
        <div className='top-header-container'>
          <div className='top-header-logo' onClick={() => handleNavigate('/')}>
            <p>gios.build</p>
          </div>

          <div className='top-header-links'>
            <span onClick={() => navigate('/work')}>
              <p>WORK</p>
            </span>
            <span onClick={() => navigate('/about')}>
              <p>ABOUT</p>
            </span>
            <span onClick={() => navigate('/contact')}>
              <p>CONTACT</p>
            </span>
            <span className='top-header-button' onClick={() => navigate('/packages')}>
              <p>Packages</p>
              <LuPackage2/>
            </span>
          </div>

          <div className='mobile-menu-button' onClick={() => setIsMobileMenuOpen(true)}>
            <HiOutlineMenuAlt4 />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className='mobile-menu-close' onClick={() => setIsMobileMenuOpen(false)}>
          <IoCloseOutline />
        </div>
        <span onClick={() => handleNavigate('/')}>
          <p>HOME</p>
        </span>
        <span onClick={() => handleNavigate('/work')}>
          <p>WORK</p>
        </span>
        <span onClick={() => handleNavigate('/about')}>
          <p>ABOUT</p>
        </span>
        <span onClick={() => handleNavigate('/contact')}>
          <p>CONTACT</p>
        </span>
        <span onClick={() => handleNavigate('/packages')}>
          <p>PACKAGES</p>
        </span>
      </div>
    </>
  )
}