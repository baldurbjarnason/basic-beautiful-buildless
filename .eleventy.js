export default function (eleventyConfig) {
  eleventyConfig.addGlobalData("layout", "layout.njk");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("src");
  eleventyConfig.addPassthroughCopy("manifest.json");
  eleventyConfig.addWatchTarget("./src/");
  eleventyConfig.addWatchTarget("./assets/");
  // Return your Object options:

  eleventyConfig.addShortcode("uuid", function () {
    return crypto.randomUUID();
  });
  return {
    dir: {
      input: ".",
      output: "_site",
    },

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",
  };
}
