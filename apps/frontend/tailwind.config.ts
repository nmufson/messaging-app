module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
          light: 'var(--color-brand-light)',
          accent: 'var(--color-brand-accent)',
          neutral: 'var(--color-brand-neutral)',
          surface: 'var(--color-brand-surface)',
          success: 'var(--color-brand-success)',
        },
        grey: {
          50: 'var(--color-grey-50)',
          100: 'var(--color-grey-100)',
          150: 'var(--color-grey-150)',
          200: 'var(--color-grey-200)',
        },
      },
    },
  },
  plugins: [],
};
