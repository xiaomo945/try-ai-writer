#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取所有博客文章
function getAllBlogPosts() {
  const blogDir = path.join(__dirname, '../data/blog-posts');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
  
  return files.map(filename => {
    const content = fs.readFileSync(path.join(blogDir, filename), 'utf-8');
    const lines = content.split('\n');
    
    // 提取frontmatter
    const frontmatter = {};
    let inFrontmatter = false;
    let bodyStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
          bodyStart = i + 1;
        } else {
          bodyStart = i + 1;
          break;
        }
      } else if (inFrontmatter) {
        const match = lines[i].match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          // 处理数组格式
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
          }
          frontmatter[key] = value;
        }
      }
    }
    
    // 提取正文中的H2标题
    const body = lines.slice(bodyStart).join('\n');
    const h2s = [];
    const h2Regex = /^## (.+)$/gm;
    let match;
    while ((match = h2Regex.exec(body)) !== null) {
      h2s.push(match[1].trim());
    }
    
    return {
      filename,
      slug: frontmatter.slug || filename.replace('.md', ''),
      title: frontmatter.title || '',
      date: frontmatter.date || new Date().toISOString(),
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      h2s,
      category: frontmatter.category || 'general'
    };
  });
}

// 计算两篇文章的相关性分数
function calculateRelevance(post1, post2) {
  let score = 0;
  let reasons = [];
  
  // 1. 标签重叠（权重：40%）
  const tagOverlap = post1.tags.filter(t => post2.tags.includes(t));
  if (tagOverlap.length > 0) {
    const tagScore = (tagOverlap.length / Math.max(post1.tags.length, post2.tags.length)) * 40;
    score += tagScore;
    reasons.push(`标签重叠: ${tagOverlap.join(', ')}`);
  }
  
  // 2. 分类相同（权重：30%）
  if (post1.category === post2.category) {
    score += 30;
    reasons.push(`同分类: ${post1.category}`);
  }
  
  // 3. H2标题关键词重叠（权重：20%）
  const h2Keywords1 = extractKeywords(post1.h2s.join(' '));
  const h2Keywords2 = extractKeywords(post2.h2s.join(' '));
  const h2Overlap = h2Keywords1.filter(k => h2Keywords2.includes(k));
  if (h2Overlap.length > 0) {
    const h2Score = (h2Overlap.length / Math.max(h2Keywords1.length, h2Keywords2.length)) * 20;
    score += h2Score;
    reasons.push(`H2关键词重叠: ${h2Overlap.slice(0, 3).join(', ')}`);
  }
  
  // 4. 发布时间相近（权重：10%）- 30天内
  const date1 = new Date(post1.date);
  const date2 = new Date(post2.date);
  const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
  if (daysDiff <= 30) {
    const dateScore = (1 - daysDiff / 30) * 10;
    score += dateScore;
    reasons.push(`发布时间相近: ${Math.round(daysDiff)}天`);
  }
  
  return { score, reasons };
}

// 提取关键词
function extractKeywords(text) {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'must', 'shall', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against',
    'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'until',
    'while', 'and', 'but', 'or', 'if', 'that', 'this', 'it', 'its', 'you', 'your', 'we', 'our', 'they',
    'their', 'he', 'she', 'him', 'her', 'i', 'my', 'me', 'for', 'how', 'what', 'which', 'who', 'whom']);
  
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  return words.filter(w => !stopWords.has(w));
}

// 生成内链推荐
function generateInternalLinks(posts) {
  const recommendations = {};
  
  // 构建链接图，用于检测环形链接
  const linkGraph = {};
  
  for (const post of posts) {
    // 计算与所有其他文章的相关性
    const candidates = posts
      .filter(p => p.slug !== post.slug)
      .map(p => ({
        post: p,
        ...calculateRelevance(post, p)
      }))
      .filter(c => c.score > 20) // 只保留相关性>20的
      .sort((a, b) => b.score - a.score);
    
    // 选择3-5篇推荐文章
    const selected = [];
    const usedTags = new Set(post.tags);
    
    for (const candidate of candidates) {
      if (selected.length >= 5) break;
      
      // 避免同主题互链：如果标签完全相同，降低优先级
      const tagOverlap = candidate.post.tags.filter(t => usedTags.has(t));
      if (tagOverlap.length === candidate.post.tags.length && candidate.post.tags.length > 0) {
        // 标签完全相同，跳过（避免同主题互链）
        continue;
      }
      
      // 避免环形链接：检查是否已经链接到当前文章
      if (linkGraph[candidate.post.slug] && 
          linkGraph[candidate.post.slug].includes(post.slug)) {
        continue; // 跳过，避免A→B→A
      }
      
      selected.push({
        slug: candidate.post.slug,
        title: candidate.post.title,
        score: candidate.score,
        reasons: candidate.reasons
      });
      
      // 标记已使用的标签
      candidate.post.tags.forEach(t => usedTags.add(t));
    }
    
    recommendations[post.slug] = {
      title: post.title,
      links: selected,
      count: selected.length
    };
    
    // 更新链接图
    linkGraph[post.slug] = selected.map(s => s.slug);
  }
  
  return recommendations;
}

