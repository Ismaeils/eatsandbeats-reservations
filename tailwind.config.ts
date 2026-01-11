import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'serif'],
      },
      colors: {
        brand: {
          dark: '#1f1f1d',
          primary: '#706459',
          secondary: '#958d84',
          accent: '#b2a798',
          light: '#e0e1dd',
        },
        surface: {
          app: '#e0e1dd',
          nav: '#1f1f1d',
          card: '#ffffff',
          hover: '#f5f5f3',
        },
        content: {
          primary: '#1f1f1d',
          secondary: '#706459',
          muted: '#958d84',
        },
        state: {
          success: '#5a8a5a',
          warning: '#b8963d',
          error: '#a34a3a',
          info: '#6a7d91',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
