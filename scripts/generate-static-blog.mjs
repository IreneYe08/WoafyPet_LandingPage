import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '../dist')

const client = createClient({
  projectId: 'jf3pfn1g',
  dataset: 'articles',
  apiVersion: '2024-01-01',
  useCdn: false,
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function blocksToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks)) return ''
  return blocks.map(block => {
    if (block._type !== 'block') return ''
    const text = block.children?.map(c => c.text).join('') || ''
    if (block.style === 'h2') return `<h2>${text}</h2>`
    if (block.style === 'h3') return `<h3>${text}</h3>`
    return `<p>${text}</p>`
  }).join('\n')
}

function generateHtml(post) {
  const contentHtml = blocksToHtml(post.content)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} | WoafyPet Care Guides</title>
  <meta name="description" content="${post.excerpt || ''}">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.excerpt || ''}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://woafy.pet/blog/${post.slug}">
  ${post.coverImage ? `<meta property="og:image" content="${post.coverImage}">` : ''}
  <link rel="canonical" href="https://woafy.pet/blog/${post.slug}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title}",
    "description": "${post.excerpt || ''}",
    "datePublished": "${post.publishedAt}",
    "image": "${post.coverImage || ''}",
    "author": {
      "@type": "Organization",
      "name": "WoafyPet"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WoafyPet",
      "url": "https://woafy.pet"
    }
  }
  </script>
  <meta http-equiv="refresh" content="0;url=/blog/${post.slug}">
</head>
<body>
  <article>
    <h1>${post.title}</h1>
    <p><time datetime="${post.publishedAt}">${formatDate(post.publishedAt)}</time></p>
    ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}">` : ''}
    <p>${post.excerpt || ''}</p>
    ${contentHtml}
  </article>
  <script>
    // Redirect to React app for full experience
    window.location.replace('/blog/${post.slug}');
  </script>
</body>
</html>`
}

async function main() {
  console.log('Fetching blog posts from Sanity...')

  const posts = await client.fetch(`
    *[_type == "blogPost"] {
      "slug": slug.current,
      title,
      excerpt,
      "coverImage": coverImage.asset->url,
      publishedAt,
      category,
      content
    }
  `)

  console.log(`Found ${posts.length} posts`)

  for (const post of posts) {
    if (!post.slug) continue

    const dir = path.join(distDir, 'blog', post.slug)
    fs.mkdirSync(dir, { recursive: true })

    const html = generateHtml(post)
    fs.writeFileSync(path.join(dir, 'index.html'), html)
    console.log(`Generated: /blog/${post.slug}/index.html`)
  }

  console.log('Static blog generation complete')
}

main().catch(console.error)