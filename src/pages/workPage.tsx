import './page-styles/workPage.css';
import LeadTracker from '../assets/project-images/lead-tracker.png';
import IbmAnimate from '../assets/project-images/IbmAnimate.mp4';
import Rinfo from '../assets/project-images/rinfo-image-placeholder.png';
import { GoArrowUpRight } from "react-icons/go";
import { Helmet } from 'react-helmet-async';
import { useBooking } from '../context/bookingContext';
import { Reveal } from '../components/reveal';

export function WorkPage() {
  const { openBooking } = useBooking();

  return (
    <>
      <Helmet>
        <title>Work — gios.build | Websites & Software Built by Gio Posa</title>

        <meta
          name="description"
          content="Selected projects by Gio Posa: a sales lead tracker for Vanaways, an AI travel app built during an IBM internship, and a RingCentral extension for Rinfo."
        />

        <meta
          name="keywords"
          content="web design portfolio, ui ux portfolio, software engineering portfolio, digital product design, frontend development work, case studies, gios.build projects"
        />

        <link rel="canonical" href="https://www.gios.build/work" />
      </Helmet>

      <div className='work-page'>
        <div className='work-page-container'>

          <section className='work-page-hero-section'>
            <Reveal as="p" className='work-hero-label'>Work</Reveal>
            <Reveal as="h1" className='work-hero-title' delay={80}>Recent work</Reveal>
            <Reveal as="p" className='work-hero-text' delay={160}>
              A few of the products I've designed and built, from a sales team's lead tracker at Vanaways to an AI travel app during my IBM internship.
            </Reveal>
          </section>

          <section className='work-page-project-section'>
            <Reveal as="div" className='work-project-container'>
              <div className='work-project-placeholder'>
                <img
                  src={LeadTracker}
                  alt="Lead Tracker web app — UI/UX design and full-stack integration for Vanaways"
                  className='work-project-image'
                />
              </div>
              <p className='work-project-company'>Vanaways.</p>
              <p className='work-project-title'>Lead Tracker Design + Integration</p>
            </Reveal>

            <Reveal as="div" className='work-project-container' delay={80}>
              <div className='work-project-placeholder'>
                <video
                  src={IbmAnimate}
                  className='work-project-video'
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
              <p className='work-project-company'>IBM Internship</p>
              <p className='work-project-title'>AI Travel App</p>
            </Reveal>

            <Reveal as="div" className='work-project-container' delay={160}>
              <div className='work-project-placeholder'>
                <img
                  src={Rinfo}
                  alt="Rinfo RingCentral extension — UI/UX and integration work"
                  className='work-project-image'
                />
              </div>
              <p className='work-project-company'>Rinfo.</p>
              <p className='work-project-title'>Ring Central Extension</p>
            </Reveal>
          </section>

          <section className='work-project-info-section'>
            <Reveal as="p" className='section-label'>Your Project</Reveal>
            <Reveal as="p" className='section-value' delay={80}>
              Want something like this for your business? I'll design your new homepage for free, so you can see it before you commit.
            </Reveal>
            <Reveal
              as="span"
              className='block-action'
              delay={160}
              onClick={() => openBooking()}
            >
              <p>Get a free mockup</p>
              <GoArrowUpRight/>
            </Reveal>
          </section>
        </div>
      </div>
    </>
  )
}