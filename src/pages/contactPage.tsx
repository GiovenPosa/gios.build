import './page-styles/contactPage.css';
import { SiGithub } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { GoArrowUpRight } from "react-icons/go";
import { useBooking } from "../context/bookingContext";

export function ContactPage() {
  const { openBooking } = useBooking();

  // Schema Markup for Contact Page
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact — gios.build",
    "url": "https://www.gios.build/contact",
    "description": "Get in touch with Gio Posa at gios.build about a new website or a redesign for your business.",
    "isPartOf": {
      "@type": "WebSite",
      "name": "gios.build",
      "url": "https://www.gios.build"
    },
    "about": {
      "@type": "Organization",
      "name": "gios.build",
      "url": "https://www.gios.build",
      "email": "contact@gios.build",
      "sameAs": [
        "https://github.com/GiovenPosa",
        "https://www.linkedin.com/in/gio-posa-200541240"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "enquiries",
        "email": "contact@gios.build"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact — gios.build | Get a Website for Your Business</title>

        <meta
          name="description"
          content="Need a new website or a redesign? Get in touch with Gio, a web designer in Bath working with small businesses across the UK. Replies within 24 hours."
        />

        <meta
          name="keywords"
          content="contact gios.build, web design enquiries, start a web project, ui ux design enquiry, website redesign enquiry, digital product contact"
        />

        <link rel="canonical" href="https://www.gios.build/contact" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify(contactSchema)}
        </script>
      </Helmet>

      <div className='contact-page'>
        <div className='contact-page-container'>
          
          <section className='contact-page-section'>
            <p className='contact-label'>Contact</p>

            <p className='contact-title'>Get in touch</p>

            <p className='contact-text'>
              Need a new website, or a refresh of the one you've got? Tell me about your business and I'll get back to you within 24 hours.
            </p>

            <span className='contact-cta' onClick={() => openBooking()}>
              <p>Get a free mockup</p>
              <GoArrowUpRight/>
            </span>

            <p className='contact-p'>Email</p>
            <a href='mailto:contact@gios.build' className='contact-email'>
              contact@gios.build
            </a>

            <p className='contact-p'>Connect</p>
            <div className='contact-social'>
              <a 
                href="https://www.linkedin.com/in/gio-posa-200541240"
                target="_blank"
                rel="noopener noreferrer"
                className='contact-link'
              >
                <FaLinkedinIn />
              </a>  

              <a 
                href="https://github.com/GiovenPosa"
                target="_blank"
                rel="noopener noreferrer"
                className='contact-link'
              >
                <SiGithub />
              </a>  
            </div>

            <p className='contact-p'>Based in</p>
            <p className='contact-email'>Bath, UK. Working with businesses across the UK.</p>
          </section>

        </div>
      </div>
    </>
  );
}