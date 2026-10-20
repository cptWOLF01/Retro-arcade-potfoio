/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0b1020',
        electric: '#2bb5ff',
        hot: '#ff3d8b',
        tangerine: '#ff9f5a',
        cream: '#fff4d6',
        cab: '#ff8cc0',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
}
