import fs from "fs";

const site = "https://woafy.pet";

const posts = JSON.parse(
  fs.readFileSync("./public/data/blog-posts.json")
).posts;

const items = posts
  .filter(p => p.published !== false)
  .map(
    p => `
<item>
<title>${p.title}</title>
<link>${site}/blog/${p.slug}</link>
<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
<description>${p.excerpt}</description>
</item>`
  )
  .join("");

const rss = `<?xml version="1.0"?>
<rss version="2.0">
<channel>
<title>WoafyPet Care Guides</title>
<link>${site}</link>
<description>Dog comfort, sleep and health guides</description>
${items}
</channel>
</rss>`;

fs.writeFileSync("./public/rss.xml", rss);

console.log("rss.xml generated");