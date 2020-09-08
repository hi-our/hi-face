module.exports = {
  plugins: [
    // Basic usage.
    // '@docusaurus/plugin-google-analytics',

    // With options object (babel style)
    [
      '@docusaurus/plugin-sitemap',
      {
        cacheTime: 600 * 1000,
      },
    ],
  ],
};