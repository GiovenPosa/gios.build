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
const AuditPage = lazy(() => import('./pages/auditPage').then((m) => ({ default: m.AuditPage })))
const IndustryPage = lazy(() => import('./pages/industryPage').then((m) => ({ default: m.IndustryPage })))
const AreaPage = lazy(() => import('./pages/areaPage').then((m) => ({ default: m.AreaPage })))
const NotFoundPage = lazy(() => import('./pages/notFoundPage').then((m) => ({ default: m.NotFoundPage })))
import { BookingProvider } from './context/bookingContext'
import { BookingForm } from './components/bookingForm'
import { AREAS } from './data/areas'
import { INDUSTRIES } from './data/industries'

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
              {/* /work/kape-coffee and the rest: the Work page with that
                  project's larger view open (one route, so moving between
                  them never reloads the page) */}
              <Route path="/work/:slug?" element={<WorkPage />} />
              {/* the About page became the home page's My Story section */}
              <Route path="/about" element={<Navigate to="/#story" replace />} />
              {/* the Contact page became the footer */}
              <Route path="/contact" element={<Navigate to="/#contact" replace />} />
              <Route path="/packages" element={<PricingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/ui" element={<UiPage />} />
              {/* the free website audit (docs/website-audit/spec.md) */}
              <Route path="/website-audit" element={<AuditPage />} />
              {/* a page per town (data/areas.ts) */}
              {AREAS.map((area) => (
                <Route key={area.path} path={area.path} element={<AreaPage area={area} />} />
              ))}
              {/* a page per kind of business (data/industries.ts) */}
              {INDUSTRIES.map((industry) => (
                <Route key={industry.path} path={industry.path} element={<IndustryPage industry={industry} />} />
              ))}
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