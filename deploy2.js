const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const config = {
  host: '47.108.51.236',
  port: 22,
  username: 'root',
  password: 'Gsy652132.',
};

function exec(cmd, showOutput = false) {
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

async function uploadDirRecursive(localDir, remoteDir, exclude = []) {
  const sftp = await getSftp();
  await exec(`mkdir -p ${remoteDir}`);

  async function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (exclude.includes(entry.name)) continue;
      const localPath = path.join(dir, entry.name);
      const relativePath = path.relative(localDir, localPath).replace(/\\/g, '/');
      const remotePath = `${remoteDir}/${relativePath}`;

      if (entry.isDirectory()) {
        await new Promise((resolve, reject) => {
          sftp.mkdir(remotePath, { mode: 0o755 }, (err) => {
            if (err && err.code !== 4) reject(err);
            else resolve();
          });
        });
        await walk(localPath);
      } else {
        await new Promise((resolve, reject) => {
          sftp.fastPut(localPath, remotePath, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
  }

  await walk(localDir);
  sftp.end();
}

conn.on('ready', async () => {
  console.log('SSH connected');

  // Check PM2
  let res = await exec('which pm2');
  if (res.code !== 0) {
    console.log('Installing PM2...');
    await exec('npm install -g pm2', true);
  } else {
    console.log('PM2 already installed');
  }

  // Create directories
  console.log('Creating directories...');
  await exec('mkdir -p /var/www/cs-association/frontend');
  await exec('mkdir -p /var/www/cs-association/backend');

  // Upload frontend
  console.log('Uploading frontend build...');
  await uploadDirRecursive('D:\\CS-Association\\build', '/var/www/cs-association/frontend');
  console.log('Frontend uploaded.');

  // Upload backend (exclude node_modules)
  console.log('Uploading backend files...');
  await uploadDirRecursive('D:\\CS-Association\\cs-api', '/var/www/cs-association/backend', ['node_modules']);
  console.log('Backend uploaded.');

  // Install backend deps
  console.log('Installing backend dependencies...');
  await exec('cd /var/www/cs-association/backend && npm install', true);

  // Build backend if needed
  res = await exec('ls -d /var/www/cs-association/backend/.next');
  if (res.code !== 0) {
    console.log('Building backend...');
    await exec('cd /var/www/cs-association/backend && npm run build', true);
  }

  // Nginx config
  console.log('Configuring Nginx...');
  const backendPort = 3000;
  const nginxConf = `server {
    listen 80;
    server_name 47.108.51.236;

    location / {
        root /var/www/cs-association/frontend;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:${backendPort}/api/;
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

  await exec('ln -sf /etc/nginx/sites-available/cs-association /etc/nginx/sites-enabled/cs-association');
  await exec('nginx -t', true);
  await exec('systemctl restart nginx', true);

  // Start backend with PM2
  console.log('Starting backend with PM2...');
  await exec('cd /var/www/cs-association/backend && pm2 delete cs-api 2>/dev/null; pm2 start npm --name cs-api -- start', true);
  await exec('pm2 save', true);
  await exec('pm2 startup systemd -u root --hp /root', true);

  console.log('\n✅ Deployment completed!');
  console.log('Frontend: http://47.108.51.236');
  console.log('Backend API: http://47.108.51.236/api');

  conn.end();
}).on('error', (err) => {
  console.error('SSH error:', err.message);
}).connect(config);
