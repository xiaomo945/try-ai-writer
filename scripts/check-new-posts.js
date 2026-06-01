const fs = require('fs').promises;
const path = require('path');

const BLOG_POSTS_DIR = path.join(__dirname, '..', 'data', 'blog-posts');

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
                const url = `https://tryaiwriter.com/blog/${slug}`;
                newPosts.push({ url, file, mtime });
            }
        }
    }

    return newPosts.sort((a, b) => b.mtime - a.mtime);
}

async function main() {
    console.log('\n📚 检测今日新增博客文章');
    console.log('-------------------------------');
    
    const todayPosts = await getTodayNewPosts();
    
    console.log(`📄 今日新增文章: ${todayPosts.length} 篇\n`);
    
    if (todayPosts.length > 0) {
        console.log('前5篇文章:');
        todayPosts.slice(0, 5).forEach((post, index) => {
            console.log(`${index + 1}. ${post.url}`);
        });
        if (todayPosts.length > 5) {
            console.log(`\n... 还有 ${todayPosts.length - 5} 篇文章`);
        }
    }
}

main();