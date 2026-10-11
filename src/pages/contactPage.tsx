import './page-styles/contactPage.css';
import { SiGithub } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { GoArrowUpRight } from "react-icons/go";
import { useBooking } from "../context/bookingContext";
import { Reveal } from "../components/reveal";

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
            <Reveal as="p" className='contact-label'>Contact</Reveal>

            <Reveal as="p" className='contact-title' delay={60}>Get in touch</Reveal>

            <Reveal as="p" className='contact-text' delay={120}>
              Need a new website, or a refresh of the one you've got? Tell me about your business and I'll get back to you within 24 hours.
            </Reveal>

            <Reveal as="span" className='contact-cta' delay={180} onClick={() => openBooking()}>
              <p>Get a free mockup</p>
              <GoArrowUpRight/>
            </Reveal>

            <Reveal as="p" className='contact-p'>Email</Reveal>
            <Reveal as="a" href='mailto:contact@gios.build' className='contact-email' delay={60}>
              contact@gios.build
            </Reveal>

            <Reveal as="p" className='contact-p'>Connect</Reveal>
            <div className='contact-social'>
              <Reveal
                as="a"
                href="https://www.linkedin.com/in/gio-posa-200541240"
                target="_blank"
                rel="noopener noreferrer"
                className='contact-link'
              >
                <FaLinkedinIn />
              </Reveal>

              <Reveal
                as="a"
                href="https://github.com/GiovenPosa"
                target="_blank"
                rel="noopener noreferrer"
                className='contact-link'
                delay={80}
              >
                <SiGithub />
              </Reveal>
            </div>

            <Reveal as="p" className='contact-p'>Based in</Reveal>
            <Reveal as="p" className='contact-email' delay={60}>Bath, UK. Working with businesses across the UK.</Reveal>
          </section>

        </div>
      </div>
    </>
  );
}