import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function (eleventyConfig) {
	eleventyConfig.addGlobalData("layout", "layout.njk");
	eleventyConfig.addPassthroughCopy("img");
	eleventyConfig.addPassthroughCopy("favicon.ico");
	eleventyConfig.addPassthroughCopy("images");
	eleventyConfig.addPassthroughCopy("assets");
	eleventyConfig.addPassthroughCopy("src");
	eleventyConfig.addPassthroughCopy("manifest.json");
	eleventyConfig.addWatchTarget("./src/");
	eleventyConfig.addWatchTarget("./assets/");
	eleventyConfig.addPlugin(syntaxHighlight);
	// Return your Object options:
	eleventyConfig.amendLibrary("md", (mdLib) => {
		mdLib.set({ typographer: true });
	});

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
