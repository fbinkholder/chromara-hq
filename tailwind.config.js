/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chromara: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          blue: '#3B82F6',
          lavender: '#C4B5FD',
          white: '#FFFFFF',
          glass: 'rgba(255, 255, 255, 0.1)',
          'glass-border': 'rgba(255, 255, 255, 0.2)',
        },
      },
      backgroundImage: {
        'chromara-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'chromara-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      borderRadius: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(139, 92, 246, 0.2)',
        'glass-hover': '0 8px 32px 0 rgba(236, 72, 153, 0.3)',
      },
    },
  },
  plugins: [],
}
