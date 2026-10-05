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

const faqData = [
  {
    question: 'How long does it take?',
    answer: "A simple website is usually live in about 4 weeks. Bigger or more bespoke sites take longer, and you'll get a timeline with your quote."
  },
  {
    question: 'What do I need to provide?',
    answer: "The basics about your business, your logo if you have one, and any photos you'd like to use. If you're stuck on wording, I'll help you shape it."
  },
  {
    question: 'How many revisions do I get?',
    answer: "It depends on how bespoke the project is, so we agree it upfront in your quote. The free mockup means we're aligned on the direction before the build starts."
  },
  {
    question: 'Can you handle hosting and my domain?',
    answer: 'Yes. Hosting and domain setup can be included. The cost depends on what your site needs, and I\'ll include it in your quote.'
  },
  {
    question: 'What happens after launch?',
    answer: "You can take it from there, or I can look after it with a monthly maintenance plan covering updates, backups and small changes."
  },
  {
    question: 'Is the mockup really free?',
    answer: 'Yes, with no obligation. If you love it, we build the full site. If not, no hard feelings.'
  },
];

export function PackagesPage() {
  const { openBooking } = useBooking();

  return (
    <>
      <Helmet>
        <title>Website Packages & Pricing for Small Businesses — gios.build</title>

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
            <p className='packages-hero-label'>Packages</p>
            <h1 className='packages-hero-title'>
              Simple, honest pricing
            </h1>
            <p className='packages-hero-text'>
              Clear starting prices for small businesses. Every project starts with a free homepage mockup, so you see the direction before you spend a penny.
            </p>
          </section>

          <section className='packages-card-wrapper'>
            <div className='packages-card'>
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
                <span className='package-card-button' onClick={() => openBooking('starter')}>
                  <p>Choose Starter</p>
                  <GoArrowUpRight/>
                </span>
              </div>
            </div>

            <div className='packages-card'>
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
                <span className='package-card-button' onClick={() => openBooking('redesign')}>
                  <p>Choose Redesign</p>
                  <GoArrowUpRight/>
                </span>
              </div>
            </div>

            <div className='packages-card'>
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
                <span className='package-card-button' onClick={() => openBooking('lead-system')}>
                  <p>Choose Growth</p>
                  <GoArrowUpRight/>
                </span>
              </div>
            </div>
          </section>

          <div className='packages-note-block'>
            <p className='packages-note'>Exact price depends on pages, features, and content.</p>
            <p>→ A clear quote within 24 hours</p>
            <p>→ A free homepage mockup before you commit</p>
            <div className='package-card-action'>
              <span className='package-card-button' onClick={() => openBooking('not-sure')}>
                <p>Not sure? Get a quote</p>
                <GoArrowUpRight/>
              </span>
            </div>
          </div>

          <section className='package-info-section'>
            <p className='section-label'>Free Mockup</p>
            <p className='section-value'>
              Most people can't picture a new website until they see it. Tell me about your business and I'll design your new homepage for free. If you love it, we build the full site.
            </p>
            <span className='block-action' onClick={() => openBooking()}>
              <p>Request Free Mockup</p>
              <GoArrowUpRight/>
            </span>
          </section>

          <section className='package-info-section'>
            <p className='section-label'>Hosting & Care</p>
            <p className='section-value'>
              I can host your site and look after your domain, priced to what your site needs. After launch, a monthly maintenance plan keeps it secure, backed up and up to date.
            </p>
            <span className='block-action' onClick={() => openBooking('not-sure')}>
              <p>Ask About Care</p>
              <GoArrowUpRight/>
            </span>
          </section>

          <section className='package-faq-section'>
            <p className='section-label'>FAQ</p>
            <div className='package-faq-list'>
              {faqData.map((faq) => (
                <div key={faq.question} className='package-faq-item'>
                  <h3 className='faq-question'>{faq.question}</h3>
                  <p className='faq-answer'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}