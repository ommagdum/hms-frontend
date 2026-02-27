/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep forest green from your spec
        primary: "#2C4A3E", 
        // Warm gold accent
        accent: "#C6A15B",
        // Warm off-white background
        background: "#F5F4F0",
        surface: "#E8E7E3",
        foreground: "#1A2E26",
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}