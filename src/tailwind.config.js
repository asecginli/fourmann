/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#0d6efd',
        'primary-dark': '#0b5ed7',
        body: '#212529',
        'body-bg': '#f8f9fa',
        border: '#dee2e6'
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            width: '100%',
            color: '#212529',
            h1: {
              color: '#212529',
              fontWeight: '700'
            },
            h2: {
              color: '#212529',
              fontWeight: '700'
            },
            h3: {
              color: '#212529',
              fontWeight: '700'
            },
            blockquote: {
              borderLeftColor: '#0d6efd',
              backgroundColor: '#f1f5f9',
              padding: '0.5rem 1rem',
              margin: '1rem 0'
            }
          }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}