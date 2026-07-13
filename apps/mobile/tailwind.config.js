/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'angkor-orange': '#C8530A',
        'angkor-orange-dark': '#9C4108',
        'angkor-orange-light': '#F3D9C4',
        'stone-charcoal': '#2B2622',
        'stone-gray': '#6B635C',
        'sand-bg': '#FBF7F2',
        'card-white': '#FFFFFF',
        'success-green': '#2F7D4F',
        'error-red': '#B3261E',
        'khmer-gold': '#D4AF37',
      },
      fontFamily: {
        heading: ['System', 'Georgia', 'serif'],
        body: ['System', 'sans-serif'],
        khmer: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
