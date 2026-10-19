import './page-styles/notFoundPage.css';
import { GoArrowUpRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SectionBar } from '../components/sectionBar';
import { Reveal } from '../components/reveal';

// A page that doesn't exist: the site's section bar and poster headline,
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
          <SectionBar label='404' className='not-found-bar'>
            <span>Page not found</span>
          </SectionBar>

          <div className='not-found-content'>
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
