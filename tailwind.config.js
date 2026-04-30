/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E50914",
        accent: "#FFD700",
        dark: "#0F0F0F",
        card: "#1A1A1A",
        text: {
            light: "#FFFFFF",
            muted: "#A0A0A0"
        },
        seat: {
            available: "#4B5563",
            selected: "#E50914",
            taken: "#111827"
        }
      },
      animation: {
        'zoom-in': 'zoomIn 0.2s ease-in-out',
      },
      keyframes: {
        zoomIn: {
            '0%': { transform: 'scale(1)' },
            '100%': { transform: 'scale(1.05)' }
        }
      }
    },
  },
  plugins: [],
}