import './page-styles/aboutPage.css';
import { GoArrowUpRight } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import VanawaysAnimate from '../assets/project-images/VanawaysAnimate.mov';
import ProcessCard from '../assets/project-images/process-cards.svg';
import GiosBuildFontsAnimate from '../assets/project-images/gios-build-fonts.mov';

export function AboutPage() {
  const navigate = useNavigate();

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

  const howWeWorkData = [
    {
      id: "01",
      title: "Discover",
      text: "Understand what matters: your goals, your users, and the problem your product solves and the insights that drive great design."
    },
    {
      id: "02",
      title: "Design",
      text: "Create clean, high-impact visuals and interactions that feel intentional, modern, and engineered—not just styled."
    },
    {
      id: "03",
      title: "Refine",
      text: "Iterate quickly. Pixel-level polish until everything feels seamless and unmistakably yours."
    },
    {
      id: "04",
      title: "Deliver",
      text: "You get a final product that's cohesive, fast, and built to perform—something your team is proud to ship and your users love to experience."
    }
  ];

  return (
    <>
      <Helmet>
        <title>About — gios.build | Digital Design, Engineering & Brand Experience</title>

        <meta
          name="description"
          content="Learn about gios.build — a modern digital design and engineering studio delivering UI/UX design, web development, branding, and high-performance digital experiences for ambitious teams and modern brands."
        />

        <meta
          name="keywords"
          content="about gios.build, designer bio, ui ux designer, web designer uk, frontend engineer, digital studio, design portfolio, product designer, brand designer"
        />

        <link rel="canonical" href="https://www.gios.build/about" />
      </Helmet>

      <div className='about-page'>
        <div className='about-page-container'>
          
          {/* HERO */}
          <section className='about-page-hero-section'>
            <p className='about-hero-label'>About</p>
            <h1 className='about-hero-title'>Create products that move</h1>
            <p className='about-hero-text'>
              Fast, flexible, and detail-obsessed. Elevate your brand's presence while your team continues shipping product.
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
          
            {/* SERVICES */}
            <div className='about-services-block'>
              <p className='section-label'>Services</p>
              <div className='section-values-wrapper'>
                <p className='section-value'>
                  Most teams can't ship product and build a standout site. That's where I step in.
                </p>
                <p className='section-value'>
                  Everything I offer is simple, intentional, and focused on what moves your brand forward.
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
                  Join me in a process where clarity guides every choice and simplicity brings each design to life.
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
              <p className='section-label'>Built for momentum</p>
              <p className='section-value'>
                Turn your website into your strongest asset. Pick a package, tell me your vision, and we'll ship something beautiful and built to grow.
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