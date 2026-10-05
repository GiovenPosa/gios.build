import './page-styles/aboutPage.css';
import { GoArrowUpRight } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { servicesData } from '../data/services';
import VanawaysAnimate from '../assets/project-images/VanawaysAnimate.mp4';
import ProcessCard from '../assets/project-images/process-cards.svg';
import GiosBuildFontsAnimate from '../assets/project-images/gios-build-fonts.mp4';

export function AboutPage() {
  const navigate = useNavigate();

  const journeyData = [
    {
      title: "Master's in Computer Science",
      text: "University of Bristol. Where I learned to engineer things properly, and found I cared just as much about how they look and feel."
    },
    {
      title: "Software Engineering Intern",
      text: "IBM. Worked on an AI travel app and learned how big teams design, build and ship."
    },
    {
      title: "Lead Software Engineer",
      text: "Vanaways, Bristol. Almost two years building the tools a van sales team uses to track and convert every lead."
    },
    {
      title: "Founder, gios.build",
      text: "Bath. Bringing all of it to small businesses that deserve better than a template."
    }
  ];

  const howWeWorkData = [
    {
      id: "01",
      title: "Discover",
      text: "We talk about your business, your customers and what the website needs to do. Then I design a free mockup of your new homepage."
    },
    {
      id: "02",
      title: "Design",
      text: "If you love the mockup, we agree the pages, features and price, and I design the rest of the site around it."
    },
    {
      id: "03",
      title: "Refine",
      text: "You see progress as I build and we refine it together. How many rounds depends on how bespoke the project is, and we agree that upfront."
    },
    {
      id: "04",
      title: "Deliver",
      text: "I set up hosting and your domain, then launch. A simple website is usually live in about 4 weeks, and I can look after it monthly from there."
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Gio Posa — Web Designer & Software Engineer in Bath | gios.build</title>

        <meta
          name="description"
          content="I'm Gio, a software engineer and designer in Bath. Computer Science Master's from the University of Bristol, IBM intern, and former lead software engineer at Vanaways. Now I build websites for small businesses."
        />

        <meta
          name="keywords"
          content="gio posa, web designer bath, web developer bath, software engineer bath, small business websites, gios.build"
        />

        <link rel="canonical" href="https://www.gios.build/about" />
      </Helmet>

      <div className='about-page'>
        <div className='about-page-container'>
          
          {/* HERO */}
          <section className='about-page-hero-section'>
            <p className='about-hero-label'>About</p>
            <h1 className='about-hero-title'>Hi, I'm Gio</h1>
            <p className='about-hero-text'>
              A software engineer and designer from Bath. I build websites for small businesses that look the part and bring in customers.
            </p>
          </section>

          {/* INTRO VISUAL */}
          <section className='about-page-info-section'>
            <div className='about-project-container'>
              <div className='about-project-placeholder'>    
                <video 
                  src={VanawaysAnimate}
                  className='work-project-video'
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                />        
              </div>
            </div>
          
            {/* STORY */}
            <div className='about-services-block'>
              <p className='section-label'>My Story</p>
              <div className='section-values-wrapper'>
                <p className='section-value'>
                  I've always cared about two things: how software works, and how it feels to use.
                </p>
                <p className='section-value'>
                  Building lead tools for a sales team taught me what makes someone get in touch, and how easily a clunky website loses them. gios.build is where I put that to work for small businesses.
                </p>

                {journeyData.map((step) => (
                  <div key={step.title} className='about-process-list'>
                    <p className='process-title'>{step.title}</p>
                    <p className='process-text'>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SERVICES */}
            <div className='about-services-block'>
              <p className='section-label'>Services</p>
              <div className='section-values-wrapper'>
                <p className='section-value'>
                  Everything a small business needs to look professional online and turn visitors into customers.
                </p>
                <p className='section-value'>
                  One person from first sketch to launch, so nothing gets lost between a designer and a developer.
                </p>

                {servicesData.map((service) => (
                  <div key={service.title} className='about-services-list'>
                    <p className='services-title'>{service.title}</p>
                    <p className='services-text'>{service.items.join(' / ')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PROCESS VISUAL */}
            <div className='about-project-container process'>
              <div className='about-project-placeholder process-half'>
                <img
                  src={ProcessCard}
                  alt="Four-step design and development process — Discover, Design, Refine, Deliver"
                  className='about-project-image'
                />         
              </div>
              <div className='about-project-placeholder process-half'>  
                <video 
                  src={GiosBuildFontsAnimate}
                  className='gios-build-font-animate'
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                />                  
              </div>
            </div>

            {/* PROCESS LIST */}
            <div className='about-how-block'>
              <p className='section-label'>Process</p>
              <div className='section-values-wrapper'>
                <p className='section-value'>
                  Simple and transparent. You see your new homepage before you commit to anything.
                </p>
                {howWeWorkData.map((process) => (
                  <div key={process.title} className='about-process-list'>
                    <p className='process-title'>{process.id} {process.title}</p>
                    <p className='process-text'>{process.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className='about-mission-block'>
              <p className='section-label'>Work With Me</p>
              <p className='section-value'>
                Pick a package, or just tell me what you need. I'll get back to you within 24 hours.
              </p>
              <span className='block-action' onClick={() => navigate('/packages')}>
                <p>Packages</p>
                <GoArrowUpRight/>
              </span>
            </div>

          </section>
        </div>
      </div>
    </>
  )
}