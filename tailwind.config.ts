import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 40px rgba(99, 102, 241, 0.18)',
        panel: '0 18px 60px rgba(2, 6, 23, 0.45)',
      },
      backgroundImage: {
        'radial-dashboard': 'radial-gradient(circle at top left, rgba(99,102,241,0.20), transparent 38%), radial-gradient(circle at top right, rgba(14,165,233,0.12), transparent 32%)',
      },
    },
  },
  plugins: [],
}

export default config
