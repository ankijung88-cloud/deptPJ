/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                charcoal: '#333333',
                cream: '#F5F5F5',
                'dancheong': {
                    red: '#C62828', // Standard Dancheong Red
                    green: '#00695C', // Standard Dancheong Green
                    blue: '#1A237E',
                    yellow: '#FBC02D',
                }
            },
            fontFamily: {
                sans: ['"Pretendard"', '"Noto Sans KR"', 'sans-serif'],
                serif: ['"Noto Serif KR"', 'serif'],
            },
        },
    },
    plugins: [],
}
