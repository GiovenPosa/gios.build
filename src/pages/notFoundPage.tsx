import './page-styles/notFoundPage.css';
import { GoArrowUpRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Reveal } from '../components/reveal';
import { HeroOrb } from '../components/heroOrb';

// A page that doesn't exist: the poster headline over the hero's red orb,
// and two ways back in.
export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page not found | gios.build</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className='not-found-page'>
        <div className='not-found-container'>
          <div className='not-found-content'>
            {/* the home page's ring, drawn in once the headline is up */}
            <HeroOrb play delay={300} />
            <Reveal as="h1" className='not-found-title'>
              <span>Nothing here.</span> <span>Let's get you back.</span>
            </Reveal>
            <Reveal as="p" className='not-found-message' delay={80}>
              This page doesn't exist, or it's moved. Start from the home page, or see the work.
            </Reveal>
            <Reveal as="div" className='not-found-actions' delay={160}>
              <Link to='/' className='hero-action-button'>
                <p>Back to home</p>
                <GoArrowUpRight aria-hidden />
              </Link>
              <Link to='/work' className='hero-action-button secondary'>
                <p>See my work</p>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
