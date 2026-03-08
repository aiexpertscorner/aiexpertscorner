$folders = @(
  "src/components/cards",
  "src/components/sections",
  "src/components/site",
  "src/data",
  "src/layouts",
  "src/styles",
  "scripts"
)

foreach ($folder in $folders) {
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

$files = @(
  "src/layouts/BaseLayout.astro",
  "src/components/site/Header.astro",
  "src/components/site/Footer.astro",
  "src/components/site/SectionHeader.astro",
  "src/components/site/SearchHero.astro",
  "src/components/site/StatsBar.astro",
  "src/components/site/FilterStrip.astro",
  "src/components/site/NewsletterCard.astro",
  "src/components/cards/ToolCard.astro",
  "src/components/cards/ToolRow.astro",
  "src/components/cards/CategoryCard.astro",
  "src/components/cards/TopicCard.astro",
  "src/components/sections/CategoryGrid.astro",
  "src/components/sections/FeaturedToolsSection.astro",
  "src/components/sections/NewToolsSection.astro",
  "src/components/sections/TrendingTopicsSection.astro",
  "src/data/homeConfig.ts",
  "src/styles/tokens.css",
  "src/styles/base.css",
  "src/styles/components.css",
  "src/pages/index.astro"
)

foreach ($file in $files) {
  if (!(Test-Path $file)) {
    New-Item -ItemType File -Path $file | Out-Null
  }
}

Write-Host "Scaffold aangemaakt. Plak nu de code in de bestanden."