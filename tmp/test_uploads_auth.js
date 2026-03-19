import fetch from 'node-fetch';

async function test() {
  try {
    const url = 'http://localhost:3000/uploads/test-file';
    console.log(`Testing GET ${url}...`);
    const resp = await fetch(url);
    console.log(`Status: ${resp.status}`);
    const text = await resp.text();
    console.log(`Response: ${text.substring(0, 100)}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

test();
