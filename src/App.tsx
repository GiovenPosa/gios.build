import './App.css'
import { Routes, Route } from 'react-router-dom'
import { Footer } from './components/footer'
import { TopHeader } from './components/topHeader'
import { HomePage } from './pages/homePage'
import { WorkPage } from './pages/workPage'
import { ScrollToTop } from './components/scrollToTop'
import { AboutPage } from './pages/aboutPage'
import { ContactPage } from './pages/contactPage'
import { PackagesPage } from './pages/packagesPage'
import { NotFoundPage } from './pages/notFoundPage'
import { BookingProvider } from './context/bookingContext'
import { BookingForm } from './components/bookingForm'

function App() {
  return (
    <BookingProvider>
      <ScrollToTop />
      <div className='app-container'>
        <div className='site-content'>
          <TopHeader/>
          <div className='main-content'>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
        <Footer/>
      </div>
      <BookingForm />
    </BookingProvider>
  )
}

export default App