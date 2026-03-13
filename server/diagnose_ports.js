import { spawn } from 'child_process';
import http from 'http';

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ port, status: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ port, error: err.message }));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve({ port, error: 'timeout' });
    });
  });
}

async function run() {
  console.log('--- Checking Ports ---');
  const port3000 = await checkPort(3000);
  const port5000 = await checkPort(5000);
  
  console.log('Port 3000:', JSON.stringify(port3000));
  console.log('Port 5000:', JSON.stringify(port5000));
  
  console.log('\n--- Environment ---');
  console.log('__dirname:', process.cwd());
}

run();
