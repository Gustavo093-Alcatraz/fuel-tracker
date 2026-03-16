/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-light': '#dcdcdc',
        'bg-dark': '#121212',
        'accent-neon': '#faff00',
        'accent-green': '#00ff41',
      },
      boxShadow: {
        'brutal-sm': '4px 4px 0px 0px var(--shadow-color)',
        'brutal': '8px 8px 0px 0px var(--shadow-color)',
        'brutal-dark': '8px 8px 0px 0px #faff00',
      },
      borderWidth: {
        'brutal': '4px',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        'brutal': 'cubic-bezier(0.17, 0.67, 0.83, 0.67)',
      },
    },
  },
  plugins: [],
}
