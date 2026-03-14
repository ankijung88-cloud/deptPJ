/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dancheong-red': '#A12D27',
                'dancheong-vibrant-red': '#C0392B',
                'dancheong-green': '#4F6D5B',
                'dancheong-vibrant-green': '#5BB085',
                'dancheong-teal': '#5BB085',
                'dancheong-vibrant-teal': '#00A0E9',
                'dancheong-blue': '#7BA6C9',
                'dancheong-vibrant-blue': '#00479E',
                'dancheong-yellow': '#DAA520',
                'dancheong-vibrant-yellow': '#FFF100',
                'dancheong-gold': '#D4AF37',
                'dancheong-white': '#F5F5DC', // Oksun (Off-white)
                'dancheong-deep-bg': '#2D3D36', // Deep Noirok
                'dancheong-deep-red': '#7A221E',
                'dancheong-deep-green': '#1E2924',
                'dancheong-border': 'rgba(212, 175, 55, 0.2)',
                'dancheong-border-vibrant': '#D4AF37',
                // Neo-Dancheong Cyber Palette
                'cyber-pine': '#1A2420',
                'cyber-red': '#FF3B30',
                'cyber-gold': '#FFD700',
                'cyber-mint': '#00FFC2',
                'joseon-6f': {
                    'bg': '#7A221E',
                    'accent': '#D4AF37',
                    'highlight': '#FF3B30',
                },
                'joseon-5f': {
                    'bg': '#1A2944',
                    'accent': '#5D3FD3',
                    'highlight': '#E0F7FA',
                },
                'joseon-4f': {
                    'bg': '#2C2C2C',
                    'accent': '#4F6D5B',
                    'highlight': '#F5F5DC',
                },
                'joseon-3f': {
                    'bg': '#003153',
                    'accent': '#4A90E2',
                    'highlight': '#C0C0C0',
                },
                'joseon-2f': {
                    'bg': '#1E2D2F',
                    'accent': '#00FFC2',
                    'highlight': '#00A0E9',
                },
                'joseon-1f': {
                    'bg': '#A0522D',
                    'accent': '#3D2B1F',
                    'highlight': '#FF8C00',
                },
                // Expanded Joseon Dynamic Palettes (v1 - v18)
                'joseon-v1': { bg: '#4A0404', accent: '#D4AF37', highlight: '#FF3131' }, // Royal Red & Gold
                'joseon-v2': { bg: '#0F172A', accent: '#38BDF8', highlight: '#F0F9FF' }, // Midnight Indigo
                'joseon-v3': { bg: '#1E3A2F', accent: '#10B981', highlight: '#ECFDF5' }, // Deep Forest
                'joseon-v4': { bg: '#312E81', accent: '#818CF8', highlight: '#EEF2FF' }, // Royal Purple
                'joseon-v5': { bg: '#451A03', accent: '#F59E0B', highlight: '#FFF7ED' }, // Earth Umber
                'joseon-v6': { bg: '#171717', accent: '#A3A3A3', highlight: '#FAFAFA' }, // Charcoal Ink
                'joseon-v7': { bg: '#164E63', accent: '#22D3EE', highlight: '#ECFEFF' }, // Ocean Teal
                'joseon-v8': { bg: '#701A75', accent: '#E879F9', highlight: '#FDF4FF' }, // Orchid Plum
                'joseon-v9': { bg: '#064E3B', accent: '#34D399', highlight: '#ECFDF5' }, // Jade Scholar
                'joseon-v10': { bg: '#7C2D12', accent: '#FB923C', highlight: '#FFF7ED' }, // Sunset Copper
                'joseon-v11': { bg: '#1E1B4B', accent: '#6366F1', highlight: '#EEF2FF' }, // Night Sky
                'joseon-v12': { bg: '#3F6212', accent: '#A3E635', highlight: '#F7FEE7' }, // Bamboo Leaf
                'joseon-v13': { bg: '#831843', accent: '#F472B6', highlight: '#FDF2F8' }, // Safflower Pink
                'joseon-v14': { bg: '#0C4A6E', accent: '#38BDF8', highlight: '#F0F9FF' }, // Deep Sea
                'joseon-v15': { bg: '#422006', accent: '#D97706', highlight: '#FFFBEB' }, // Ancient Bronze
                'joseon-v16': { bg: '#2D064A', accent: '#A855F7', highlight: '#FAF5FF' }, // Mystical Violet
                'joseon-v17': { bg: '#065F46', accent: '#2DD4BF', highlight: '#F0FDFA' }, // Mountain Stream
                'joseon-v18': { bg: '#543310', accent: '#8B4513', highlight: '#F5F5DC' }, // Traditional Clay
            },
            backgroundImage: {
                'dancheong-gradient-multi': 'linear-gradient(to right, #A12D27, #36B37E, #F5A623, #4A90E2, #A12D27)',
            },
            fontFamily: {
                sans: ['"Pretendard"', '"Noto Sans KR"', 'sans-serif'],
                serif: ['"Hahmlet"', '"Noto Serif KR"', 'serif'],
            },
        },
    },
    plugins: [],
}
