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
const VirtualMeetingPage = lazy(() => import('./templates/VirtualMeetingPage'));
const VirtualSindangPage = lazy(() => import('./templates/VirtualSindangPage'));
const VirtualAuditionPage = lazy(() => import('./templates/VirtualAuditionPage'));
const VirtualInterviewPage = lazy(() => import('./templates/VirtualInterviewPage'));
const VirtualSquarePage = lazy(() => import('./templates/VirtualSquarePage'));
const VirtualSajuPage = lazy(() => import('./templates/VirtualSajuPage'));

const VirtualGroupBuyPage = lazy(() => import('./templates/VirtualGroupBuyPage'));
const VirtualFundingPage = lazy(() => import('./templates/VirtualFundingPage'));
const TeamWorkspacePage = lazy(() => import('./templates/TeamWorkspacePage'));
const AgencyRegisterPage = lazy(() => import('./pages/AgencyRegisterPage'));
import NoticePage from './pages/NoticePage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SearchPage from './pages/SearchPage';
import { FloorProvider } from './context/FloorContext';
import { CartProvider } from './context/CartContext';
import { NavigationActionProvider } from './context/NavigationActionContext';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <FloorProvider>
                    <CartProvider>
                        <NavigationActionProvider>
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
                                        <Route path="/detail/:id/meeting" element={<VirtualMeetingPage />} />
                                        <Route path="/detail/:id/sindang" element={<VirtualSindangPage />} />
                                        <Route path="/detail/:id/audition" element={<VirtualAuditionPage />} />
                                        <Route path="/detail/:id/interview" element={<VirtualInterviewPage />} />
                                        <Route path="/detail/:id/square" element={<VirtualSquarePage />} />
                                        <Route path="/detail/:id/saju" element={<VirtualSajuPage />} />
                                        <Route path="/detail/:id/groupbuy" element={<VirtualGroupBuyPage />} />
                                        <Route path="/detail/:id/funding" element={<VirtualFundingPage />} />
                                        <Route path="/detail/:id/office" element={<TeamWorkspacePage />} />
                                    </Route>

                                    {/* Presentation Pages (No Layout/Navbar) */}
                                    <Route path="/about" element={<AboutPage />} />
                                </Routes>
                            </Suspense>
                        </NavigationActionProvider>
                    </CartProvider>
                </FloorProvider>
        </Router>
        </ErrorBoundary>
    );
}

export default App;
