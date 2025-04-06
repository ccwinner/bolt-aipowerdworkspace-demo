/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          black: '#202124',
          'dark-base': '#202124',
          'light-black': '#303134',
          'lightest-black': '#3c4043',
          'white-text': '#FFFFFF',
          'light-text': '#B3B3B3',
          'lighter-text': '#A7A7A7',
        },
        dark: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          accent: '#1DB954',
          background: '#121212',
          surface: '#181818',
        },
        light: {
          primary: '#1e293b', // Dark text for light mode
          secondary: '#475569', // Secondary text for light mode
          accent: '#2563eb', // Accent color for light mode
          background: '#f8fafc', // Light background
          surface: '#ffffff', // Light surface color
        }
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'inherit',
            lineHeight: '1.75',
            maxWidth: '100%',
            a: {
              color: '#1DB954',
              '&:hover': {
                color: '#1ed760',
              },
              fontWeight: '500',
            },
            'h1, h2, h3, h4, h5, h6': {
              color: 'inherit',
              fontWeight: '700',
              marginBottom: '1rem',
            },
            strong: {
              color: 'inherit',
              fontWeight: '600',
            },
            code: {
              color: '#1e293b',
              backgroundColor: '#282828',
              fontWeight: '400',
              padding: '0.3em 0.5em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            pre: {
              backgroundColor: '#282828',
              color: '#ffffff',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.5rem',
            },
            blockquote: {
              borderLeftColor: '#1DB954',
              color: '#B3B3B3',
            }
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};