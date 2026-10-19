import './page-styles/packagesPage.css';
import { 
  IoBrowsersOutline, 
  IoPhonePortraitOutline, 
  IoMailUnreadOutline, 
  IoFlashOutline, 
  IoTrendingUp, 
  IoAlbumsOutline, 
  IoIdCardOutline, 
  IoCodeSlash, 
  IoBarChartOutline, 
  IoCheckboxOutline, 
  IoTelescopeOutline,
  IoTimeOutline,
  IoMegaphoneOutline
} from "react-icons/io5";
import { GoArrowUpRight } from "react-icons/go";
import { Helmet } from 'react-helmet-async';
import { useBooking } from '../context/bookingContext';
import { Reveal } from '../components/reveal';
import { faqData } from '../data/faq';

export function PackagesPage() {
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

      <div className='packages-page'>
        <div className='packages-page-container'>
          <section className='packages-page-hero-section'>
            <Reveal as="p" className='packages-hero-label'>Packages</Reveal>
            <Reveal as="h1" className='packages-hero-title' delay={80}>
              Simple, honest pricing
            </Reveal>
            <Reveal as="p" className='packages-hero-text' delay={160}>
              Every project starts the same way: a free mockup, so you see it before you spend a penny.
            </Reveal>
          </section>

          <section className='packages-card-wrapper'>
            <Reveal as="div" className='packages-card'>
              <div className='packages-card-title'>
                <h2>01 Starter Website</h2>
                <p>For new businesses that need to look professional online.</p>
                <p>£500-£800</p>
              </div>
              <div className='packages-card-content'>
                <span className='package-card-item'>
                  <IoBrowsersOutline/>
                  <p>One-page website</p>
                </span>
                <span className='package-card-item'>
                  <IoPhonePortraitOutline/>
                  <p>Mobile-friendly design</p>
                </span>
                <span className='package-card-item'>
                  <IoMailUnreadOutline/>
                  <p>Contact form to your inbox</p>
                </span>
                <span className='package-card-item'>
                  <IoTimeOutline/>
                  <p>Live in about 4 weeks</p>
                </span>
              </div>
              <div className='package-card-action'>
                <span className='package-card-button' onClick={() => openBooking('Old packages page', { packageId: 'starter' })}>
                  <p>Choose Starter</p>
                  <GoArrowUpRight/>
                </span>
              </div>
            </Reveal>

            <Reveal as="div" className='packages-card featured' delay={100}>
              <div className='packages-card-title'>
                <h2>02 Website Redesign</h2>
                <p>For sites that look dated or don't bring in enquiries.</p>
                <p>£800-£1,500</p>
              </div>
              <div className='packages-card-content'>
                <span className='package-card-item'>
                  <IoCheckboxOutline/>
                  <p className='card-add'>Starter Website +</p>
                </span>
                <span className='package-card-item'>
                  <IoFlashOutline/>
                  <p>Modern redesign of your site</p>
                </span>
                <span className='package-card-item'>
                  <IoTrendingUp/>
                  <p>Faster loading pages</p>
                </span>
                <span className='package-card-item'>
                  <IoMegaphoneOutline/>
                  <p>Clearer messaging that sells</p>
                </span>
                <span className='package-card-item'>
                  <IoTimeOutline/>
                  <p>Usually 4–6 weeks</p>
                </span>
              </div>
              <div className='package-card-action'>
                <span className='package-card-button' onClick={() => openBooking('Old packages page', { packageId: 'redesign' })}>
                  <p>Choose Redesign</p>
                  <GoArrowUpRight/>
                </span>
              </div>
            </Reveal>

            <Reveal as="div" className='packages-card' delay={200}>
              <div className='packages-card-title'>
                <h2>03 Growth Website</h2>
                <p>For businesses ready to make their website a source of leads.</p>
                <p>£1,500+</p>
              </div>
              <div className='packages-card-content'>
                <span className='package-card-item'>
                  <IoCheckboxOutline/>
                  <p className='card-add'>Website Redesign +</p>
                </span>
                <span className='package-card-item'>
                  <IoAlbumsOutline/>
                  <p>Multiple pages</p>
                </span>
                <span className='package-card-item'>
                  <IoCodeSlash/>
                  <p>Bookings, maps & integrations</p>
                </span>
                <span className='package-card-item'>
                  <IoIdCardOutline/>
                  <p>Enquiry forms that qualify leads</p>
                </span>
                <span className='package-card-item'>
                  <IoTelescopeOutline/>
                  <p>SEO foundations</p>
                </span>
                <span className='package-card-item'>
                  <IoBarChartOutline/>
                  <p>Analytics to see what works</p>
                </span>
                <span className='package-card-item'>
                  <IoTimeOutline/>
                  <p>Typically 6–8 weeks</p>
                </span>
              </div>
              <div className='package-card-action'>
                <span className='package-card-button' onClick={() => openBooking('Old packages page', { packageId: 'lead-system' })}>
                  <p>Choose Growth</p>
                  <GoArrowUpRight/>
                </span>
              </div>
            </Reveal>
          </section>

          <div className='packages-note-block'>
            <Reveal as="p" className='packages-note'>Exact price depends on pages, features, and content.</Reveal>
            <Reveal as="p" delay={60}>→ A clear quote within 24 hours</Reveal>
            <Reveal as="p" delay={120}>→ A free homepage mockup before you commit</Reveal>
            <div className='package-card-action'>
              <Reveal as="span" className='package-card-button' delay={180} onClick={() => openBooking('Old packages page', { packageId: 'not-sure' })}>
                <p>Not sure? Get a quote</p>
                <GoArrowUpRight/>
              </Reveal>
            </div>
          </div>

          <section className='package-info-section'>
            <Reveal as="p" className='section-label'>Free Mockup</Reveal>
            <Reveal as="p" className='section-value' delay={80}>
              You won't know if you love it until you see it. So I'll show you first. For free.
            </Reveal>
            <Reveal as="span" className='block-action' delay={160} onClick={() => openBooking('Old packages page')}>
              <p>Request Free Mockup</p>
              <GoArrowUpRight/>
            </Reveal>
          </section>

          <section className='package-info-section'>
            <Reveal as="p" className='section-label'>Hosting & Care</Reveal>
            <Reveal as="p" className='section-value' delay={80}>
              Your site shouldn't need you to think about it again. I can host it, back it up, and keep it running. One simple monthly fee.
            </Reveal>
            <Reveal as="span" className='block-action' delay={160} onClick={() => openBooking('Old packages page', { packageId: 'not-sure' })}>
              <p>Ask About Care</p>
              <GoArrowUpRight/>
            </Reveal>
          </section>

          <section className='package-faq-section'>
            <Reveal as="p" className='section-label'>FAQ</Reveal>
            <div className='package-faq-list'>
              {faqData.map((faq) => (
                <Reveal as="div" key={faq.question} className='package-faq-item'>
                  <h3 className='faq-question'>{faq.question}</h3>
                  <p className='faq-answer'>{faq.answer}</p>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}