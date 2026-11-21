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
      borderRadius: {
        none: '0px',
        sm: '4px',
        DEFAULT: '6px',
        md: '6px', // buttons and inputs standardized to 6px
        lg: '8px', // cards and modals standardized to 8px
        xl: '10px',
        '2xl': '12px',
        full: '9999px',
      },
      colors: {
        body: 'var(--bg-body)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-surface-elevated)',
        nav: 'var(--bg-nav)',
        sidebar: 'var(--bg-sidebar)',
        brand: {
          DEFAULT: 'var(--brand-primary)',
          hover: 'var(--brand-hover)',
          light: '#9EAA23',
          dark: '#5C640E',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
        },
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        'on-brand': 'var(--text-on-brand)',
        thunder: {
          navy: "#1E1B4B",
          dark: "#1C1B1F",
          gold: "#859114",
          yellow: "#9EAA23",
          olive: "#859114",
          oliveDark: "#6F7910",
          lavender: "#BEB9C7",
          lavenderLight: "#CBC6D3",
          lavenderElevated: "#D5D1DC",
          border: "#9E98A8",
        },
      },
    },
  },
  plugins: [],
};
