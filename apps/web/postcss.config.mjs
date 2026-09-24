const config = {
  plugins: {
    // @custom-media is scoped to the PostCSS entry that declares it. Only globals.css
    // imports breakpoints.css, and every page-level stylesheet (auth.css, status.css,
    // and thirteen others) is its own entry — so without this, their @media (--md)
    // blocks ship unresolved and are silently inert in the browser.
    "@csstools/postcss-global-data": {
      files: ["./src/styles/breakpoints.css"],
    },
    // Tailwind inlines the @import graph; custom-media then resolves the five named
    // breakpoints. Order matters.
    "@tailwindcss/postcss": {},
    "postcss-custom-media": {},
  },
};

export default config;
