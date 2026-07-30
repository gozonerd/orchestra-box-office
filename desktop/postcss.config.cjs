module.exports = {
  plugins: {
    // Tailwind v4 moved its PostCSS plugin into a separate package.
    // Referencing `tailwindcss` here fails the build with
    // "trying to use `tailwindcss` directly as a PostCSS plugin".
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
