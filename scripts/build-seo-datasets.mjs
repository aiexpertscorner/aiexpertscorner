import fs from "fs";
import path from "path";

const root = process.cwd();
const inputPath = path.join(root, "src/data/tools_enriched.json");
const outDir = path.join(root, "src/data/build");

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const safeString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const safeArray = (value) =>
  Array.isArray(value) ? value.filter(Boolean).map((v) => String(v).trim()) : [];

const normalizePricing = (value) => {
  const v = safeString(value, "Unknown").toLowerCase();

  if (v === "free") return "Free";
  if (v === "freemium") return "Freemium";
  if (v === "paid") return "Paid";

  return "Unknown";
};

const readJson = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
  }
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const raw = readJson(inputPath);

if (!Array.isArray(raw)) {
  throw new Error("tools_enriched.json must contain an array");
}

ensureDir(outDir);

const seenHandles = new Set();
const skipped = [];
const duplicateHandles = [];
const normalizedTools = [];

for (let idx = 0; idx < raw.length; idx++) {
  const item = raw[idx];

  const handle = safeString(item?.handle);
  const name = safeString(item?.name);
  const url = safeString(item?.url);
  const short = safeString(item?.short);
  const desc = safeString(item?.desc);
  const cat = safeString(item?.cat, "Other");
  const pricing = normalizePricing(item?.pricing);
  const tags = safeArray(item?.tags).slice(0, 12);
  const e = safeString(item?.e, "✦");

  if (!handle || !name) {
    skipped.push({
      index: idx,
      reason: "Missing handle or name",
      handle,
      name
    });
    continue;
  }

  if (seenHandles.has(handle)) {
    duplicateHandles.push(handle);
    continue;
  }

  seenHandles.add(handle);

  normalizedTools.push({
    handle,
    name,
    url,
    short,
    desc,
    cat,
    catSlug: slugify(cat),
    pricing,
    tags,
    e,
    idx
  });
}

// Sort tools consistently
normalizedTools.sort((a, b) => a.name.localeCompare(b.name));

// tool-paths.json
const toolPaths = normalizedTools.map((tool) => tool.handle);

// tool-map.json
const toolMap = Object.fromEntries(
  normalizedTools.map((tool) => [
    tool.handle,
    {
      handle: tool.handle,
      name: tool.name,
      url: tool.url,
      short: tool.short,
      desc: tool.desc,
      cat: tool.cat,
      catSlug: tool.catSlug,
      pricing: tool.pricing,
      tags: tool.tags,
      e: tool.e
    }
  ])
);

// category grouping
const categoryGroups = new Map();

for (const tool of normalizedTools) {
  if (!categoryGroups.has(tool.catSlug)) {
    categoryGroups.set(tool.catSlug, {
      slug: tool.catSlug,
      name: tool.cat,
      toolHandles: []
    });
  }

  categoryGroups.get(tool.catSlug).toolHandles.push(tool.handle);
}

// Sort categories by name
const sortedCategories = [...categoryGroups.values()].sort((a, b) =>
  a.name.localeCompare(b.name)
);

// category-paths.json
const categoryPaths = sortedCategories.map((category) => category.slug);

// category-map.json
const categoryMap = Object.fromEntries(
  sortedCategories.map((category) => [
    category.slug,
    {
      slug: category.slug,
      name: category.name,
      toolHandles: category.toolHandles,
      toolCount: category.toolHandles.length
    }
  ])
);

// related-map.json
// Strategy:
// 1. same category first
// 2. overlapping tags next
// 3. cap at 6

const relatedMap = {};

for (const tool of normalizedTools) {
  const sameCategory = normalizedTools.filter(
    (candidate) =>
      candidate.handle !== tool.handle && candidate.catSlug === tool.catSlug
  );

  const scored = sameCategory.map((candidate) => {
    const overlap = candidate.tags.filter((tag) => tool.tags.includes(tag)).length;

    return {
      handle: candidate.handle,
      score: overlap
    };
  });

  scored.sort((a, b) => b.score - a.score || a.handle.localeCompare(b.handle));

  relatedMap[tool.handle] = scored.slice(0, 6).map((item) => item.handle);
}

// featured-tools.json
// simple default: first 12 with description and url if possible
const featuredTools = normalizedTools
  .filter((tool) => tool.name && (tool.short || tool.desc))
  .slice(0, 12)
  .map((tool) => tool.handle);

// pricing-stats.json
const pricingStats = {
  all: normalizedTools.length,
  free: normalizedTools.filter((t) => t.pricing === "Free").length,
  freemium: normalizedTools.filter((t) => t.pricing === "Freemium").length,
  paid: normalizedTools.filter((t) => t.pricing === "Paid").length,
  unknown: normalizedTools.filter((t) => t.pricing === "Unknown").length
};

// category-stats.json
const categoryStats = Object.fromEntries(
  sortedCategories.map((category) => [category.name, category.toolHandles.length])
);

// build-meta.json
const buildMeta = {
  generatedAt: new Date().toISOString(),
  sourceFile: "src/data/tools_enriched.json",
  toolCount: normalizedTools.length,
  categoryCount: sortedCategories.length,
  skippedCount: skipped.length,
  duplicateHandleCount: duplicateHandles.length
};

// skipped-records.json for debugging
const skippedRecords = {
  skipped,
  duplicateHandles
};

// Write files
writeJson(path.join(outDir, "tool-paths.json"), toolPaths);
writeJson(path.join(outDir, "tool-map.json"), toolMap);
writeJson(path.join(outDir, "category-paths.json"), categoryPaths);
writeJson(path.join(outDir, "category-map.json"), categoryMap);
writeJson(path.join(outDir, "related-map.json"), relatedMap);
writeJson(path.join(outDir, "featured-tools.json"), featuredTools);
writeJson(path.join(outDir, "pricing-stats.json"), pricingStats);
writeJson(path.join(outDir, "category-stats.json"), categoryStats);
writeJson(path.join(outDir, "build-meta.json"), buildMeta);
writeJson(path.join(outDir, "skipped-records.json"), skippedRecords);

console.log("");
console.log("✅ SEO datasets generated");
console.log("----------------------------------");
console.log(`Tools:       ${toolPaths.length}`);
console.log(`Categories:  ${categoryPaths.length}`);
console.log(`Skipped:     ${skipped.length}`);
console.log(`Duplicates:  ${duplicateHandles.length}`);
console.log(`Output dir:  ${outDir}`);
console.log("----------------------------------");
console.log("");