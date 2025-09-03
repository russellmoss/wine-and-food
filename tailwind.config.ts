import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'festival-beige': '#D8D1AE',
        'festival-dark-brown': '#5A3E00',
        'festival-light-brown': '#B39E7E',
        'festival-form-bg': '#EFE8D4',
        'festival-input-bg': '#F9F4E9',
        'festival-text': '#715100',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