// 分析内链网络结构
function analyzeLinkNetwork(recommendations) {
  const stats = {
    totalArticles: Object.keys(recommendations).length,
    totalLinks: 0,
    avgLinksPerArticle: 0,
    hubArticles: [], // 中心文章（被链接次数多）
    isolatedArticles: [], // 孤立文章（没有被链接）
    circularLinks: [] // 环形链接
  };
  
  // 统计每篇文章被链接次数
  const linkCounts = {};
  for (const [slug, rec] of Object.entries(recommendations)) {
    linkCounts[slug] = linkCounts[slug] || 0;
    stats.totalLinks += rec.links.length;
    
    for (const link of rec.links) {
      linkCounts[link.slug] = (linkCounts[link.slug] || 0) + 1;
    }
  }
  
  stats.avgLinksPerArticle = stats.totalLinks / stats.totalArticles;
  
  // 找出中心文章和孤立文章
  for (const [slug, count] of Object.entries(linkCounts)) {
    if (count >= 5) {
      stats.hubArticles.push({ slug, count, title: recommendations[slug]?.title });
    } else if (count === 0) {
      stats.isolatedArticles.push({ slug, title: recommendations[slug]?.title });
    }
  }
  
  // 检测环形链接
  for (const [slug1, rec1] of Object.entries(recommendations)) {
    for (const link1 of rec1.links) {
      const rec2 = recommendations[link1.slug];
      if (rec2) {
        const hasBackLink = rec2.links.some(l => l.slug === slug1);
        if (hasBackLink) {
          stats.circularLinks.push([slug1, link1.slug]);
        }
      }
    }
  }
  
  return stats;
}

// 主函数
function main() {
  console.log('🔗 开始生成内链策略...\n');
  
  const posts = getAllBlogPosts();
  console.log(`📚 找到 ${posts.length} 篇文章\n`);
  
  const recommendations = generateInternalLinks(posts);
  const stats = analyzeLinkNetwork(recommendations);
  
  console.log('📊 内链网络统计：');
  console.log(`  - 总文章数: ${stats.totalArticles}`);
  console.log(`  - 总链接数: ${stats.totalLinks}`);
  console.log(`  - 平均每篇链接: ${stats.avgLinksPerArticle.toFixed(1)}`);
  console.log(`  - 中心文章: ${stats.hubArticles.length}`);
  console.log(`  - 孤立文章: ${stats.isolatedArticles.length}`);
  console.log(`  - 环形链接: ${stats.circularLinks.length}\n`);
  
  if (stats.hubArticles.length > 0) {
    console.log('🎯 中心文章（被链接次数≥5）：');
    stats.hubArticles.slice(0, 5).forEach(hub => {
      console.log(`  - ${hub.title} (${hub.count}次)`);
    });
    console.log('');
  }
  
  if (stats.isolatedArticles.length > 0) {
    console.log('⚠️  孤立文章（没有被链接）：');
    stats.isolatedArticles.slice(0, 5).forEach(iso => {
      console.log(`  - ${iso.title}`);
    });
    console.log('');
  }
  
  // 保存报告
  const reportDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    statistics: stats,
    recommendations
  };
  
  const reportPath = path.join(reportDir, 'internal-link-recommendations.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 报告已保存到: ${reportPath}`);
  
  // 输出示例
  console.log('\n📝 示例推荐（前3篇）：');
  const sampleSlugs = Object.keys(recommendations).slice(0, 3);
  for (const slug of sampleSlugs) {
    const rec = recommendations[slug];
    console.log(`\n${rec.title}:`);
    rec.links.forEach((link, idx) => {
      console.log(`  ${idx + 1}. ${link.title} (相关度: ${link.score.toFixed(1)})`);
      link.reasons.forEach(reason => {
        console.log(`     - ${reason}`);
      });
    });
  }
}

main();
