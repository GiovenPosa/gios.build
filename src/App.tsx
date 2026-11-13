import './App.css'
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Footer } from './components/footer'
import { TopHeader } from './components/topHeader'
import { HomePage } from './pages/homePage'
import { WorkPage } from './pages/workPage'
import { ScrollToTop } from './components/scrollToTop'
// The previous Packages page is kept in ./pages/packagesPage; to bring it
// back, import { PackagesPage } from there and use it on the route below.
// the rarer pages load only when visited, keeping them out of the home page's bundle
const PricingPage = lazy(() => import('./pages/pricingPage').then((m) => ({ default: m.PricingPage })))
const PrivacyPage = lazy(() => import('./pages/privacyPage').then((m) => ({ default: m.PrivacyPage })))
const UiPage = lazy(() => import('./pages/uiPage').then((m) => ({ default: m.UiPage })))
const NotFoundPage = lazy(() => import('./pages/notFoundPage').then((m) => ({ default: m.NotFoundPage })))
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
            {/* a screen tall while a page loads, so the footer doesn't flash up */}
            <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<WorkPage />} />
              {/* the About page became the home page's My Story section */}
              <Route path="/about" element={<Navigate to="/#story" replace />} />
              {/* the Contact page became the footer */}
              <Route path="/contact" element={<Navigate to="/#contact" replace />} />
              <Route path="/packages" element={<PricingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/ui" element={<UiPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
          </div>
        </div>
        <Footer/>
      </div>
      <BookingForm />
    </BookingProvider>
  )
}

export default App