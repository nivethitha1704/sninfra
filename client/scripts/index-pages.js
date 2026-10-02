import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

// Define all routes and their customized SEO metadata
export const routeMetadata = {
  'about': {
    title: 'About Us | SN Infra Construction Coimbatore & Pollachi',
    description: 'Learn about SN Infra, leading construction and civil engineering contractors in Coimbatore and Pollachi with 15+ years of excellence.'
  },
  'services': {
    title: 'Our Construction Services | SN Infra Coimbatore & Pollachi',
    description: 'Explore construction services by SN Infra: DTCP building approvals, structural design, residential & commercial construction, 3D elevation, and renovations.'
  },
  'gallery': {
    title: 'Building & Interiors Gallery | SN Infra Coimbatore & Pollachi',
    description: 'Explore our construction gallery categorized by Building, Interiors, Elevation, and Ongoing Sites in Coimbatore & Pollachi.'
  },
  'contact': {
    title: 'Contact Us | SN Infra Civil Engineers & Contractors',
    description: 'Get in touch with SN Infra for building consultations, cost estimations, and DTCP approval inquiries in Coimbatore and Pollachi.'
  },
  'admin': {
    title: 'Admin Portal | SN Infra CMS',
    description: 'SN Infra CMS Administration Portal.'
  },
  'admin/login': {
    title: 'Admin Login | SN Infra CMS',
    description: 'Sign in to SN Infra CMS control panel.'
  },
  'admin/dashboard': {
    title: 'Analytics Dashboard | SN Infra CMS',
    description: 'Real-time project analytics, enquiry feeds, and system overview.'
  },
  'admin/gallery': {
    title: 'Gallery & Categories Manager | SN Infra CMS',
    description: 'Manage construction gallery images, custom categories (Building, Interiors, Elevation), and photo portfolios.'
  },
  'admin/services': {
    title: 'Service Manager | SN Infra CMS',
    description: 'Manage company services, features, and offerings.'
  },
  'admin/testimonials': {
    title: 'Testimonial Manager | SN Infra CMS',
    description: 'Manage client reviews and Google Maps sync.'
  },
  'admin/enquiries': {
    title: 'Enquiry Manager | SN Infra CMS',
    description: 'View, filter, and respond to incoming customer enquiries.'
  },
  'admin/settings': {
    title: 'System Settings | SN Infra CMS',
    description: 'Manage company contact info, social links, SEO tags, and credentials.'
  }
};

/**
 * Creates static index.html files for every client-side route
 * so refreshing on any route works without 404 on any web host.
 */
export function indexAllPages() {
  const rootIndexPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(rootIndexPath)) {
    console.warn(`[index-pages] Warning: ${rootIndexPath} not found. Skipping route indexing.`);
    return;
  }

  const baseHtml = fs.readFileSync(rootIndexPath, 'utf-8');
  const routes = Object.keys(routeMetadata);

  console.log(`\n📄 [index-pages] Indexing ${routes.length} pages into dist/...`);

  let createdCount = 0;
  for (const route of routes) {
    const meta = routeMetadata[route];
    const targetDir = path.join(distDir, route);

    // Create target route folder
    fs.mkdirSync(targetDir, { recursive: true });

    // Inject route-specific title and meta description
    let pageHtml = baseHtml;
    if (meta.title) {
      pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);
      pageHtml = pageHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${meta.title}" />`);
      pageHtml = pageHtml.replace(/<meta property="twitter:title" content=".*?" \/>/i, `<meta property="twitter:title" content="${meta.title}" />`);
    }
    if (meta.description) {
      pageHtml = pageHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${meta.description}" />`);
      pageHtml = pageHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${meta.description}" />`);
      pageHtml = pageHtml.replace(/<meta property="twitter:description" content=".*?" \/>/i, `<meta property="twitter:description" content="${meta.description}" />`);
    }
    const pageUrl = `https://sninfra.onrender.com/${route}`;
    pageHtml = pageHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${pageUrl}" />`);
    pageHtml = pageHtml.replace(/<meta property="twitter:url" content=".*?" \/>/i, `<meta property="twitter:url" content="${pageUrl}" />`);

    // Write index.html inside the route directory
    const targetFilePath = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFilePath, pageHtml, 'utf-8');
    createdCount++;
  }

  // 1. Create 404.html fallback in dist root (for GitHub Pages & static servers)
  const fallback404 = path.join(distDir, '404.html');
  fs.writeFileSync(fallback404, baseHtml, 'utf-8');

  // 2. Ensure _redirects is present in dist
  const redirectsPath = path.join(distDir, '_redirects');
  if (!fs.existsSync(redirectsPath)) {
    fs.writeFileSync(redirectsPath, '# Netlify, Cloudflare Pages, and Render SPA Fallback\n/*    /index.html   200\n', 'utf-8');
  }

  // 3. Ensure .htaccess is present in dist
  const htaccessPath = path.join(distDir, '.htaccess');
  if (!fs.existsSync(htaccessPath)) {
    const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
    fs.writeFileSync(htaccessPath, htaccessContent, 'utf-8');
  }

  console.log(`✅ [index-pages] Successfully indexed ${createdCount} pages!`);
  console.log(`✅ [index-pages] Created dist/404.html, dist/_redirects, and dist/.htaccess.`);
  console.log(`✨ All pages are now fully indexed and ready for error-free refresh on any hosting provider.\n`);
}

// Self-run when invoked via CLI (e.g. node scripts/index-pages.js)
if (process.argv[1] === __filename) {
  indexAllPages();
}
