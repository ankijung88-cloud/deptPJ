import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import DetailPage from './pages/DetailPage';


import FloorContentPage from './pages/FloorContentPage';
import SubCategoryPage from './pages/SubCategoryPage';
import AboutPage from './pages/AboutPage';

import InspirationPage from './pages/InspirationPage';
import NoticePage from './pages/NoticePage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                </Route>
                {/* Presentation Pages (No Layout/Navbar) */}
                <Route path="/about" element={<AboutPage />} />
            </Routes>
        </Router>
    );
}

export default App;
