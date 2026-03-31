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
  console.log('=== Nginx sites-enabled ===');
  await exec('ls -la /etc/nginx/sites-enabled/');
  
  console.log('\n=== Default site config ===');
  await exec('cat /etc/nginx/sites-enabled/default 2>/dev/null || echo "No default file"');
  
  console.log('\n=== Our site config ===');
  await exec('cat /etc/nginx/sites-enabled/cs-association 2>/dev/null || echo "No cs-association file"');
  
  console.log('\n=== Nginx full config test ===');
  await exec('nginx -T | grep -E "server_name|listen|location|proxy_pass"');
  
  conn.end();
}).on('error', (err) => {
  console.error('SSH error:', err.message);
}).connect(config);
