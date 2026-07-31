/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NeedLink Design System
        nl: {
          // Auth画面を基準にしたトークン
          bg: '#FAF7F2',
          card: '#FFFFFF',
          primary: {
            DEFAULT: '#D97706',
            hover: '#B45309',
            soft: 'rgba(217, 119, 6, 0.12)',
          },
          text: '#1F2937',
          muted: '#57534E',
          border: '#D1D5DB',
          'card-border': '#E5E0D8',
          beige: '#EFEBE4',
        },
        // Legacy palette（既存画面との互換用）
        cream: {
          50:  '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5F0E8',
          300: '#EDE4D8',
          400: '#E0D4C4',
          500: '#C9B99E',
        },
        warm: {
          50:  '#FDF8F2',
          100: '#F7EEE2',
          200: '#EDD8BE',
          300: '#DDB98F',
          400: '#C8935A',
          500: '#B8743A',
          600: '#9A5E2E',
          700: '#7A4924',
        },
        ink: {
          50:  '#F8F5F3',
          100: '#EDE6E0',
          200: '#D4C8BE',
          300: '#B09080',
          400: '#8B6B5A',
          500: '#6B4E3D',
          600: '#4E3628',
          700: '#2C2018',
          800: '#1A1210',
          900: '#0F0A08',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'nl-input': '14px',
        'nl-card': '20px',
      },
      boxShadow: {
        soft: '0 2px 12px 0 rgba(44, 32, 24, 0.06)',
        card: '0 4px 24px 0 rgba(44, 32, 24, 0.08)',
        hover: '0 8px 32px 0 rgba(44, 32, 24, 0.12)',
        'nl-card': '0 8px 30px rgba(0, 0, 0, 0.05)',
        'nl-focus': '0 0 0 3px rgba(217, 119, 6, 0.12)',
        'nl-btn': '0 8px 20px rgba(217, 119, 6, 0.35)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}
