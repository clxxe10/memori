import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        track: 'var(--color-track)',
        my: 'var(--color-my)',
        'my-light': 'var(--color-my-light)',
        success: '#34C759',
        warning: '#FF9500',
        error: '#E24B4A',
      },
      borderRadius: {
        card: '18px',
        'card-lg': '20px',
        pill: '40px',
        icon: '12px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.07)',
        banner: '0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        float: '0 4px 16px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
