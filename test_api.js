const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '47.108.51.236',
  port: 22,
  username: 'root',
  password: 'Gsy652132.',
};

function exec(cmd, showOutput = true) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', (code, signal) => {
        resolve({ code, stdout, stderr });
      }).on('data', (data) => {
        stdout += data;
        if (showOutput) process.stdout.write(data);
      }).stderr.on('data', (data) => {
        stderr += data;
        if (showOutput) process.stderr.write(data);
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('=== Test /api (no trailing slash) ===');
  await exec('curl -s -L http://127.0.0.1/api');
  
  console.log('\n=== Test /api/ (with trailing slash) ===');
  await exec('curl -s -L http://127.0.0.1/api/');
  
  console.log('\n=== Test /api/login ===');
  await exec('curl -s -L http://127.0.0.1/api/login');
  
  console.log('\n=== Test direct backend /api ===');
  await exec('curl -s http://127.0.0.1:3001/api');
  
  console.log('\n=== Test direct backend /api/ ===');
  await exec('curl -s http://127.0.0.1:3001/api/');

  conn.end();
}).on('error', (err) => {
  console.error('SSH error:', err.message);
}).connect(config);
