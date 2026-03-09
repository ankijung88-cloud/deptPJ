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
