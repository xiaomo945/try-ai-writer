const http = require('http');

const postData = JSON.stringify({
  prompt: 'test prompt',
  mode: 'blog'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response preview:', data.substring(0, 200));
    if (res.statusCode === 200 && data.length > 100) {
      console.log('[PASS] Mock mode working correctly.');
      process.exit(0);
    } else if (data.includes('API key not configured')) {
      console.log('[FAIL] Still showing API key error!');
      process.exit(1);
    } else {
      console.log('[WARN] Unexpected response.');
      process.exit(2);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
  process.exit(3);
});

req.write(postData);
req.end();
