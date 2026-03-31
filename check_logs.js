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
  console.log('=== PM2 Status ===');
  await exec('pm2 status');
  
  console.log('\n=== PM2 Logs (last 100 lines) ===');
  await exec('pm2 logs cs-api --lines 100 --nostream');
  
  console.log('\n=== Nginx Error Log (last 20 lines) ===');
  await exec('tail -n 20 /var/log/nginx/error.log');
  
  console.log('\n=== Check backend .env files ===');
  await exec('ls -la /var/www/cs-association/backend/ | grep env');
  await exec('cat /var/www/cs-association/backend/.env 2>/dev/null || echo "No .env file"');
  
  conn.end();
}).on('error', (err) => {
  console.error('SSH error:', err.message);
}).connect(config);
