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
        // GYG palette
        'gyg-navy': '#000C3B',
        'gyg-blue': '#0071EB',
        'gyg-text': '#1A1A1A',
        'gyg-muted': '#6B7280',
        'gyg-border': '#E5E7EB',
        'gyg-bg': '#F9FAFB',
        'gyg-light': '#F3F4F6',
        // Legacy Angkor palette (kept for compatibility)
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
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'hover': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'soft': '0 2px 12px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
