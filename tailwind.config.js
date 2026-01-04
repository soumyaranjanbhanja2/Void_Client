/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f18',
        bg2: '#0f1626',
        text: '#e6edf3',
        muted: '#a0acb8',
        primary: '#4c8cff',
        primary2: '#7aa2ff',
        danger: '#ff4d4f',
        success: '#2ecc71',
        warning: '#f6c343'
      },
      boxShadow: {
        maang: '0 20px 40px rgba(0,0,0,0.35)',
        glow: '0 10px 24px rgba(76,140,255,0.35)'
      },
      borderRadius: { xl2: '16px' },
      keyframes: {
      slideUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    },
    animation: {
      slideUp: 'slideUp 0.6s ease-out forwards',
      fadeIn: 'fadeIn 0.8s ease-out forwards',
    }
    }
  },
  plugins: []
};