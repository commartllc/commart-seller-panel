import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#fff5f2',
          100: '#ffe6e0',
          200: '#ffc9ba',
          300: '#ffa08a',
          400: '#ff7a5c',
          500: '#ff6b4a',
          600: '#f54d2e',
          700: '#cc3d22',
          800: '#a63219',
          900: '#872a15',
        },
        primary: {
          50: '#fff5f2',
          100: '#ffe6e0',
          200: '#ffc9ba',
          300: '#ffa08a',
          400: '#ff7a5c',
          500: '#ff6b4a',
          600: '#f54d2e',
          700: '#cc3d22',
          800: '#a63219',
          900: '#872a15',
        },
      },
      borderRadius: {
        'sm': '3px',
        DEFAULT: '4px',
        'md': '4px',
        'lg': '5px',
        'xl': '5px',
      },
    },
  },
  plugins: [],
}
export default config
