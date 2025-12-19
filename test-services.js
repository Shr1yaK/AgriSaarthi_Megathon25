#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing AgriSaarthi Services...\n');

function testService(url, name) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`✅ ${name}: ${res.statusCode} - OK`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name}: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${name}: Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function testAll() {
  console.log('Testing services...\n');
  
  const results = await Promise.all([
    testService('http://localhost:3000', 'Next.js Frontend'),
    testService('http://localhost:8004/health', 'Weather Service'),
    testService('http://localhost:5000/health', 'Flask Backend')
  ]);
  
  const successCount = results.filter(Boolean).length;
  
  console.log(`\n📊 Results: ${successCount}/3 services running`);
  
  if (successCount === 3) {
    console.log('🎉 All services are working perfectly!');
  } else {
    console.log('⚠️  Some services may need to be started');
  }
}

testAll();
