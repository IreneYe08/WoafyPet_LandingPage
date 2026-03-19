import fs from "fs";

const site = "https://woafy.pet";
const today = new Date().toISOString().split("T")[0];

const posts = JSON.parse(
  fs.readFileSync("./public/data/blog-posts.json")
).posts;

const blogUrls = posts
  .filter(p => p.published !== false)
  .map(p => `
  <url>
    <loc>${site}/blog/${p.slug}</loc>
    <lastmod>${p.publishedAt}</lastmod>
  </url>
`);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
<loc>${site}/</loc>
<lastmod>${today}</lastmod>
</url>

<url>
<loc>${site}/blog</loc>
<lastmod>${today}</lastmod>
</url>

<url>
<loc>${site}/faq</loc>
<lastmod>${today}</lastmod>
</url>

<url>
<loc>${site}/updates</loc>
<lastmod>${today}</lastmod>
</url>

<url>
<loc>${site}/privacy</loc>
<lastmod>${today}</lastmod>
</url>

<url>
<loc>${site}/terms</loc>
<lastmod>${today}</lastmod>
</url>

<url>
<loc>${site}/privacy-choices</loc>
<lastmod>${today}</lastmod>
</url>

${blogUrls.join("")}

</urlset>
`;

fs.writeFileSync("./public/sitemap.xml", sitemap);

console.log("sitemap.xml generated");