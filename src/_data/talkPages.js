// One share page per talk, plus one per talk-at-a-venue, built by
// src/talk-pages.njk at /t/<talk-slug>/ and /t/<talk-slug>/<event-slug>/.
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

module.exports = () => {
  const talks = yaml.load(fs.readFileSync(path.join(__dirname, "talks.yaml"), "utf8")) || [];
  const pages = [];
  for (const talk of talks) {
    pages.push({ talk });
    for (const appearance of talk.appearances || []) pages.push({ talk, appearance });
  }
  return pages;
};
