param(
  [string]$PagesDir = "src/pages"
)

if (!(Test-Path $PagesDir)) {
  Write-Error "Map niet gevonden: $PagesDir"
  exit 1
}

function Convert-ToRoute {
  param(
    [string]$RelativePath
  )

  $route = $RelativePath -replace "\\", "/"
  $route = $route -replace "/index\.astro$", ""
  $route = $route -replace "^index\.astro$", ""
  $route = $route -replace "\.astro$", ""

  if ([string]::IsNullOrWhiteSpace($route)) {
    return "/"
  }

  return "/" + $route
}

Write-Host ""
Write-Host "ASTRO ROUTES + BESTANDEN" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path $PagesDir -Recurse -File -Filter *.astro |
  Sort-Object FullName

if (!$files) {
  Write-Host "Geen .astro files gevonden in $PagesDir" -ForegroundColor Yellow
  exit 0
}

foreach ($file in $files) {
  $relative = Resolve-Path -Relative $file.FullName
  $relative = $relative -replace "^\.\\" , ""
  $relative = $relative -replace [regex]::Escape($PagesDir + "\"), ""
  $route = Convert-ToRoute -RelativePath $relative

  Write-Host ("{0,-40} -> {1}" -f $route, $relative) -ForegroundColor Green
}

Write-Host ""
Write-Host "Totaal routes:" $files.Count -ForegroundColor Magenta
Write-Host ""