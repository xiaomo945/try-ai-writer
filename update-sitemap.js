
const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(__dirname, 'app', 'sitemap.ts');
const BLOG_POSTS_DIR = path.join(__dirname, 'data', 'blog-posts');

// Read existing sitemap
const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');

// Extract existing slugs
const existingSlugs = [];
const slugRegex = /slug:\s*"([^"]+)"/g;
let match;
while ((match = slugRegex.exec(sitemapContent)) !== null) {
  existingSlugs.push(match[1]);
}

// Read all markdown files
const mdFiles = fs.readdirSync(BLOG_POSTS_DIR).filter(f => f.endsWith('.md'));
const newPosts = [];

mdFiles.forEach(file => {
  const slug = path.basename(file, '.md');
  if (!existingSlugs.includes(slug)) {
    // Read frontmatter to get title and other metadata
    const content = fs.readFileSync(path.join(BLOG_POSTS_DIR, file), 'utf8');
    const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
    let title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let date = '2026-06-05';
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*(.*)/);
      const dateMatch = frontmatter.match(/date:\s*"?([^"\n]+)"?/);
      if (titleMatch) title = titleMatch[1].trim();
      if (dateMatch) date = dateMatch[1].trim();
    }
    
    newPosts.push({ slug, title, date });
    console.log(`Found new post: ${slug}`);
  }
});

if (newPosts.length === 0) {
  console.log('No new posts to add');
  process.exit(0);
}

// Add new posts to sitemap
const insertionPoint = '];';
const newPostEntries = newPosts.map(post => 
  `  { slug: "${post.slug}", title: "${post.title.replace(/"/g, '\\"')}", date: "${post.date}" },`
).join('\n');

const updatedContent = sitemapContent.replace(
  insertionPoint,
  `\n  // New expansion posts\n${newPostEntries}\n];`
);

fs.writeFileSync(SITEMAP_PATH, updatedContent, 'utf8');
console.log(`Added ${newPosts.length} new posts to sitemap.ts`);
