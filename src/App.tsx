import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import { lazy, Suspense } from 'react';

import FloorContentPage from './pages/FloorContentPage';
import SubCategoryPage from './pages/SubCategoryPage';
import AboutPage from './pages/AboutPage';

import InspirationPage from './pages/InspirationPage';
const DetailPage = lazy(() => import('./pages/DetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const VirtualMuseumPage = lazy(() => import('./templates/VirtualMuseumPage'));
const VirtualStorePage = lazy(() => import('./templates/VirtualStorePage'));
const VirtualCinemaPage = lazy(() => import('./templates/VirtualCinemaPage'));
const VirtualTicketPage = lazy(() => import('./templates/VirtualTicketPage'));
const VirtualInquiryPage = lazy(() => import('./templates/VirtualInquiryPage'));
const VirtualReservationPage = lazy(() => import('./templates/VirtualReservationPage'));
const AgencyRegisterPage = lazy(() => import('./pages/AgencyRegisterPage'));
import NoticePage from './pages/NoticePage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SearchPage from './pages/SearchPage';
import { FloorProvider } from './context/FloorContext';
import { CartProvider } from './context/CartContext';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <FloorProvider>
                <CartProvider>
                    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white/20">Loading...</div>}>
                    <Routes>

                    {/* Public Store Routes */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/inspiration" element={<InspirationPage />} />
                        <Route path="/detail/:id" element={<DetailPage />} />
                        <Route path="/floor/:id/articles" element={<FloorContentPage />} />
                        <Route path="/category/:subId" element={<SubCategoryPage />} />
                        <Route path="/notice" element={<NoticePage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route path="/register" element={<AgencyRegisterPage />} />
                        <Route path="/detail/:id/museum" element={<VirtualMuseumPage />} />
                        <Route path="/detail/:id/store" element={<VirtualStorePage />} />
                        <Route path="/detail/:id/cinema" element={<VirtualCinemaPage />} />
                        <Route path="/detail/:id/ticket" element={<VirtualTicketPage />} />
                        <Route path="/detail/:id/inquiry" element={<VirtualInquiryPage />} />
                        <Route path="/detail/:id/reservation" element={<VirtualReservationPage />} />
                    </Route>

                    {/* Presentation Pages (No Layout/Navbar) */}
                    <Route path="/about" element={<AboutPage />} />
                </Routes>
                    </Suspense>
                </CartProvider>
            </FloorProvider>
        </Router>
    );
}

export default App;
