const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const INDEXING_API_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const BLOG_POSTS_DIR = path.join(__dirname, '..', 'data', 'blog-posts');
const INDEXED_URLS_PATH = path.join(__dirname, '..', 'reports', 'indexed-urls.json');
const SITE_URL = 'https://tryaiwriter.com';

async function ensureReportsDir() {
    const reportsDir = path.dirname(INDEXED_URLS_PATH);
    try {
        await fs.access(reportsDir);
    } catch {
        await fs.mkdir(reportsDir, { recursive: true });
    }
}

async function loadIndexedUrls() {
    try {
        const content = await fs.readFile(INDEXED_URLS_PATH, 'utf8');
        return new Set(JSON.parse(content));
    } catch {
        return new Set();
    }
}

async function saveIndexedUrls(urls) {
    await ensureReportsDir();
    await fs.writeFile(INDEXED_URLS_PATH, JSON.stringify([...urls], null, 2), 'utf8');
}

async function getTodayNewPosts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const files = await fs.readdir(BLOG_POSTS_DIR);
    const newPosts = [];

    for (const file of files) {
        if (file.endsWith('.md')) {
            const filePath = path.join(BLOG_POSTS_DIR, file);
            const stat = await fs.stat(filePath);
            const mtime = stat.mtime.getTime();
            
            if (mtime >= todayStart) {
                const slug = file.replace('.md', '');
                const url = `${SITE_URL}/blog/${slug}`;
                newPosts.push({ url, file, mtime });
            }
        }
    }

    return newPosts.sort((a, b) => b.mtime - a.mtime);
}

function base64urlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function createJwt(credentials) {
    const header = base64urlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    
    const now = Math.floor(Date.now() / 1000);
    const payload = base64urlEncode(JSON.stringify({
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/indexing',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    }));

    const sign = crypto.createSign('RSA-SHA256');
    sign.write(`${header}.${payload}`);
    sign.end();
    
    const signature = sign.sign(credentials.private_key, 'base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${header}.${payload}.${signature}`;
}

async function getAccessToken(credentials) {
    const jwt = createJwt(credentials);
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    const data = await response.json();
    if (!data.access_token) {
        throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
    }
    return data.access_token;
}

async function submitUrl(accessToken, url) {
    const response = await fetch(INDEXING_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            url: url,
            type: 'URL_UPDATED'
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error?.message || JSON.stringify(data)}`);
    }
    return data;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function printConfigGuide() {
    console.log('\n========================================');
    console.log('Google Indexing API 配置指南');
    console.log('========================================');
    console.log('');
    console.log('1. 在 Google Cloud Console 创建项目');
    console.log('2. 启用 Indexing API');
    console.log('3. 创建服务账号并下载 JSON 密钥');
    console.log('4. 在 Google Search Console 授权服务账号邮箱');
    console.log('5. 配置环境变量:');
    console.log('   - 方法一: 设置 GOOGLE_INDEXING_CREDENTIALS_JSON 环境变量');
    console.log('   - 方法二: 将 JSON 密钥保存为项目根目录的 credentials.json');
    console.log('');
    console.log('详细指南: docs/GOOGLE_INDEXING_SETUP.md');
    console.log('========================================\n');
}

async function getCredentials() {
    let credentialsJson;

    if (process.env.GOOGLE_INDEXING_CREDENTIALS_JSON) {
        credentialsJson = process.env.GOOGLE_INDEXING_CREDENTIALS_JSON;
    } else {
        const credentialsPath = path.join(__dirname, '..', 'credentials.json');
        try {
            credentialsJson = await fs.readFile(credentialsPath, 'utf8');
        } catch {
            return null;
        }
    }

    try {
        return JSON.parse(credentialsJson);
    } catch {
        console.error('❌ 凭证 JSON 格式无效');
        return null;
    }
}

async function main() {
    const isDryRun = process.argv.includes('--dry-run');
    
    console.log(`\n🚀 Google Indexing API 自动提交脚本`);
    console.log(`模式: ${isDryRun ? '🔍 模拟运行 (Dry Run)' : '✅ 实际提交'}`);
    console.log('----------------------------------------');

    const credentials = await getCredentials();
    if (!credentials) {
        console.error('❌ 未找到有效的 Google 服务账号凭证');
        printConfigGuide();
        process.exit(1);
    }

    const todayPosts = await getTodayNewPosts();
    console.log(`📄 今日新增博客文章: ${todayPosts.length} 篇`);

    if (todayPosts.length === 0) {
        console.log('✅ 没有需要提交的新文章');
        process.exit(0);
    }

    const indexedUrls = await loadIndexedUrls();
    const newUrls = todayPosts.filter(post => !indexedUrls.has(post.url));
    
    console.log(`🔍 已提交过的 URL: ${indexedUrls.size} 个`);
    console.log(`📤 需要提交的新 URL: ${newUrls.length} 个`);

    if (newUrls.length === 0) {
        console.log('✅ 所有新文章都已提交过');
        process.exit(0);
    }

    if (isDryRun) {
        console.log('\n📋 待提交的 URL 列表:');
        newUrls.forEach((post, index) => {
            console.log(`${index + 1}. ${post.url}`);
        });
        console.log('\n⚠️ 模拟运行结束，未实际提交任何 URL');
        process.exit(0);
    }

    let accessToken;
    try {
        console.log('\n🔐 获取访问令牌...');
        accessToken = await getAccessToken(credentials);
        console.log('✅ 访问令牌获取成功');
    } catch (error) {
        console.error('❌ 获取访问令牌失败:', error.message);
        process.exit(1);
    }

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < newUrls.length; i++) {
        const post = newUrls[i];
        
        console.log(`\n📤 提交 ${i + 1}/${newUrls.length}: ${post.url}`);
        
        try {
            const result = await submitUrl(accessToken, post.url);
            console.log(`✅ 提交成功: ${result.urlNotificationMetadata.url}`);
            
            indexedUrls.add(post.url);
            await saveIndexedUrls(indexedUrls);
            successCount++;
        } catch (error) {
            console.error(`❌ 提交失败: ${error.message}`);
            failureCount++;
        }

        if (i < newUrls.length - 1) {
            console.log('⏳ 等待 1 秒 (速率限制)...');
            await delay(1000);
        }
    }

    console.log('\n========================================');
    console.log(`📊 提交完成: ${successCount} 成功, ${failureCount} 失败`);
    console.log('========================================');
}

main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
});