/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        breathe: 'breathe 3s infinite',
        'dice-bounce': 'dice-bounce 0.375s infinite',
        'dice-spin': 'dice-spin 0.375s linear infinite',
        'piece-spin': 'piece-spin 5s linear infinite',
        'fade-in-out': 'fade-in-out 0.7s',
        'knockout-flare': 'knockout-flare 2.1s',
      },
      keyframes: {
        breathe: {
          '0%, 100%': {
            transform: 'scale(1, 1)',
            animationTimingFunction: 'cubic-bezier(0.5, 1, 0.89, 1)',
          },
          '50%': {
            transform: 'scale(0.975, 0.95)',
            animationTimingFunction: 'cubic-bezier(0.11, 0, 0.5, 0)',
          },
        },
        'dice-bounce': {
          '0%, 100%': {
            transform: 'none',
            animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
          },
          '50%': {
            transform: 'translateY(-100%)',
            animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
          },
        },
        'dice-spin': {
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'piece-spin': {
          to: {
            transform: 'rotate3d(0,1,0,360deg)',
          },
        },
        'fade-in-out': {
          '10%': {
            opacity: '1',
          },
          '0%, 100%': {
            opacity: '0',
          },
        },
        'knockout-flare': {
          '15%, 40%': {
            opacity: '1',
          },
          '0%, 100%': {
            opacity: '0',
          },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
