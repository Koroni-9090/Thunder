/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        thunder: {
          navy: "#1E1B4B",
          dark: "#0F172A",
          gold: "#F59E0B",
          yellow: "#FBBF24",
          indigo: "#312E81",
          primary: "#4338CA",
          accent: "#7C3AED",
          surface: "#FAF9F6",
        },
      },
    },
  },
  plugins: [],
};