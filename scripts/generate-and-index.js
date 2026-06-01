const { spawn } = require('child_process');
const path = require('path');

async function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { 
            cwd: cwd || process.cwd(),
            stdio: 'inherit',
            shell: true
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`${command} exited with code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function main() {
    const startTime = Date.now();
    
    console.log('\n========================================');
    console.log('📝 文章生成并自动提交 Google Indexing API');
    console.log('========================================');
    console.log(`开始时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('----------------------------------------');

    const generateScript = process.argv[2];
    
    try {
        console.log('\n🚀 第一步: 运行文章生成脚本');
        
        if (generateScript) {
            console.log(`执行脚本: ${generateScript}`);
            await runCommand('node', [generateScript], process.cwd());
        } else {
            console.log('⚠️ 未指定生成脚本，跳过生成步骤');
        }

        console.log('\n✅ 文章生成步骤完成');
        console.log('----------------------------------------');

        console.log('\n🚀 第二步: 提交新文章到 Google Indexing API');
        
        const autoIndexPath = path.join(__dirname, 'auto-index.js');
        await runCommand('node', [autoIndexPath], process.cwd());

        console.log('\n✅ Google Indexing API 提交步骤完成');
        console.log('----------------------------------------');

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        console.log('\n========================================');
        console.log('🎉 文章生成与提交流程全部完成');
        console.log(`总耗时: ${duration} 秒`);
        console.log('========================================');

    } catch (error) {
        console.error('\n❌ 流程执行失败:', error.message);
        process.exit(1);
    }
}

main();