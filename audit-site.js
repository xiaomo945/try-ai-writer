#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'app');

// Get all .tsx files
function getTSXFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getTSXFiles(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Check for broken internal links
function checkBrokenLinks(files) {
  const issues = [];
  const internalPaths = new Set([
    '/', '/pricing', '/blog', '/write', '/dashboard', '/templates',
    '/login', '/register', '/onboarding', '/terms', '/privacy',
    '/auth/error', '/affiliate/dashboard', '/interview',
    '/payment/success', '/payment/pending'
  ]);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for <Link href="...">
    const linkMatches = content.matchAll(/<Link\s+href="([^"]+)"/g);
    for (const match of linkMatches) {
      const href = match[1];
      if (href.startsWith('/') && !href.includes(':')) {
        // Internal link - check if it's a route
        const route = href.split('?')[0].split('#')[0];
        if (!internalPaths.has(route) && !route.startsWith('/blog/')) {
          // Might be a dynamic route like /blog/[slug]
          if (!route.match(/^\/blog\/\[.*\]$/)) {
            issues.push(`File: ${file}, Broken link: ${href}`);
          }
        }
      }
    }
    
    // Check for <a href="...">
    const anchorMatches = content.matchAll(/<a\s+href="([^"]+)"/g);
    for (const match of anchorMatches) {
      const href = match[1];
      if (href.startsWith('http') || href.startsWith('//')) {
        // External link - check for target="_blank"
        const fullMatch = match[0];
        if (!fullMatch.includes('target=')) {
          issues.push(`File: ${file}, External link without target: ${href}`);
        }
      }
    }
  }
  
  return issues;
}

// Check skeleton screen consistency
function checkSkeletonConsistency(files) {
  const issues = [];
  const skeletonPatterns = [
    'animate-pulse',
    'skeleton',
    'loading'
  ];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if file has loading states
    const hasLoading = skeletonPatterns.some(pattern => 
      content.toLowerCase().includes(pattern)
    );
    
    // Check if file has data fetching
    const hasDataFetch = content.includes('useEffect') || 
                         content.includes('useState') ||
                         content.includes('fetch(') ||
                         content.includes('getServerSideProps');
    
    if (hasDataFetch && !hasLoading) {
      // This file fetches data but might not have loading states
      // Check if it's a page component (not just a component)
      if (file.includes('/page.tsx') && !content.includes('loading')) {
        // Check if it's using a loading.tsx file or has its own skeleton
        const dir = path.dirname(file);
        const loadingFile = path.join(dir, 'loading.tsx');
        if (!fs.existsSync(loadingFile)) {
          issues.push(`File: ${file}, May be missing loading state`);
        }
      }
    }
  }
  
  return issues;
}

// Check responsive design
function checkResponsiveDesign(files) {
  const issues = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for common responsive classes
    const hasResponsiveClasses = 
      content.includes('sm:') ||
      content.includes('md:') ||
      content.includes('lg:') ||
      content.includes('xl:') ||
      content.includes('2xl:');
    
    // Only check page components
    if (file.includes('/page.tsx') && !hasResponsiveClasses) {
      issues.push(`File: ${file}, No responsive classes found`);
    }
    
    // Check for hard-coded widths
    const hardcodedWidths = content.matchAll(/w-\d+/g);
    for (const match of hardcodedWidths) {
      const width = match[0];
      const num = parseInt(width.match(/\d+/)[0]);
      // Flag very large fixed widths that might not be responsive
      if (num >= 1024 && !content.includes('max-w-')) {
        issues.push(`File: ${file}, Large fixed width without max-width: ${width}`);
      }
    }
  }
  
  return issues;
}

// Main execution
console.log('🔍 Running site-wide audit...\n');

const files = getTSXFiles(APP_DIR);
console.log(`Found ${files.length} .tsx files\n`);

// Check 1: Broken links
console.log('✅ Checking for broken links...');
const linkIssues = checkBrokenLinks(files);
if (linkIssues.length > 0) {
  console.log(`⚠️  Found ${linkIssues.length} link issues:`);
  linkIssues.slice(0, 10).forEach(issue => console.log(`   - ${issue}`));
  if (linkIssues.length > 10) {
    console.log(`   ... and ${linkIssues.length - 10} more`);
  }
} else {
  console.log('   No broken links found ✓');
}
console.log();

// Check 2: Skeleton consistency
console.log('✅ Checking skeleton screen consistency...');
const skeletonIssues = checkSkeletonConsistency(files);
if (skeletonIssues.length > 0) {
  console.log(`⚠️  Found ${skeletonIssues.length} potential issues:`);
  skeletonIssues.slice(0, 10).forEach(issue => console.log(`   - ${issue}`));
  if (skeletonIssues.length > 10) {
    console.log(`   ... and ${skeletonIssues.length - 10} more`);
  }
} else {
  console.log('   Skeleton screens look good ✓');
}
console.log();

// Check 3: Responsive design
console.log('✅ Checking responsive design...');
const responsiveIssues = checkResponsiveDesign(files);
if (responsiveIssues.length > 0) {
  console.log(`⚠️  Found ${responsiveIssues.length} potential issues:`);
  responsiveIssues.slice(0, 10).forEach(issue => console.log(`   - ${issue}`));
  if (responsiveIssues.length > 10) {
    console.log(`   ... and ${responsiveIssues.length - 10} more`);
  }
} else {
  console.log('   Responsive design looks good ✓');
}
console.log();

console.log('✅ Audit complete!');
console.log('\nSummary:');
console.log(`- Total files checked: ${files.length}`);
console.log(`- Link issues: ${linkIssues.length}`);
console.log(`- Skeleton issues: ${skeletonIssues.length}`);
console.log(`- Responsive issues: ${responsiveIssues.length}`);
