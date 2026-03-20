/**
 * prerender.mjs — Build-time static HTML pre-rendering for SEO
 *
 * Renders each static route to a standalone HTML file so Google and other
 * crawlers can index content without executing JavaScript.
 *
 * Usage: node scripts/prerender.mjs
 * (Automatically called as part of `npm run build`)
 */

import { build } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const ssrOutDir = path.join(rootDir, 'dist-ssr');

// Static routes to pre-render (dynamic blog/:slug routes are skipped)
const routes = [
  {
    path: '/',
    title: "WoafyPet Bed | World's First AI–Powered Orthopedic Dog Bed",
    description:
      'WoafyPet Bed combines orthopedic comfort and AI-powered pet care for better rest, joint support, and peace of mind. The world\'s first smart dog bed.',
    canonical: 'https://woafy.pet/',
  },
  {
    path: '/faq',
    title: 'FAQ | WoafyPet Bed',
    description:
      "Frequently asked questions about WoafyPet Bed — the world's first AI-powered orthopedic dog bed.",
    canonical: 'https://woafy.pet/faq',
  },
  {
    path: '/blog',
    title: 'Blog | WoafyPet',
    description: 'Dog care guides, health tips, and WoafyPet product updates.',
    canonical: 'https://woafy.pet/blog',
  },
  {
    path: '/updates',
    title: 'Development Updates | WoafyPet',
    description:
      "Follow the development journey of WoafyPet Bed — the world's first AI-powered orthopedic dog bed.",
    canonical: 'https://woafy.pet/updates',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | WoafyPet',
    description: 'Read the WoafyPet privacy policy.',
    canonical: 'https://woafy.pet/privacy',
  },
  {
    path: '/terms',
    title: 'Terms of Service | WoafyPet',
    description: 'Read the WoafyPet terms of service.',
    canonical: 'https://woafy.pet/terms',
  },
  {
    path: '/privacy-choices',
    title: 'Privacy Choices | WoafyPet',
    description: 'Manage your privacy choices for WoafyPet.',
    canonical: 'https://woafy.pet/privacy-choices',
  },
];

function injectMeta(template, { title, description, canonical }) {
  let html = template;

  // Title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${description}"`
  );

  // Canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${canonical}"`
  );

  // OG title
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${title}"`
  );

  // OG description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${description}"`
  );

  // OG URL
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonical}"`
  );

  // Twitter title
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${title}"`
  );

  // Twitter description
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${description}"`
  );

  return html;
}

async function main() {
  const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

  // Build SSR bundle
  console.log('Building SSR bundle...');
  await build({
    root: rootDir,
    configFile: path.join(rootDir, 'vite.config.ts'),
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: 'dist-ssr',
      rollupOptions: {
        output: { format: 'esm' },
      },
    },
    logLevel: 'warn',
  });

  // Load the SSR render function
  const ssrModule = await import(path.join(ssrOutDir, 'entry-server.js'));
  const { render } = ssrModule;

  // Pre-render each route
  for (const route of routes) {
    try {
      const appHtml = render(route.path);
      let html = injectMeta(template, route);
      html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      const outputPath =
        route.path === '/'
          ? path.join(distDir, 'index.html')
          : path.join(distDir, route.path.slice(1), 'index.html');

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, html, 'utf8');
      console.log(`  pre-rendered: ${route.path} → ${path.relative(rootDir, outputPath)}`);
    } catch (err) {
      console.warn(`  [warn] pre-render failed for ${route.path}: ${err.message}`);
    }
  }

  // Cleanup SSR bundle
  fs.rmSync(ssrOutDir, { recursive: true, force: true });

  console.log('Pre-rendering complete.');
}

main().catch((err) => {
  console.error('Pre-render error:', err);
  process.exit(1);
});
