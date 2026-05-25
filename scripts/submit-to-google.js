const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

const INDEXING_API_SCOPE = 'https://www.googleapis.com/auth/indexing';
const SUBMITTED_URLS_LOG_PATH = path.join(__dirname, '..', '.tmp', 'submitted-urls.log');
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

async function ensureTmpDir() {
    try {
        await fs.access(path.dirname(SUBMITTED_URLS_LOG_PATH));
    } catch {
        await fs.mkdir(path.dirname(SUBMITTED_URLS_LOG_PATH), { recursive: true });
    }
}

async function getSubmittedUrls() {
    try {
        const content = await fs.readFile(SUBMITTED_URLS_LOG_PATH, 'utf8');
        return new Set(content.split('\n').filter(Boolean));
    } catch {
        return new Set();
    }
}

async function addSubmittedUrl(url) {
    await ensureTmpDir();
    await fs.appendFile(SUBMITTED_URLS_LOG_PATH, url + '\n', 'utf8');
}

async function getUrlsFromSitemap() {
    const content = await fs.readFile(SITEMAP_PATH, 'utf8');
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    const urls = [];
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
        urls.push(match[1]);
    }
    return urls;
}

async function getAuthenticatedClient() {
    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!keyFilePath) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: [INDEXING_API_SCOPE],
    });

    return auth.getClient();
}

async function submitUrl(authClient, url) {
    const indexing = google.indexing({
        version: 'v3',
        auth: authClient,
    });

    const response = await indexing.urlNotifications.publish({
        requestBody: {
            url: url,
            type: 'URL_UPDATED',
        },
    });

    return response.data;
}

async function main() {
    try {
        console.log('Starting Google indexing process...');
        
        // 1. Get all URLs from sitemap
        const allUrls = await getUrlsFromSitemap();
        console.log(`Found ${allUrls.length} URLs in sitemap`);
        
        // 2. Load already submitted URLs
        const submittedUrls = await getSubmittedUrls();
        console.log(`${submittedUrls.size} URLs already submitted`);
        
        // 3. Filter to new URLs
        const newUrls = allUrls.filter(url => !submittedUrls.has(url));
        console.log(`Found ${newUrls.length} new URLs to submit`);
        
        if (newUrls.length === 0) {
            console.log('No new URLs to submit');
            return;
        }
        
        // 4. Authenticate with Google
        const authClient = await getAuthenticatedClient();
        console.log('Successfully authenticated with Google');
        
        // 5. Submit new URLs
        let successCount = 0;
        let failureCount = 0;
        
        for (const url of newUrls) {
            try {
                console.log(`Submitting: ${url}`);
                await submitUrl(authClient, url);
                await addSubmittedUrl(url);
                successCount++;
                console.log(`✓ Submitted successfully: ${url}`);
            } catch (error) {
                failureCount++;
                console.error(`✗ Failed to submit ${url}:`, error.message);
            }
            
            // Add delay to avoid rate limiting
            if (newUrls.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(`\nIndexing complete: ${successCount} submitted, ${failureCount} failed`);
    } catch (error) {
        console.error('Error during indexing process:', error);
        process.exit(1);
    }
}

main();