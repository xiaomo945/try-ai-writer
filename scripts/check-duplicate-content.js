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
    
    // 提取正文
    const body = lines.slice(bodyStart).join('\n');
    
    // 提取H2标题
    const h2s = [];
    const h2Regex = /^## (.+)$/gm;
    let match;
    while ((match = h2Regex.exec(body)) !== null) {
      h2s.push(match[1].trim());
    }
    
    // 提取关键短语（前500字符中的名词短语）
    const firstParagraph = body.substring(0, 500);
    const phrases = extractKeyPhrases(firstParagraph);
    
    return {
      filename,
      slug: frontmatter.slug || filename.replace('.md', ''),
      title: frontmatter.title || '',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      h2s: h2s.slice(0, 3), // 前3个H2
      phrases,
      body: body.substring(0, 1000) // 只取前1000字符用于比较
    };
  });
}

// 提取关键短语
function extractKeyPhrases(text) {
  // 简单的关键词提取：去除常见词，提取2-3词短语
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'must', 'shall', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against',
    'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'until',
    'while', 'and', 'but', 'or', 'if', 'that', 'this', 'it', 'its', 'you', 'your', 'we', 'our', 'they',
    'their', 'he', 'she', 'him', 'her', 'i', 'my', 'me']);
  
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const filtered = words.filter(w => !stopWords.has(w));
  
  // 提取2-3词组合
  const phrases = new Set();
  for (let i = 0; i < filtered.length - 1; i++) {
    phrases.add(`${filtered[i]} ${filtered[i + 1]}`);
    if (i < filtered.length - 2) {
      phrases.add(`${filtered[i]} ${filtered[i + 1]} ${filtered[i + 2]}`);
    }
  }
  
  return Array.from(phrases).slice(0, 10);
}

// 计算字符串相似度（Jaccard相似度）
function similarity(set1, set2) {
  const s1 = new Set(set1);
  const s2 = new Set(set2);
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// 计算标题相似度
function titleSimilarity(title1, title2) {
  const words1 = title1.toLowerCase().split(/\s+/);
  const words2 = title2.toLowerCase().split(/\s+/);
  return similarity(words1, words2);
}

// 检查重复
function checkDuplicates(posts) {
  const duplicates = [];
  
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const post1 = posts[i];
      const post2 = posts[j];
      
      const issues = [];
      let maxScore = 0;
      
      // 1. 标题完全相同
      if (post1.title.toLowerCase() === post2.title.toLowerCase()) {
        issues.push({
          type: '严重重复',
          detail: '标题完全相同',
          score: 100
        });
        maxScore = 100;
      }
      
      // 2. 标题相似度>80%
      const titleSim = titleSimilarity(post1.title, post2.title);
      if (titleSim > 0.8 && maxScore < 100) {
        issues.push({
          type: '高度相似',
          detail: `标题相似度 ${(titleSim * 100).toFixed(1)}%`,
          score: titleSim * 100
        });
        maxScore = Math.max(maxScore, titleSim * 100);
      }
      
      // 3. H2标题重叠>60%
      const h2Sim = similarity(post1.h2s, post2.h2s);
      if (h2Sim > 0.6) {
        issues.push({
          type: '内容结构相似',
          detail: `H2标题重叠 ${(h2Sim * 100).toFixed(1)}%`,
          score: h2Sim * 100
        });
        maxScore = Math.max(maxScore, h2Sim * 100);
      }
      
      // 4. 关键短语重叠>50%
      const phraseSim = similarity(post1.phrases, post2.phrases);
      if (phraseSim > 0.5) {
        issues.push({
          type: '主题重叠',
          detail: `关键短语重叠 ${(phraseSim * 100).toFixed(1)}%`,
          score: phraseSim * 100
        });
        maxScore = Math.max(maxScore, phraseSim * 100);
      }
      
      // 5. 标签重叠
      const tagSim = similarity(post1.tags, post2.tags);
      if (tagSim > 0.7) {
        issues.push({
          type: '标签高度重叠',
          detail: `标签重叠 ${(tagSim * 100).toFixed(1)}%`,
          score: tagSim * 100
        });
        maxScore = Math.max(maxScore, tagSim * 100);
      }
      
      if (issues.length > 0) {
        duplicates.push({
          post1: {
            slug: post1.slug,
            title: post1.title,
            filename: post1.filename
          },
          post2: {
            slug: post2.slug,
            title: post2.title,
            filename: post2.filename
          },
          issues,
          maxScore,
          recommendation: getRecommendation(maxScore, issues)
        });
      }
    }
  }
  
  // 按相似度排序
  duplicates.sort((a, b) => b.maxScore - a.maxScore);
  
  return duplicates;
}

// 获取建议操作
function getRecommendation(score, issues) {
  if (score >= 100) {
    return '删除或合并：存在完全重复的内容';
  } else if (score >= 80) {
    return '重写：内容高度相似，建议从不同角度重新撰写';
  } else if (score >= 60) {
    return '调整：内容结构或主题有较多重叠，建议调整大纲';
  } else {
    return '监控：存在一定相似性，建议关注';
  }
}

// 主函数
function main() {
  console.log('🔍 开始检查博客内容重复...\n');
  
  const posts = getAllBlogPosts();
  console.log(`📚 找到 ${posts.length} 篇文章\n`);
  
  const duplicates = checkDuplicates(posts);
  
  // 统计
  const severe = duplicates.filter(d => d.maxScore >= 100);
  const high = duplicates.filter(d => d.maxScore >= 80 && d.maxScore < 100);
  const medium = duplicates.filter(d => d.maxScore >= 60 && d.maxScore < 80);
  const low = duplicates.filter(d => d.maxScore < 60);
  
  console.log('📊 检查结果统计：');
  console.log(`  - 严重重复（100%）: ${severe.length} 对`);
  console.log(`  - 高度相似（80-99%）: ${high.length} 对`);
  console.log(`  - 中度相似（60-79%）: ${medium.length} 对`);
  console.log(`  - 轻度相似（<60%）: ${low.length} 对`);
  console.log(`  - 总计发现问题: ${duplicates.length} 对\n`);
  
  // 输出详细报告
  if (duplicates.length > 0) {
    console.log('📝 详细报告：\n');
    duplicates.forEach((dup, idx) => {
      console.log(`${idx + 1}. [${dup.maxScore.toFixed(1)}%] ${dup.recommendation}`);
      console.log(`   文章1: ${dup.post1.title}`);
      console.log(`   文章2: ${dup.post2.title}`);
      dup.issues.forEach(issue => {
        console.log(`   - ${issue.type}: ${issue.detail}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ 未发现重复内容！');
  }
  
  // 保存报告
  const reportDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    totalPosts: posts.length,
    totalDuplicates: duplicates.length,
    statistics: {
      severe: severe.length,
      high: high.length,
      medium: medium.length,
      low: low.length
    },
    duplicates
  };
  
  const reportPath = path.join(reportDir, 'duplicate-content-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 报告已保存到: ${reportPath}`);
}

main();
