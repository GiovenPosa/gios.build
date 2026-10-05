import './page-styles/homePage.css';
import { GoArrowUpRight, GoArrowDown } from "react-icons/go";
import { useState } from 'react';
import RinfoIcon from '../assets/icons/rinfo.svg?react';
import VanawaysIcon from '../assets/icons/vanaways.svg?react';
import IbmIcon from '../assets/icons/ibm.svg?react';
import LeadTracker from '../assets/project-images/lead-tracker.png';
import IbmAnimate from '../assets/project-images/IbmAnimate.mp4';
import Rinfo from '../assets/project-images/rinfo-image-placeholder.png';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/bookingContext';
import { Helmet } from 'react-helmet-async';
import { servicesData } from '../data/services';


export function HomePage() {
  const navigate = useNavigate();
  const { openBooking } = useBooking();
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggleService = (title: string) => {
    setExpandedService(expandedService === title ? null : title);
  };

  return (
    <>
      <Helmet>
        <title>
          gios.build — Websites for Small Businesses in Bath & Across the UK | Gio Posa
        </title>

        <meta
          name="description"
          content="I'm Gio, a web designer and software engineer in Bath. I build new websites and redesign old ones for small businesses across the UK, from £500, with a free homepage mockup before you commit."
        />

        <meta
          name="keywords"
          content="web designer bath, web developer bath, small business website, website redesign, web design uk, gios.build"
        />

        <link rel="canonical" href="https://www.gios.build/" />
      </Helmet>

      <div className='home-page'>
        <div className='home-page-container'>
          <section className='home-page-hero-section'>
            <h1>Hi, I'm Gio. Web designer & developer for small businesses</h1>
            <div className='hero-main-text'>
              <p>
                I design and build new websites, or rebuild tired old ones, so your business looks professional and turns visitors into enquiries.
              </p>
            </div>
            <p className='hero-sub'>
              Websites <span className='hero-sub-price'>from £500</span>. See a free mockup of your new homepage before you commit.
            </p>
            <div className='hero-action'>
              <span className='hero-action-button' onClick={() => openBooking()}>
                <p>Get a free mockup</p>
                <GoArrowUpRight/>
              </span>
              <span className='hero-action-button secondary' onClick={() => navigate('/work')}>
                <p>See my work</p>
              </span>
            </div>
          </section>

          <section className='home-page-project-section'>
            <div className='project-container'>
              <div className='project-placeholder'>               
                <img
                  src={LeadTracker}
                  alt="Lead Tracker web app for Vanaways – sales call tracking dashboard"
                  className='project-image'
                />
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
              </div>
              <p className='project-company'>IBM Internship</p>
              <p className='project-title'>AI Travel App</p>
            </div>

            <div className='project-container'>
              <div className='project-placeholder'>
                <img
                  src={Rinfo}
                  alt="Rinfo RingCentral extension interface"
                  className='project-image'
                />
              </div>
              <p className='project-company'>Rinfo.</p>
              <p className='project-title'>Ring Central Extension</p>
            </div>
          </section>

          <section className='home-page-info-section'>
            <div className='design-info-block'>
              <p className='section-label'>Recent Work</p>
              <p className='section-value'>
                Websites and tools built for real businesses, designed with care and engineered to last.
              </p>
              <span
                className='block-action'
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
                      <GoArrowDown
                        className={`service-arrow ${expandedService === service.title ? 'rotated' : ''}`}
                      />
                    </span>
                    <div className={`service-dropdown ${expandedService === service.title ? 'expanded' : ''}`}>
                      <div className='service-dropdown-inner'>
                        <ul className='service-list'>
                          {service.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='story-block'>
              <p className='section-label'>My Story</p>
              <p className='section-value'>
                A Master's in Computer Science from Bristol, then almost two years as lead software engineer at Vanaways. Now I build websites for small businesses in Bath and across the UK.
              </p>
              <span
                className='block-action'
                onClick={() => navigate('/about')}
              >
                <p>About Me</p>
                <GoArrowUpRight/>
              </span>
            </div>

            <p className='clients-label'>Where I've worked and built</p>
            <div className='clients-block'>
              <VanawaysIcon className='client-icon'/>
              <IbmIcon className='client-icon'/>
              <RinfoIcon className='client-icon'/>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}