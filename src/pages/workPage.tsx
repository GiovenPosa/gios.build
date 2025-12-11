import './page-styles/workPage.css';
import LeadTracker from '../assets/project-images/lead-tracker.png';
import IbmAnimate from '../assets/project-images/IbmAnimate.mov';
import Rinfo from '../assets/project-images/rinfo-image-placeholder.png';
import { GoArrowUpRight } from "react-icons/go";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export function WorkPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Work — gios.build | Web Design, UI/UX & Software Engineering Projects</title>

        <meta
          name="description"
          content="Explore selected projects by gios.build — including UI/UX design, frontend engineering, backend systems, and digital product development for brands like Vanaways, IBM, and Rinfo."
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
            <p className='work-hero-label'>Work</p>
            <h1 className='work-hero-title'>Designing Success</h1>
            <p className='work-hero-text'>
              Great digital experiences blend many disciplines. I bring all of them together into one clean, consistent vision.
            </p>
          </section>

          <section className='work-page-project-section'>
            <div className='work-project-container'>
              <div className='work-project-placeholder'>                
                <img
                  src={LeadTracker}
                  alt="Lead Tracker web app — UI/UX design and full-stack integration for Vanaways"
                  className='work-project-image'
                />
                <span className='project-button'>
                  <GoArrowUpRight />
                </span>
              </div>
              <p className='work-project-company'>Vanaways.</p>
              <p className='work-project-title'>Lead Tracker Design + Integration</p>
            </div>

            <div className='work-project-container'>
              <div className='work-project-placeholder'>
                <video 
                  src={IbmAnimate}
                  className='work-project-video'
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                />
                <span className='project-button'>
                  <GoArrowUpRight />
                </span>
              </div>
              <p className='work-project-company'>IBM</p>
              <p className='work-project-title'>AI Travel App</p>
            </div>

            <div className='work-project-container'>
              <div className='work-project-placeholder'>
                <img
                  src={Rinfo}
                  alt="Rinfo RingCentral extension — UI/UX and integration work"
                  className='work-project-image'
                />
                <span className='project-button'>
                  <GoArrowUpRight />
                </span>
              </div>
              <p className='work-project-company'>Rinfo.</p>
              <p className='work-project-title'>Ring Central Extension</p>
            </div>

            <div className='work-project-container'>
              <div className='work-project-placeholder'>
                {/* No image for this one yet */}
                <span className='project-button'>
                  <GoArrowUpRight />
                </span>
              </div>
              <p className='work-project-company'>Contact Journey.</p>
              <p className='work-project-title'>DotDigital Extension</p>
            </div>
          </section>

          <section className='work-project-info-section'>
            <p className='section-label'>My Story</p>
            <p className='section-value'>
              Fast, flexible, and detail-obsessed. Elevate your brand's presence while your team continues shipping product.
            </p>
            <span
              className='block-action'
              onClick={() => navigate('/about')}
            >
              <p>About Me</p>
              <GoArrowUpRight/>
            </span>
          </section>
        </div>
      </div>
    </>
  )
}