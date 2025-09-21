/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel color palette
        'pastel': {
          'blue': '#E1F5FE',
          'green': '#E8F5E8',
          'yellow': '#FFF8E1',
          'pink': '#FCE4EC',
          'purple': '#F3E5F5',
          'orange': '#FFF3E0',
          'mint': '#E0F2F1',
          'lavender': '#F1F0FF',
        },
        'soft': {
          'blue': '#B3E5FC',
          'green': '#C8E6C9',
          'yellow': '#FFECB3',
          'pink': '#F8BBD9',
          'purple': '#E1BEE7',
          'orange': '#FFCC80',
          'mint': '#B2DFDB',
          'lavender': '#C5CAE9',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
