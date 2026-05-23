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
        cyan: {
          neon: '#00f5ff',
          dim: '#00bcd4',
        },
        red: {
          neon: '#ff1744',
          dim: '#d50000',
        },
      },
      fontFamily: {
        mono: ['Space Mono', 'monospace'],
        main: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
