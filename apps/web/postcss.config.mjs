const config = {
  plugins: {
    // Tailwind inlines the @import graph first; custom-media then resolves the five
    // named breakpoints from styles/breakpoints.css. Order matters.
    "@tailwindcss/postcss": {},
    "postcss-custom-media": {},
  },
};

export default config;
