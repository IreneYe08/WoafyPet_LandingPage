import fs from "fs";

const site = "https://woafypet.com";

const posts = JSON.parse(
  fs.readFileSync("./public/data/blog-posts.json")
).posts;

const urls = posts
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
<loc>${site}</loc>
</url>

<url>
<loc>${site}/blog</loc>
</url>

${urls.join("")}

</urlset>
`;

fs.writeFileSync("./public/sitemap.xml", sitemap);

console.log("sitemap.xml generated");