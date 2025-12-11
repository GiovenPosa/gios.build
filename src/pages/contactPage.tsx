import './page-styles/contactPage.css';
import { SiGithub } from "react-icons/si";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

export function ContactPage() {

  // Schema Markup for Contact Page
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact — gios.build",
    "url": "https://www.gios.build/contact",
    "description": "Reach out to gios.build to explore your next website, redesign, or digital product project.",
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
        "https://www.linkedin.com/in/gio-posa-200541240",
        "https://www.instagram.com/YOUR_HANDLE"
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
        <title>Contact — gios.build | Start Your Next Web or Digital Project</title>

        <meta
          name="description"
          content="Reach out to gios.build to explore your next website, redesign, or digital product experience. Let's build something intentional, modern, and high-impact together."
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
              Planning a new website, a redesign, or a digital experience that feels modern and intentional?
              Let’s start a conversation.
            </p>

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
                href="https://www.instagram.com/YOUR_HANDLE"
                target="_blank"
                rel="noopener noreferrer"
                className='contact-link'
              >
                <FaInstagram />
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
          </section>

        </div>
      </div>
    </>
  );
}