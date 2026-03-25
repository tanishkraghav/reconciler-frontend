/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0c0e10',
        surface: '#13161a',
        card:    '#191d22',
        border:  '#252a32',
        accent:  '#00e5a0',
        accent2: '#4d9fff',
        warn:    '#ffb830',
        danger:  '#ff5c6a',
        muted:   '#5a6270',
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
