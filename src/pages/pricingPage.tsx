import './page-styles/pricingPage.css';
import { GoArrowUpRight } from 'react-icons/go';
import { Helmet } from 'react-helmet-async';
import { useBooking } from '../context/bookingContext';
import { Reveal } from '../components/reveal';
import { PackageStack } from '../components/packageStack';
import { QuoteBuilder } from '../components/quoteBuilder';
import { HostingArt } from '../components/serviceArt/hostingArt';
import { FaqThread } from '../components/faqThread';
import { ClosingCta } from '../components/closingCta';

// The Packages page in the new design language: a poster hero, the packages
// as a price list, the quote builder, hosting & care, the FAQ thread and the
// closing call to action. (The previous page is kept in packagesPage.tsx;
// point the /packages route back at it to restore it.)
export function PricingPage() {
  const { openBooking } = useBooking();

  return (
    <>
      <Helmet>
        <title>Website Packages & Pricing for Small Businesses | gios.build</title>

        <meta
          name="description"
          content="Clear website pricing for small businesses: starter sites from £500, redesigns from £800 and growth websites from £1,500. Every project starts with a free homepage mockup."
        />

        <meta
          name="keywords"
          content="web design packages, website pricing uk, small business website, website redesign, lead generation website, web design services, landing page design, gios.build"
        />

        <link rel="canonical" href="https://www.gios.build/packages" />
      </Helmet>

      <div className='pricing-page'>
        <div className='pricing-page-container'>
          <section className='pricing-hero'>
            <Reveal as="h1" className='pricing-hero-title'>
              <span>Agency quality.</span> <span>Small business prices.</span>
            </Reveal>
            <Reveal as="p" className='pricing-hero-sub' delay={80}>
              Every project starts with a free homepage mockup, so you see it before you spend a penny.
            </Reveal>
          </section>

          <PackageStack />

          <div className='pricing-quote'>
            <QuoteBuilder />
          </div>

          {/* hosting & care: one monthly line with the status-bar graphic */}
          <Reveal as="section" className='pricing-care' aria-labelledby='care-title'>
            <span className='pricing-care-slot' aria-hidden>
              <HostingArt active />
            </span>
            <div className='pricing-care-copy'>
              <h2 id='care-title'>Hosting & Care</h2>
              <p>Your site shouldn't need you to think about it again. I host it, back it up and keep it running, for one simple monthly fee.</p>
            </div>
            <button
              type='button'
              className='hero-action-button secondary pricing-care-button'
              onClick={() => openBooking('not-sure', "I'd like to ask about hosting & care.")}
            >
              <p>Ask about care</p>
              <GoArrowUpRight aria-hidden />
            </button>
          </Reveal>

          <section className='home-faq-block pricing-faq'>
            <Reveal as="p" className='home-faq-headline'>
              <span>Questions?</span> <span>Just ask.</span>
            </Reveal>
            <Reveal as="p" className='home-faq-subtext' delay={60}>
              The things people usually want to know before we start.
            </Reveal>
            <FaqThread />
          </section>

          <ClosingCta />
        </div>
      </div>
    </>
  );
}
