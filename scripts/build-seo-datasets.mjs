import fs from "fs";
import path from "path";

const root = process.cwd();
const inputPath = path.join(root, "src/data/tools_enriched.json");
const outDir = path.join(root, "src/data/build");

const slugify = (value = "") =>
  String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

fs.mkdirSync(outDir, { recursive: true });

const tools = raw
  .filter((t) => t.handle && t.name)
  .map((t, idx) => ({
    handle: t.handle,
    name: t.name,
    url: t.url || "",
    short: t.short || "",
    desc: t.desc || "",
    cat: t.cat || "Other",
    pricing: t.pricing || "Unknown",
    tags: Array.isArray(t.tags) ? t.tags : [],
    e: t.e || "✦",
    idx
  }));

const toolPaths = tools.map((t) => t.handle);

const toolMap = Object.fromEntries(
  tools.map((t) => [
    t.handle,
    {
      handle: t.handle,
      name: t.name,
      url: t.url,
      short: t.short,
      desc: t.desc,
      cat: t.cat,
      pricing: t.pricing,
      tags: t.tags,
      e: t.e
    }
  ])
);

const categoryGroups = new Map();

for (const tool of tools) {
  const slug = slugify(tool.cat);
  if (!categoryGroups.has(slug)) {
    categoryGroups.set(slug, {
      slug,
      name: tool.cat,
      tools: []
    });
  }
  categoryGroups.get(slug).tools.push(tool.handle);
}

const categoryPaths = [...categoryGroups.values()].map((c) => c.slug);

const categoryMap = Object.fromEntries(
  [...categoryGroups.values()].map((c) => [
    c.slug,
    {
      slug: c.slug,
      name: c.name,
      toolHandles: c.tools
    }
  ])
);

// related tools = first 6 others in same category
const relatedMap = {};
for (const tool of tools) {
  const sameCat = tools
    .filter((t) => t.handle !== tool.handle && t.cat === tool.cat)
    .slice(0, 6)
    .map((t) => t.handle);

  relatedMap[tool.handle] = sameCat;
}

fs.writeFileSync(path.join(outDir, "tool-paths.json"), JSON.stringify(toolPaths, null, 2));
fs.writeFileSync(path.join(outDir, "tool-map.json"), JSON.stringify(toolMap, null, 2));
fs.writeFileSync(path.join(outDir, "category-paths.json"), JSON.stringify(categoryPaths, null, 2));
fs.writeFileSync(path.join(outDir, "category-map.json"), JSON.stringify(categoryMap, null, 2));
fs.writeFileSync(path.join(outDir, "related-map.json"), JSON.stringify(relatedMap, null, 2));

console.log("✅ SEO datasets generated");
console.log(`Tools: ${toolPaths.length}`);
console.log(`Categories: ${categoryPaths.length}`);