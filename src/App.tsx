import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import DetailPage from './pages/DetailPage';
// ScrollRestoration import might need react-router-dom v6 setup. Assuming v6.
// Actually ScrollRestoration component is available in v6.4+ data routers or we can implement manual scroll to top.
// For standard BrowserRouter, we can use a wrapper or the component logic.
// I'll stick to simple Routes for now.

import CategoryPage from './pages/CategoryPage';

import FloorIntroPage from './pages/FloorIntroPage';
import FloorGuidePage from './pages/FloorGuidePage';
import AboutPage from './pages/AboutPage';

import AllProductsPage from './pages/AllProductsPage';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* Public Store Routes */}
                <Route element={<Layout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/detail/:id" element={<DetailPage />} />
                    <Route path="/floor/:id" element={<FloorIntroPage />} />
                    <Route path="/floor-guide" element={<FloorGuidePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/:category" element={<CategoryPage />} />
                    <Route path="/all-products" element={<AllProductsPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
