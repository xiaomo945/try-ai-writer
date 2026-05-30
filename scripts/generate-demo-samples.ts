/**
 * Digital Twin Demo Sample Generator
 * 
 * This script reads seed blog posts from data/blog-posts/
 * and generates a structured JSON file for demonstrating
 * the brand voice learning system capabilities.
 */

import * as fs from 'fs';
import * as path from 'path';

interface BlogPost {
  title: string;
  date: string;
  tags: string[];
  author: string;
  content: string;
  slug: string;
}

interface DemoSample {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  wordCount: number;
}

interface BrandVoiceProfile {
  tone: {
    formality: number;
    sentiment: "positive" | "neutral" | "negative";
    pace: "fast" | "moderate" | "slow";
  };
  industry: string;
  commonPhrases: string[];
  avgSentenceLength: number;
  avgParagraphLength: number;
  vocabularyStyle: string[];
}

interface DemoData {
  generatedAt: string;
  source: string;
  profile: BrandVoiceProfile;
  samples: DemoSample[];
  styleMatchScore: {
    overall: number;
    tone: number;
    vocabulary: number;
    structure: number;
  };
}

function parseFrontMatter(content: string): { frontMatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontMatter: {}, body: content };
  }
  
  const frontMatterText = match[1] ?? '';
  const body = match[2]?.trim() ?? '';
  
  const frontMatter: Record<string, unknown> = {};
  const lines = frontMatterText.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1);
        frontMatter[key] = value.split(',').map(v => v.trim().replace(/"/g, ''));
      } else {
        frontMatter[key] = value.replace(/"/g, '');
      }
    }
  }
  
  return { frontMatter, body };
}

function extractExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown headers and formatting
  const cleanContent = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  const truncated = cleanContent.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.slice(0, lastSpace) + '...';
}

function analyzeTone(content: string): { formality: number; sentiment: "positive" | "neutral" | "negative"; pace: "fast" | "moderate" | "slow" } {
  const lowerContent = content.toLowerCase();
  
  // Formality analysis
  const formalWords = ['therefore', 'furthermore', 'moreover', 'consequently', 'accordingly'];
  const informalWords = ['gonna', 'wanna', 'kinda', 'stuff', 'things', 'awesome'];
  
  let formalCount = 0;
  let informalCount = 0;
  
  for (const word of formalWords) {
    if (lowerContent.includes(word)) formalCount++;
  }
  for (const word of informalWords) {
    if (lowerContent.includes(word)) informalCount++;
  }
  
  const formality = Math.min(100, Math.max(0, 50 + (formalCount - informalCount) * 10));
  
  // Sentiment analysis
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'success', 'effective'];
  const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'fail', 'problem', 'difficult'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    positiveCount += (lowerContent.match(regex) || []).length;
  }
  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    negativeCount += (lowerContent.match(regex) || []).length;
  }
  
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveCount > negativeCount * 1.5) sentiment = "positive";
  else if (negativeCount > positiveCount * 1.5) sentiment = "negative";
  
  // Pace analysis (based on sentence length)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  
  let pace: "fast" | "moderate" | "slow" = "moderate";
  if (avgSentenceLength < 15) pace = "fast";
  else if (avgSentenceLength > 25) pace = "slow";
  
  return { formality, sentiment, pace };
}

function extractCommonPhrases(content: string): string[] {
  const lowerContent = content.toLowerCase();
  
  // Common phrases in content marketing/AI writing context
  const candidatePhrases = [
    'content creation',
    'brand voice',
    'ai writing',
    'artificial intelligence',
    'content strategy',
    'writing tools',
    'productivity',
    'workflow',
    'consistency',
    'authenticity',
    'engagement',
    'audience',
    'quality content',
    'best practices',
    'key benefits',
    'in conclusion',
    'maintain consistency',
    'human creativity',
    'strategic approach',
    'comprehensive guide'
  ];
  
  const found: string[] = [];
  for (const phrase of candidatePhrases) {
    if (lowerContent.includes(phrase)) {
      found.push(phrase);
    }
  }
  
  return found.slice(0, 10);
}

