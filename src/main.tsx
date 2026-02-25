import React from 'react'

// Suppress known Three.js deprecation warning from @react-three/fiber v8 + three v0.160.0
const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
        return;
    }
    originalWarn(...args);
};

import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'; // Import i18n configuration

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
