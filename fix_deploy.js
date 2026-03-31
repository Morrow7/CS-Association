const { Client } = require('ssh2');
const fs = require('fs');

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

async function getSftp() {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) reject(err);
      else resolve(sftp);
    });
  });
}

conn.on('ready', async () => {
  console.log('SSH connected');

  // 1. Fix Nginx port from 3000 to 3001
  console.log('\n[1/3] Fixing Nginx config (3000 -> 3001)...');
  const nginxConf = `server {
    listen 80;
    server_name 47.108.51.236;

    location / {
        root /var/www/cs-association/frontend;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
`;
  fs.writeFileSync('D:\\CS-Association\\nginx.conf', nginxConf);
  const sftp = await getSftp();
  await new Promise((resolve, reject) => {
    sftp.fastPut('D:\\CS-Association\\nginx.conf', '/etc/nginx/sites-available/cs-association', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  sftp.end();
  await exec('nginx -t', true);
  await exec('systemctl restart nginx', true);
  console.log('Nginx updated and restarted.');

  // 2. Test API directly
  console.log('\n[2/3] Testing backend API directly...');
  let res = await exec('curl -s http://127.0.0.1:3001/api');
  console.log('Direct API response:', res.stdout.trim());

  // 3. Test API through Nginx
  console.log('\n[3/3] Testing backend API through Nginx...');
  res = await exec('curl -s http://127.0.0.1/api');
  console.log('Nginx proxy response:', res.stdout.trim());

  console.log('\n✅ Fix applied!');
  console.log('If the API still returns 500, it is likely a database connection issue.');
  console.log('The backend is trying to connect to MySQL at 192.168.2.15:3306');
  console.log('Please provide the correct database connection info if needed.');

  conn.end();
}).on('error', (err) => {
  console.error('SSH error:', err.message);
}).connect(config);
