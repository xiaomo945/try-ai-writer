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
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
        } else {
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
    
    return {
      filename,
      slug: frontmatter.slug || filename.replace('.md', ''),
      title: frontmatter.title || '',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      category: frontmatter.category || 'general'
    };
  });
}

// 计算标题相似度
function titleSimilarity(title1, title2) {
  const words1 = title1.toLowerCase().split(/\s+/);
  const words2 = title2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// 检查标题重复
function checkTitleDuplicate(newTitle, existingPosts) {
  const issues = [];
  
  for (const post of existingPosts) {
    // 完全相同
    if (newTitle.toLowerCase() === post.title.toLowerCase()) {
      issues.push({
        severity: 'critical',
        message: `标题完全重复: "${post.title}"`,
        slug: post.slug,
        similarity: 100
      });
      continue;
    }
    
    // 高度相似（>80%）
    const similarity = titleSimilarity(newTitle, post.title);
    if (similarity > 0.8) {
      issues.push({
        severity: 'high',
        message: `标题高度相似 (${(similarity * 100).toFixed(1)}%): "${post.title}"`,
        slug: post.slug,
        similarity: similarity * 100
      });
    }
  }
  
  return issues;
}

// 检查主题覆盖
function checkTopicCoverage(newTags, existingPosts) {
  const tagCounts = {};
  
  // 统计现有文章的标签分布
  for (const post of existingPosts) {
    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  
  const issues = [];
  
  // 检查新文章的标签是否已被过度覆盖
  for (const tag of newTags) {
    const count = tagCounts[tag] || 0;
    if (count > 10) {
      issues.push({
        severity: 'medium',
        message: `标签 "${tag}" 已被过度覆盖（已有${count}篇文章）`,
        tag,
        count
      });
    }
  }
  
  return issues;
}

// 生成替代标题建议
function generateAlternativeTitles(newTitle, existingPosts) {
  const alternatives = [];
  
  // 提取原标题关键词
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'must', 'shall', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against',
    'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'until',
    'while', 'and', 'but', 'or', 'if', 'that', 'this', 'it', 'its', 'you', 'your', 'we', 'our', 'they',
    'their', 'he', 'she', 'him', 'her', 'i', 'my', 'me']);
  
  const words = newTitle.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const keywords = words.filter(w => !stopWords.has(w) && w.length > 3);
  
  // 生成不同角度的标题
  const angles = [
    { prefix: 'Complete Guide to', suffix: '' },
    { prefix: 'How to Master', suffix: ' in 2026' },
    { prefix: 'The Ultimate', suffix: ' Tutorial' },
    { prefix: '', suffix: ': Tips and Best Practices' },
    { prefix: '', suffix: ' - A Beginner\'s Guide' },
    { prefix: 'Advanced', suffix: ' Strategies' },
    { prefix: '', suffix: ' for Professionals' }
  ];
  
  const mainKeyword = keywords.slice(0, 3).join(' ');
  
  for (const angle of angles) {
    const title = `${angle.prefix} ${mainKeyword} ${angle.suffix}`.trim();
    
    // 检查是否与现有文章重复
    const isDuplicate = existingPosts.some(p => 
      titleSimilarity(title, p.title) > 0.7
    );
    
    if (!isDuplicate) {
      alternatives.push(title);
    }
  }
  
  return alternatives.slice(0, 5);
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node scripts/pre-generation-check.js <新文章标题>');
    console.log('示例: node scripts/pre-generation-check.js "AI Writing for Email Marketing"');
    process.exit(1);
  }
  
  const newTitle = args.join(' ');
  console.log(`🔍 检查新文章: "${newTitle}"\n`);
  
  const existingPosts = getAllBlogPosts();
  console.log(`📚 现有文章: ${existingPosts.length} 篇\n`);
  
  // 1. 检查标题重复
  console.log('📋 标题重复检查：');
  const titleIssues = checkTitleDuplicate(newTitle, existingPosts);
  
  if (titleIssues.length === 0) {
    console.log('  ✅ 标题无重复\n');
  } else {
    console.log('  ⚠️  发现以下问题：\n');
    titleIssues.forEach(issue => {
      const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡';
      console.log(`  ${icon} ${issue.message}`);
      console.log(`     相似度: ${issue.similarity.toFixed(1)}%`);
      console.log(`     文章: ${issue.slug}\n`);
    });
  }
  
  // 2. 检查主题覆盖（假设新文章使用标题中的关键词作为标签）
  console.log('📊 主题覆盖检查：');
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'must', 'shall', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against',
    'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'until',
    'while', 'and', 'but', 'or', 'if', 'that', 'this', 'it', 'its', 'you', 'your', 'we', 'our', 'they',
    'their', 'he', 'she', 'him', 'her', 'i', 'my', 'me']);
  
  const words = newTitle.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const potentialTags = words.filter(w => !stopWords.has(w) && w.length > 3);
  
  const topicIssues = checkTopicCoverage(potentialTags, existingPosts);
  
  if (topicIssues.length === 0) {
    console.log('  ✅ 主题覆盖良好\n');
  } else {
    console.log('  ⚠️  以下主题已被过度覆盖：\n');
    topicIssues.forEach(issue => {
      console.log(`  🟡 ${issue.message}`);
    });
    console.log('');
  }
  
  // 3. 生成建议
  console.log('💡 建议：');
  
  if (titleIssues.length > 0 || topicIssues.length > 0) {
    console.log('  ❌ 建议调整标题或角度\n');
    
    const alternatives = generateAlternativeTitles(newTitle, existingPosts);
    if (alternatives.length > 0) {
      console.log('  替代标题建议：');
      alternatives.forEach((alt, idx) => {
        console.log(`    ${idx + 1}. ${alt}`);
      });
    }
  } else {
    console.log('  ✅ 可以生成！标题和主题均无问题\n');
  }
  
  // 输出总结
  console.log('\n' + '='.repeat(60));
  if (titleIssues.length === 0 && topicIssues.length === 0) {
    console.log('✅ 检查结果: 通过 - 可以生成');
  } else {
    console.log('⚠️  检查结果: 需要调整');
    console.log(`   - 标题问题: ${titleIssues.length} 个`);
    console.log(`   - 主题问题: ${topicIssues.length} 个`);
  }
  console.log('='.repeat(60));
}

main();
