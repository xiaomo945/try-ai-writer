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

// 分析主题分布
function analyzeTopicDistribution(posts) {
  const distribution = {
    byTags: {},
    byCategory: {},
    byH2Keywords: {},
    totalPosts: posts.length
  };
  
  // 按标签统计
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!distribution.byTags[tag]) {
        distribution.byTags[tag] = {
          count: 0,
          posts: []
        };
      }
      distribution.byTags[tag].count++;
      distribution.byTags[tag].posts.push({
        slug: post.slug,
        title: post.title,
        date: post.date
      });
    }
  }
  
  // 按分类统计
  for (const post of posts) {
    const cat = post.category || 'general';
    if (!distribution.byCategory[cat]) {
      distribution.byCategory[cat] = {
        count: 0,
        posts: []
      };
    }
    distribution.byCategory[cat].count++;
    distribution.byCategory[cat].posts.push({
      slug: post.slug,
      title: post.title,
      date: post.date
    });
  }
  
  // 按H2关键词统计
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'must', 'shall', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against',
    'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'until',
    'while', 'and', 'but', 'or', 'if', 'that', 'this', 'it', 'its', 'you', 'your', 'we', 'our', 'they',
    'their', 'he', 'she', 'him', 'her', 'i', 'my', 'me', 'for', 'how', 'what', 'which', 'who', 'whom']);
  
  for (const post of posts) {
    const h2Text = post.h2s.join(' ');
    const words = h2Text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const keywords = words.filter(w => !stopWords.has(w));
    
    for (const keyword of keywords) {
      if (!distribution.byH2Keywords[keyword]) {
        distribution.byH2Keywords[keyword] = {
          count: 0,
          posts: []
        };
      }
      distribution.byH2Keywords[keyword].count++;
      if (distribution.byH2Keywords[keyword].posts.length < 5) {
        distribution.byH2Keywords[keyword].posts.push({
          slug: post.slug,
          title: post.title
        });
      }
    }
  }
  
  return distribution;
}

// 识别主题缺口
function identifyTopicGaps(distribution) {
  const gaps = {
    overCovered: [], // 过度覆盖（>10篇）
    underCovered: [], // 覆盖不足（<3篇）
    wellCovered: [] // 覆盖良好
  };
  
  // 分析标签覆盖
  for (const [tag, data] of Object.entries(distribution.byTags)) {
    if (data.count > 10) {
      gaps.overCovered.push({
        topic: tag,
        count: data.count,
        type: 'tag',
        recommendation: `该主题已有${data.count}篇文章，建议减少或从新角度撰写`
      });
    } else if (data.count < 3) {
      gaps.underCovered.push({
        topic: tag,
        count: data.count,
        type: 'tag',
        recommendation: `该主题仅有${data.count}篇文章，建议增加内容`
      });
    } else {
      gaps.wellCovered.push({
        topic: tag,
        count: data.count,
        type: 'tag'
      });
    }
  }
  
  // 按数量排序
  gaps.overCovered.sort((a, b) => b.count - a.count);
  gaps.underCovered.sort((a, b) => a.count - b.count);
  
  return gaps;
}

// 生成主题建议
function generateTopicSuggestions(gaps, distribution) {
  const suggestions = [];
  
  // 1. 优先填补覆盖不足的主题
  for (const gap of gaps.underCovered) {
    suggestions.push({
      priority: 'high',
      topic: gap.topic,
      reason: `当前仅有${gap.count}篇文章`,
      action: `建议撰写2-3篇关于"${gap.topic}"的文章`,
      angle: getTopicAngle(gap.topic)
    });
  }
  
  // 2. 对于过度覆盖的主题，建议新角度
  for (const gap of gaps.overCovered) {
    suggestions.push({
      priority: 'medium',
      topic: gap.topic,
      reason: `已有${gap.count}篇文章，内容可能重复`,
      action: `如需继续撰写，建议从以下角度切入`,
      angle: getAlternativeAngle(gap.topic, distribution)
    });
  }
  
  // 3. 识别新兴主题（基于H2关键词）
  const emergingTopics = findEmergingTopics(distribution);
  for (const topic of emergingTopics) {
    suggestions.push({
      priority: 'low',
      topic: topic.keyword,
      reason: `新兴话题，近期文章频繁提及`,
      action: `建议撰写专题文章`,
      angle: topic.suggestion
    });
  }
  
  return suggestions;
}

