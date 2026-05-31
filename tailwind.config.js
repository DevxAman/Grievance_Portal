/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontSize: {
        'xxs': '0.625rem', // 10px
        'xs': '0.75rem',   // 12px
        'sm': '0.875rem',  // 14px
        'base': '1rem',    // 16px
        'lg': '1.125rem',  // 18px
        'xl': '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      keyframes: {
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(100%)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'fade-out-right': {
          '0%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(100%)'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          }
        },
        'fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          }
        }
      },
      animation: {
        'fade-in-right': 'fade-in-right 0.4s ease-out',
        'fade-out-right': 'fade-out-right 0.4s ease-in forwards',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-in forwards'
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
      maxWidth: {
        'xxs': '16rem',
        'xxxs': '12rem',
      },
      minHeight: {
        'card': '8rem',
        'card-sm': '6rem',
      }
    },
  },
  plugins: [],
};
