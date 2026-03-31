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

function exec(cmd, label) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', (code, signal) => {
        resolve({ code, stdout, stderr });
      }).on('data', (data) => {
        stdout += data;
        if (label) process.stdout.write(data);
      }).stderr.on('data', (data) => {
        stderr += data;
        if (label) process.stderr.write(data);
      });
    });
  });
}

async function uploadDir(localDir, remoteDir) {
  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) reject(err);
      else resolve(sftp);
    });
  });

  await exec(`mkdir -p ${remoteDir}`);

  async function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
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

  // 1. Install Node.js 20 LTS via NodeSource
  console.log('\n[1/7] Installing Node.js 20 LTS...');
  let res = await exec('curl -fsSL https://deb.nodesource.com/setup_20.x | bash -', true);
  if (res.code !== 0) {
    console.error('NodeSource setup failed, trying apt update first...');
    await exec('apt-get update -y', true);
    res = await exec('curl -fsSL https://deb.nodesource.com/setup_20.x | bash -', true);
  }
  res = await exec('apt-get install -y nodejs', true);
  if (res.code !== 0) {
    console.error('Node.js install failed');
    conn.end();
    return;
  }

  // Verify Node.js
  res = await exec('node -v && npm -v');
  console.log('Node installed:', res.stdout.trim());

  // 2. Install PM2 globally
  console.log('\n[2/7] Installing PM2...');
  await exec('npm install -g pm2', true);

  // 3. Create directories
  console.log('\n[3/7] Creating directories...');
  await exec('mkdir -p /var/www/cs-association/frontend');
  await exec('mkdir -p /var/www/cs-association/backend');

  // 4. Upload frontend build
  console.log('\n[4/7] Uploading frontend build...');
  await uploadDir('D:\\CS-Association\\build', '/var/www/cs-association/frontend');
  console.log('Frontend uploaded.');

  // 5. Upload backend (exclude node_modules)
  console.log('\n[5/7] Uploading backend files...');
  const backendLocal = 'D:\\CS-Association\\cs-api';
  const backendRemote = '/var/www/cs-association/backend';

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) reject(err);
      else resolve(sftp);
    });
  });

  async function uploadBackend(dir, remoteBase) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules') continue;
      const localPath = path.join(dir, entry.name);
      const relativePath = path.relative(backendLocal, localPath).replace(/\\/g, '/');
      const remotePath = `${remoteBase}/${relativePath}`;

      if (entry.isDirectory()) {
        await new Promise((resolve, reject) => {
          sftp.mkdir(remotePath, { mode: 0o755 }, (err) => {
            if (err && err.code !== 4) reject(err);
            else resolve();
          });
        });
        await uploadBackend(localPath, remoteBase);
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

  await uploadBackend(backendLocal, backendRemote);
  sftp.end();
  console.log('Backend uploaded.');

  // 6. Install backend dependencies and build if needed
  console.log('\n[6/7] Installing backend dependencies...');
  await exec('cd /var/www/cs-association/backend && npm install', true);

  // Check if .next exists, if not build
  res = await exec('ls -d /var/www/cs-association/backend/.next');
  if (res.code !== 0) {
    console.log('Building backend...');
    await exec('cd /var/www/cs-association/backend && npm run build', true);
  }

  // 7. Configure Nginx and PM2
  console.log('\n[7/7] Configuring Nginx and PM2...');

  // Check backend port (Next.js default 3000)
  const backendPort = 3000;

  // Nginx config
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

  // Upload nginx config
  const nginxSftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) reject(err);
      else resolve(sftp);
    });
  });
  await new Promise((resolve, reject) => {
    nginxSftp.fastPut('D:\\CS-Association\\nginx.conf', '/etc/nginx/sites-available/cs-association', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  nginxSftp.end();

  await exec('ln -sf /etc/nginx/sites-available/cs-association /etc/nginx/sites-enabled/cs-association');
  await exec('nginx -t', true);
  await exec('systemctl restart nginx', true);

  // Start backend with PM2
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
