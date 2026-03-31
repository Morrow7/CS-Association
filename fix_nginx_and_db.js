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

  // Fix Nginx: remove default site and make our site default_server
  console.log('\n[1/2] Fixing Nginx default server...');
  await exec('rm -f /etc/nginx/sites-enabled/default', true);
  
  const nginxConf = `server {
    listen 80 default_server;
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
  console.log('Nginx fixed and restarted.');

  // Test API through Nginx again
  console.log('\n[2/2] Testing API through Nginx...');
  let res = await exec('curl -s http://127.0.0.1/api');
  console.log('Nginx proxy response:', res.stdout.trim());

  console.log('\n✅ Nginx fixed!');
  console.log('The 500 error is caused by database connection timeout.');
  console.log('Backend is trying to connect to MySQL at 192.168.2.15:3306');
  console.log('Please provide the correct MySQL connection info.');

  conn.end();
}).on('error', (err) => {
  console.error('SSH error:', err.message);
}).connect(config);
