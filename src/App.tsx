import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Footer } from './components/footer'
import { TopHeader } from './components/topHeader'
import { HomePage } from './pages/homePage'
import { WorkPage } from './pages/workPage'
import { ScrollToTop } from './components/scrollToTop'
// The previous Packages page is kept in ./pages/packagesPage; to bring it
// back, import { PackagesPage } from there and use it on the route below.
import { PricingPage } from './pages/pricingPage'
import { PrivacyPage } from './pages/privacyPage'
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
              {/* the About page became the home page's My Story section */}
              <Route path="/about" element={<Navigate to="/#story" replace />} />
              {/* the Contact page became the footer */}
              <Route path="/contact" element={<Navigate to="/#contact" replace />} />
              <Route path="/packages" element={<PricingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
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