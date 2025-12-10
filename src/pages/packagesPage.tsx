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
  IoTelescopeOutline 
} from "react-icons/io5";
import { GoArrowUpRight } from "react-icons/go";
import { useBooking } from '../context/bookingContext';

export function PackagesPage() {
  const { openBooking } = useBooking();

  return (
    <div className='packages-page'>
      <div className='packages-page-container'>
        <section className='packages-page-hero-section'>
          <p className='packages-hero-label'>Packages</p>
          <p className='packages-hero-title'>
            Built for momentum
          </p>
          <p className='packages-hero-text'>
            	Turn your website into your strongest asset. Pick a package, tell me your vision, and we'll ship something beautiful and built to grow.
          </p>
        </section>

        <section className='packages-card-wrapper'>
          <div className='packages-card'>
            <div className='packages-card-title'>
              <h2>01 Starter Website</h2>
              <p>Perfect for new businesses.</p>
              <p>£500-£800</p>
            </div>
            <div className='packages-card-content'>
              <span className='package-card-item'>
                <IoBrowsersOutline/>
                <p>1 Clean, Modern Page</p>
              </span>
              <span className='package-card-item'>
                <IoPhonePortraitOutline/>
                <p>Mobile-Friendly Design</p>
              </span>
              <span className='package-card-item'>
                <IoMailUnreadOutline/>
                <p>Built-In Contact Form</p>
              </span>
            </div>
          </div>

          <div className='packages-card'>
            <div className='packages-card-title'>
              <h2>02 Website Redesign</h2>
              <p>Fix what's outdated.</p>
              <p>£800-£1,500</p>
            </div>
            <div className='packages-card-content'>
              <span className='package-card-item'>
                <IoCheckboxOutline/>
                <p className='card-add'>Starter Website +</p>
              </span>
              <span className='package-card-item'>
                <IoFlashOutline/>
                <p>Modern, Refined Design</p>
              </span>
              <span className='package-card-item'>
                <IoPhonePortraitOutline/>
                <p>Enhanced Mobile Experience</p>
              </span>
              <span className='package-card-item'>
                <IoTrendingUp/>
                <p>Performance Upgrades</p>
              </span>
            </div>
          </div>

          <div className='packages-card'>
            <div className='packages-card-title'>
              <h2>03 Lead System</h2>
              <p>Turn visitors into customers.</p>
              <p>£1,500+</p>
            </div>
            <div className='packages-card-content'>
              <span className='package-card-item'>
                <IoCheckboxOutline/>
                <p className='card-add'>Website Redesign +</p>
              </span>
              <span className='package-card-item'>
                <IoAlbumsOutline/>
                <p>Multi-Page Experience</p>
              </span>
              <span className='package-card-item'>
                <IoCodeSlash/>
                <p>Seamless Integrations</p>
              </span>
              <span className='package-card-item'>
                <IoIdCardOutline/>
                <p>High-Intent Lead Forms</p>
              </span>
              <span className='package-card-item'>
                <IoTelescopeOutline/>
                <p>SEO Foundations</p>
              </span>
              <span className='package-card-item'>
                <IoBarChartOutline/>
                <p>Analytics & Insights</p>
              </span>
            </div>
          </div>
        </section>

        <div className='packages-note-block'>
          <p className='packages-note'>Exact price depends on pages, features, and content.</p>
          <p>→ Get a quick quote in 24 hours</p>
          <p>→ Request a free homepage mockup</p>
          <div className='package-card-action'>
            <span className='package-card-button' onClick={openBooking}>
              <p>Book a call</p>
              <GoArrowUpRight/>
            </span>
          </div>
        </div>

        <section className='package-info-section'>
          <p className='section-label'>Free Mockup</p>
          <p className='section-value'>
            Most people can't picture a redesign until they see it.
            I'll draft a fresh homepage, send you a preview, and if you love it — we build the full site.
          </p>
          <span className='block-action' onClick={openBooking}>
            <p>Request Free Mockup</p>
            <GoArrowUpRight/>
          </span>
        </section>
      </div>
    </div>
  )
}