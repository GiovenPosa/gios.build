import './page-styles/homePage.css';
import { GoArrowUpRight, GoArrowDown } from "react-icons/go";
import { useState } from 'react';
import RinfoIcon from '../assets/icons/rinfo.svg?react';
import VanawaysIcon from '../assets/icons/vanaways.svg?react';
import IbmIcon from '../assets/icons/ibm.svg?react';
import LeadTracker from '../assets/project-images/lead-tracker.png';
import IbmAnimate from '../assets/project-images/IbmAnimate.mov';
import Rinfo from '../assets/project-images/rinfo-image-placeholder.png';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/bookingContext';

const servicesData = [
  {
    title: 'Design',
    items: ['UI/UX Design', 'Wireframing', 'Prototyping', 'Design Systems']
  },
  {
    title: 'Engineering',
    items: ['Frontend Development', 'Backend Development', 'API Integration', 'Database Design']
  },
  {
    title: 'Branding',
    items: ['Logo Design', 'Brand Strategy', 'Visual Identity', 'Brand Guidelines']
  },
  {
    title: 'Interaction',
    items: ['Micro-interactions', 'User Flows', 'Accessibility', 'Responsive Design']
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { openBooking } = useBooking();
  const [expandedService, setExpandedService] = useState<string | null>(null);

   const toggleService = (title: string) => {
    setExpandedService(expandedService === title ? null : title);
  };

  return (
    <div className='home-page'>
      <div className='home-page-container'>
        <section className='home-page-hero-section'>
          <p>Software Engineer • UI & UX Designer</p>
          <div className='hero-main-text'>
            <p>From the visual identity, to the backend systems powering it all. I design and build everything your product needs to shine.</p>
          </div>
          <div className='hero-action'>
          <span className='hero-action-button' onClick={openBooking}>
             <p>Book a call </p>
             <GoArrowUpRight/>
            </span>
          </div>
        </section>

        <section className='home-page-project-section'>
          <div className='project-container'>
            <div className='project-placeholder'>               
              <img src={LeadTracker} alt="Lead Tracker Web App" className='project-image'/>
              <span className='project-button'>
                <GoArrowUpRight />
              </span>
            </div>
            <p className='project-company'>Vanaways.</p>
            <p className='project-title'>Lead Tracker Design + Integration</p>
          </div>
          <div className='project-container'>
            <div className='project-placeholder'>
              <video 
              src={IbmAnimate} 
              className='project-video'
              autoPlay 
              loop 
              muted 
              playsInline
            />
              <span className='project-button'>
                <GoArrowUpRight />
              </span>
            </div>
            <p className='project-company'>IBM</p>
            <p className='project-title'>AI Travel App</p>
          </div>
          <div className='project-container'>
            <div className='project-placeholder'>
              <img src={Rinfo} alt="Rinfo Image" className='project-image'/>
              <span className='project-button'>
                <GoArrowUpRight />
              </span>
            </div>
            <p className='project-company'>Rinfo.</p>
            <p className='project-title'>Ring Central Extension</p>
          </div>
        </section>

        <section className='home-page-info-section'>
          <div className='design-info-block'>
            <p className='section-label'>Designing Success</p>
            <p className='section-value'>
              Great digital experiences blend many disciplines. I bring all of them together into one clean, consistent vision.
            </p>
            <span className='block-action'
              onClick={() => navigate('/work')}
            >
              <p>My Work</p>
              <GoArrowUpRight/>
            </span>
          </div>

          <div className='services-info-block'>
            <p className='section-label '>Services</p>
            <div className='services-bullets-container'>
              {servicesData.map((service) => (
                <div key={service.title} className='service-item'>
                  <span 
                    className='service-header'
                    onClick={() => toggleService(service.title)}
                  >
                    <p className='services-blt'>{service.title}</p>
                    <GoArrowDown className={`service-arrow ${expandedService === service.title ? 'rotated' : ''}`}/>
                  </span>
                  <div className={`service-dropdown ${expandedService === service.title ? 'expanded' : ''}`}>
                    <ul className='service-list'>
                      {service.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='story-block'>
            <p className='section-label'>My Story</p>
            <p className='section-value'>
              I move fast, stay flexible, and obsess over craft, detail, and performance. Your brand gets the presence it deserves while your team keeps doing what they do best.
            </p>
            <span className='block-action'
              onClick={() => navigate('/about')}
            >
              <p>About Me</p>
              <GoArrowUpRight/>
            </span>
          </div>

          <div className='clients-block'>
            <VanawaysIcon className='client-icon'/>
            <IbmIcon className='client-icon'/>
            <RinfoIcon className='client-icon'/>
          </div>
        </section>
      </div>
    </div>
  )
}