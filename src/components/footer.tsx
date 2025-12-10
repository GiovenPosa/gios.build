import { GoArrowUpRight } from 'react-icons/go';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './component-styles/footer.css';

export function Footer() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const footerHeight = 900; // matches --footer-h
      const footerStart = documentHeight - footerHeight;
      
      // Delay the animation start - increase this value to start later
      const animationDelay = 400; // pixels into the footer before animation begins
      const animationRange = footerHeight - animationDelay; // remaining distance for animation
      
      // Calculate how far into the footer we've scrolled (0 to 1)
      const progress = Math.max(0, Math.min(1, (scrollPosition - footerStart - animationDelay) / animationRange));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate transform values based on scroll progress
  // Each item has a different start point for staggered effect
  const getItemStyle = (index: number) => {
    const staggerDelay = index * 0.15; // stagger each item
    const adjustedProgress = Math.max(0, Math.min(1, (scrollProgress - staggerDelay) / (1 - staggerDelay)));
    
    // Easing function for smoother animation
    const eased = 1 - Math.pow(1 - adjustedProgress, 3);
    
    const translateY = 80 * (1 - eased);
    const opacity = eased;
    
    return {
      transform: `translateY(${translateY}px)`,
      opacity: opacity
    };
  };

  return (
    <div className='footer'>
      <div className='footer-container'>
        <div className='footer-contact footer-animate-item' style={getItemStyle(0)}>
          <p className='footer-label'>Contact</p>
          <p className='footer-text'>Give your product the full digital experience it deserves</p>
          <span className='footer-button'
          onClick={() => navigate('/contact')} >
            <p>Lets talk</p>
            <GoArrowUpRight/>
          </span>
        </div>
        <div className='footer-links footer-animate-item' style={getItemStyle(1)}>
          <p onClick={() => navigate('/')} >Home</p>
          <p onClick={() => navigate('/work')} >Work</p>
          <p onClick={() => navigate('/about')} >About Me</p>
          <p onClick={() => navigate('/contact')} >Contact</p>
        </div>
        <div className='footer-links footer-animate-item' style={getItemStyle(2)}>
          <p>LinkedIn</p>
          <p>Instagram</p>
          <p>Github</p>
        </div>
        <p className='footer-tag footer-animate-item' style={{
          ...getItemStyle(3),
          opacity: getItemStyle(3).opacity * 0.8 
        }}>2025 crafted by Gio Posa</p>
      </div>
    </div>
  )
}