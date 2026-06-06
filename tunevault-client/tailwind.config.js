/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          base: '#000000',
          card: '#121212',
          hover: '#1a1a1a',
          hover2: '#2a2a2a',
          green: '#1ed760',
          lighttext: '#b3b3b3',
        }
      }
    },
  },
  plugins: [],
}
