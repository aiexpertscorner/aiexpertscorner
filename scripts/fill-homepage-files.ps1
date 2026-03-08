$files = @{

"src/styles/tokens.css" = @'
:root {
  --bg:#07070d;
  --surface:#16162a;
  --surface2:#1d1d35;
  --border:#252545;

  --text:#ebebf5;
  --muted:#8888aa;

  --accent:#f0a500;
  --accent2:#ff6b2b;

  --radius:14px;
  --container:1300px;
}
'@

"src/styles/base.css" = @'
@import "./tokens.css";

body{
margin:0;
background:var(--bg);
color:var(--text);
font-family:Inter,system-ui;
}

.container{
width:min(var(--container),calc(100% - 32px));
margin:auto;
}

.section{
padding:70px 0;
}
'@

"src/layouts/BaseLayout.astro" = @'
---
import "../styles/base.css";
import Header from "../components/site/Header.astro";
import Footer from "../components/site/Footer.astro";
const {title,description} = Astro.props;
---
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<title>{title}</title>
<meta name="description" content={description}/>
</head>

<body>

<Header/>

<main>
<slot/>
</main>

<Footer/>

</body>
</html>
'@

"src/components/site/Header.astro" = @'
<header class="nav">
<div class="container nav-inner">

<a href="/" class="logo">
AI<span>Experts</span>Corner
</a>

<nav>
<a href="/tools">Tools</a>
<a href="/news">News</a>
<a href="/prompts">Prompts</a>
<a href="/guides">Guides</a>
</nav>

<a href="/submit" class="btn">Submit Tool</a>

</div>
</header>

<style>
.nav{
border-bottom:1px solid #222;
background:#0c0c15;
}
.nav-inner{
display:flex;
justify-content:space-between;
align-items:center;
height:60px;
}
.logo{
font-weight:700;
text-decoration:none;
color:white;
}
.logo span{
color:var(--accent);
}
nav a{
margin:0 12px;
color:var(--muted);
text-decoration:none;
}
.btn{
background:var(--accent);
padding:8px 14px;
border-radius:8px;
color:black;
text-decoration:none;
}
</style>
'@

"src/components/site/Footer.astro" = @'
<footer class="footer">
<div class="container">

<p>© AIExpertsCorner</p>

</div>
</footer>

<style>
.footer{
border-top:1px solid #222;
padding:40px 0;
margin-top:80px;
color:var(--muted);
}
</style>
'@

"src/components/cards/ToolCard.astro" = @'
---
const {tool} = Astro.props;
let domain="";
try{
domain=new URL(tool.url).hostname.replace("www.","")
}catch{}
---

<a href={`/tools/${tool.handle}`} class="card">

<div class="logo">
<img src={`https://logo.clearbit.com/${domain}`} loading="lazy"/>
</div>

<div class="info">
<h3>{tool.name}</h3>
<p>{tool.short || tool.desc}</p>
</div>

</a>

<style>

.card{
display:flex;
gap:14px;
background:#151525;
border:1px solid #222;
padding:16px;
border-radius:12px;
text-decoration:none;
color:white;
}

.card:hover{
border-color:var(--accent);
}

.logo{
width:40px;
height:40px;
background:#1c1c32;
border-radius:8px;
overflow:hidden;
}

.logo img{
width:100%;
height:100%;
object-fit:contain;
}

.info h3{
margin:0 0 4px;
font-size:14px;
}

.info p{
margin:0;
font-size:12px;
color:var(--muted);
}

</style>
'@

"src/pages/index.astro" = @'
---
import BaseLayout from "../layouts/BaseLayout.astro";
import ToolCard from "../components/cards/ToolCard.astro";
import tools from "../data/tools_enriched.json";

const featured = tools.slice(0,12);
---

<BaseLayout
title="AI Experts Corner"
description="Find the best AI tools">

<section class="hero">

<div class="container">

<h1>Find the Best AI Tools</h1>

<input placeholder="Search AI tools..."/>

</div>

</section>

<section class="section">

<div class="container grid">

{featured.map(tool => (
<ToolCard tool={tool}/>
))}

</div>

</section>

</BaseLayout>

<style>

.hero{
padding:80px 0;
text-align:center;
}

.hero h1{
font-size:52px;
margin-bottom:20px;
}

.hero input{
padding:16px;
width:420px;
border-radius:10px;
border:1px solid #333;
background:#111;
color:white;
}

.grid{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
gap:14px;
}

</style>
'@

}

foreach ($file in $files.Keys) {
    $files[$file] | Set-Content $file
}

Write-Host "Files gevuld"