function calculateAvgMetrics(contents: string[]): { avgSentenceLength: number; avgParagraphLength: number } {
  let totalSentences = 0;
  let totalWords = 0;
  let totalParagraphs = 0;
  
  for (const content of contents) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    totalSentences += sentences.length;
    totalWords += words.length;
    totalParagraphs += paragraphs.length;
  }
  
  const avgSentenceLength = totalSentences > 0 ? totalWords / totalSentences : 0;
  const avgParagraphLength = totalParagraphs > 0 ? totalWords / totalParagraphs : 0;
  
  return { avgSentenceLength, avgParagraphLength };
}

function generateDemoData(posts: BlogPost[]): DemoData {
  const allContent = posts.map(p => p.content).join('\n\n');
  const tone = analyzeTone(allContent);
  const commonPhrases = extractCommonPhrases(allContent);
  const metrics = calculateAvgMetrics(posts.map(p => p.content));
  
  const samples: DemoSample[] = posts.map((post, index) => ({
    id: `demo-${index + 1}`,
    title: post.title,
    excerpt: extractExcerpt(post.content),
    tags: post.tags,
    date: post.date,
    wordCount: post.content.split(/\s+/).filter(w => w.length > 0).length,
  }));
  
  // Calculate simulated style match scores
  const baseScore = 75 + Math.floor(Math.random() * 15);
  
  return {
    generatedAt: new Date().toISOString(),
    source: "data/blog-posts/",
    profile: {
      tone,
      industry: "Content Marketing & AI Technology",
      commonPhrases,
      avgSentenceLength: Math.round(metrics.avgSentenceLength * 10) / 10,
      avgParagraphLength: Math.round(metrics.avgParagraphLength * 10) / 10,
      vocabularyStyle: [
        "Professional yet approachable",
        "Action-oriented",
        "Educational",
        "Conversational"
      ]
    },
    samples,
    styleMatchScore: {
      overall: baseScore,
      tone: Math.min(100, baseScore + Math.floor(Math.random() * 10 - 5)),
      vocabulary: Math.min(100, baseScore + Math.floor(Math.random() * 10 - 5)),
      structure: Math.min(100, baseScore + Math.floor(Math.random() * 10 - 5)),
    }
  };
}

function main(): void {
  const blogPostsDir = path.join(process.cwd(), 'data', 'blog-posts');
  const outputDir = path.join(process.cwd(), 'public', 'demo');
  const outputFile = path.join(outputDir, 'brand-voice-samples.json');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Read all markdown files
  const files = fs.readdirSync(blogPostsDir).filter(f => f.endsWith('.md'));
  
  if (files.length === 0) {
    console.error('No blog post files found in data/blog-posts/');
    process.exit(1);
  }
  
  console.log(`Found ${files.length} blog post files`);
  
  const posts: BlogPost[] = [];
  
  for (const file of files) {
    const filePath = path.join(blogPostsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontMatter, body } = parseFrontMatter(content);
    
    posts.push({
      title: frontMatter.title as string || 'Untitled',
      date: ((frontMatter.date as string) || new Date().toISOString().split('T')[0]) ?? '',
      tags: (frontMatter.tags as string[]) || [],
      author: frontMatter.author as string || 'Try AI Writer',
      content: body,
      slug: file.replace('.md', ''),
    });
  }
  
  // Generate demo data
  const demoData = generateDemoData(posts);
  
  // Write output
  fs.writeFileSync(outputFile, JSON.stringify(demoData, null, 2));
  
  console.log('\n✅ Demo samples generated successfully!');
  console.log(`📁 Output: ${outputFile}`);
  console.log(`\n📊 Summary:`);
  console.log(`  - Source files: ${files.length}`);
  console.log(`  - Generated samples: ${demoData.samples.length}`);
  console.log(`  - Industry: ${demoData.profile.industry}`);
  console.log(`  - Tone: ${demoData.profile.tone.sentiment} (formality: ${demoData.profile.tone.formality}%)`);
  console.log(`  - Common phrases: ${demoData.profile.commonPhrases.length}`);
  console.log(`  - Style match score: ${demoData.styleMatchScore.overall}%`);
}

main();
