# 部署指南

## 环境变量配置

### Vercel 后台设置（必须）

由于代码已部署到 Vercel，你需要在 Vercel 后台设置环境变量：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 `cs-api` 项目
3. 点击 **Settings** → **Environment Variables**
4. 添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `MYSQL_HOST` | `47.108.51.236` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | `root` |
| `MYSQL_PASSWORD` | `Gsy652132.` |
| `MYSQL_DATABASE` | `cs_association` |

5. 点击 **Save**
6. 重新部署项目（Deployments → 选择最新部署 → Redeploy）

### GitHub OAuth（可选）
如果需要 GitHub 登录功能，还需要设置：

| 变量名 | 值 |
|--------|-----|
| `GITHUB_CLIENT_ID` | 你的 GitHub App Client ID |
| `GITHUB_CLIENT_SECRET` | 你的 GitHub App Client Secret |
| `GITHUB_REDIRECT_URI` | `https://cs-api-yqup.vercel.app/api/github/callback` |
| `GITHUB_LOGIN_REDIRECT` | `https://你的前端域名.com/home` |

## 阿里云数据库配置

### 1. 安全组设置
确保阿里云 ECS/RDS 安全组放行了 3306 端口。

### 2. 白名单设置
1. 登录阿里云控制台
2. 进入 RDS 管理页面
3. 点击「数据安全性」→「白名单设置」
4. 添加以下 IP 到白名单：
   - Vercel 的 IP 范围（可能会变化，建议查看 Vercel 文档）
   - 或者临时设置为 `0.0.0.0/0`（生产环境不建议）

### 3. 初始化数据库
在本地运行以下命令初始化数据库表结构：

```bash
cd cs-api
npm install
npm run db:init
```

或测试连接：
```bash
npm run db:test
```

## 本地开发

```bash
cd cs-api
npm install
npm run dev
```

本地开发时会自动读取 `.env.local` 文件中的配置。

## 常见问题

### 500 错误 / 数据库连接失败

1. 检查 Vercel 环境变量是否设置正确
2. 检查阿里云白名单是否包含 Vercel 的服务器 IP
3. 检查数据库是否已初始化（表是否创建）

### 如何查看 Vercel 日志

1. 登录 Vercel Dashboard
2. 选择项目 → **Deployments**
3. 点击最新部署 → **Runtime Logs**
4. 查看错误信息

## 安全提醒

⚠️ **重要**：`.env` 和 `.env.local` 文件包含敏感信息，已添加到 `.gitignore`，请勿提交到代码仓库！

如果密码已泄露，请立即：
1. 修改阿里云数据库密码
2. 在 Vercel 后台更新 `MYSQL_PASSWORD`
3. 重新部署
