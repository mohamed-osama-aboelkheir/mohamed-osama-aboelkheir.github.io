const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");

  eleventyConfig.addGlobalData("year", new Date().getFullYear());

  // YAML gives us Date objects for unquoted dates, strings for quoted ones.
  const toDate = (value) => (value instanceof Date ? value : new Date(value));

  // Most recent appearance date — used for sorting and for the "when" label.
  const latestDate = (talk) =>
    (talk.appearances || [])
      .map((a) => toDate(a.date))
      .sort((a, b) => b - a)[0];

  eleventyConfig.addFilter("latestDate", latestDate);

  eleventyConfig.addFilter("sortTalks", (talks) =>
    [...(talks || [])].sort((a, b) => latestDate(b) - latestDate(a))
  );

  eleventyConfig.addFilter("monthYear", (value) =>
    toDate(value).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
  );

  eleventyConfig.addFilter("isUpcoming", (appearance) =>
    appearance.status === "upcoming" || toDate(appearance.date) > new Date()
  );

  return {
    dir: { input: "src", output: "_site", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