// 获取主题角度建议
function getTopicAngle(topic) {
  const angles = {
    'tutorial': '实战教程、步骤详解',
    'guide': '完整指南、从入门到精通',
    'tips': '实用技巧、最佳实践',
    'comparison': '工具对比、优劣分析',
    'case-study': '案例分析、真实应用',
    'trend': '趋势预测、未来展望',
    'tool': '工具评测、使用体验'
  };
  
  return angles[topic.toLowerCase()] || '从实际应用角度出发';
}

// 获取替代角度
function getAlternativeAngle(topic, distribution) {
  const angles = [
    '从初学者视角重新解读',
    '结合最新趋势更新内容',
    '深入技术细节的高级教程',
    '真实案例与成功经验',
    '常见错误与避坑指南',
    '与其他工具的对比分析',
    '行业专家访谈与见解'
  ];
  
  // 随机选择2-3个角度
  const selected = [];
  const shuffled = angles.sort(() => 0.5 - Math.random());
  for (let i = 0; i < 3 && i < shuffled.length; i++) {
    selected.push(shuffled[i]);
  }
  
  return selected;
}

// 发现新兴话题
function findEmergingTopics(distribution) {
  const emerging = [];
  
  // 找出近期（最近3个月）频繁出现的关键词
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  for (const [keyword, data] of Object.entries(distribution.byH2Keywords)) {
    if (data.count >= 3 && data.count <= 8) {
      // 检查是否都是近期文章
      const recentPosts = data.posts.filter(p => {
        const post = distribution.byTags[Object.keys(distribution.byTags).find(t => 
          distribution.byTags[t].posts.some(pp => pp.slug === p.slug)
        )]?.posts.find(pp => pp.slug === p.slug);
        return post && new Date(post.date) >= threeMonthsAgo;
      });
      
      if (recentPosts.length >= 2) {
        emerging.push({
          keyword,
          count: data.count,
          suggestion: `围绕"${keyword}"撰写专题系列`
        });
      }
    }
  }
  
  return emerging.sort((a, b) => b.count - a.count).slice(0, 5);
}

// 主函数
function main() {
  console.log('📊 开始分析主题多样性...\n');
  
  const posts = getAllBlogPosts();
  console.log(`📚 找到 ${posts.length} 篇文章\n`);
  
  const distribution = analyzeTopicDistribution(posts);
  const gaps = identifyTopicGaps(distribution);
  const suggestions = generateTopicSuggestions(gaps, distribution);
  
  console.log('📈 主题分布统计：');
  console.log(`  - 标签总数: ${Object.keys(distribution.byTags).length}`);
  console.log(`  - 分类总数: ${Object.keys(distribution.byCategory).length}`);
  console.log(`  - H2关键词数: ${Object.keys(distribution.byH2Keywords).length}\n`);
  
  console.log('⚠️  主题缺口分析：');
  console.log(`  - 过度覆盖（>10篇）: ${gaps.overCovered.length} 个主题`);
  console.log(`  - 覆盖不足（<3篇）: ${gaps.underCovered.length} 个主题`);
  console.log(`  - 覆盖良好: ${gaps.wellCovered.length} 个主题\n`);
  
  if (gaps.overCovered.length > 0) {
    console.log('🔴 过度覆盖的主题：');
    gaps.overCovered.slice(0, 5).forEach(gap => {
      console.log(`  - ${gap.topic}: ${gap.count}篇文章`);
    });
    console.log('');
  }
  
  if (gaps.underCovered.length > 0) {
    console.log('🟢 覆盖不足的主题（建议优先填补）：');
    gaps.underCovered.slice(0, 5).forEach(gap => {
      console.log(`  - ${gap.topic}: 仅${gap.count}篇文章`);
    });
    console.log('');
  }
  
  console.log('💡 主题建议（前5条）：');
  suggestions.slice(0, 5).forEach((sug, idx) => {
    console.log(`\n${idx + 1}. [${sug.priority.toUpperCase()}] ${sug.topic}`);
    console.log(`   原因: ${sug.reason}`);
    console.log(`   行动: ${sug.action}`);
    if (Array.isArray(sug.angle)) {
      console.log(`   角度建议:`);
      sug.angle.forEach(a => console.log(`     - ${a}`));
    } else {
      console.log(`   角度: ${sug.angle}`);
    }
  });
  
  // 保存报告
  const reportDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    totalPosts: posts.length,
    distribution,
    gaps,
    suggestions
  };
  
  const reportPath = path.join(reportDir, 'topic-diversity-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 报告已保存到: ${reportPath}`);
}

main();
