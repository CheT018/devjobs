import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { PageLoader } from './components/PageLoader'

const HomePage = lazy(() => import('./pages/Home'))
const SearchPage = lazy(() => import('./pages/Search'))
const DetailPage = lazy(() => import('./pages/Detail'))
const SavedPage = lazy(() => import('./pages/Saved'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <>
      <Header />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/job/:id" element={<DetailPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  )
}
