/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        arena: {
          night: '#0a0d24',
          deep: '#121037',
          panel: '#1a1745',
          panel2: '#221c58',
          edge: '#3b2f7a',
        },
        electric: {
          blue: '#3b82f6',
          cyan: '#22d3ee',
          lime: '#a3e635',
          gold: '#fbbf24',
          orange: '#fb923c',
          pink: '#f472b6',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        game: '1.5rem',
      },
      boxShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.35)',
        glowGold: '0 0 24px rgba(251, 191, 36, 0.45)',
        panel: '0 18px 40px -18px rgba(0, 0, 0, 0.85)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
