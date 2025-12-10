import './page-styles/contactPage.css';
import { SiGithub } from "react-icons/si";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa";

export function ContactPage() {


  return (

    <div className='contact-page'>
      <div className='contact-page-container'>
         <section className='contact-page-section'>
          <p className='contact-label'>Contact</p>
          <p className='contact-title'>
            Get in touch
          </p>
          <p className='contact-text'>
            Explore how our platform can support your goals and streamline the way you work.
          </p>

          <p className='contact-p'>Email</p>
          <a href='mailto:contact@gios.build' className='contact-email'>contact@gios.build</a>

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
              <SiGithub/>
            </a>  
            
          </div>

         
        </section>
      </div>
    </div>
  )
}