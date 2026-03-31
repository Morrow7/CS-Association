# Railway 部署指南

## 数据库配置

Railway 会自动提供 MySQL 数据库，并设置 `DATABASE_URL` 环境变量。

### 方式1：自动配置（推荐）

部署到 Railway 后，会自动创建 MySQL 并设置 `DATABASE_URL`，无需手动配置。

### 方式2：手动配置环境变量

如果你的 Railway 项目没有自动创建数据库，手动添加：

1. 登录 [Railway Dashboard](https://railway.app/dashboard)
2. 选择你的项目
3. 点击 **New** → **Database** → **Add MySQL**
4. 连接信息会自动注入到环境变量

### 查看连接信息

在 Railway Dashboard：
1. 点击你的 MySQL 服务
2. 点击 **Connect** 标签
3. 选择 **MySQL** 查看连接字符串

连接字符串格式：
```
mysql://root:password@containers.railway.app:3306/railway
```

这个连接字符串会自动作为 `DATABASE_URL` 环境变量。

## 环境变量

Railway 会自动设置以下变量（不需要手动设置）：

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | 完整的数据库连接 URL |
| `MYSQLHOST` | 数据库主机 |
| `MYSQLPORT` | 数据库端口 |
| `MYSQLUSER` | 用户名 |
| `MYSQLPASSWORD` | 密码 |
| `MYSQLDATABASE` | 数据库名 |

## 本地开发连接 Railway 数据库

如果你需要在本地开发时连接 Railway 的数据库：

1. 在 Railway Dashboard 获取连接字符串
2. 复制到 `.env.local`：

```env
DATABASE_URL=mysql://root:xxxx@containers-xxxxx.railway.app:3306/railway
```

⚠️ **安全提醒**：不要把 `.env.local` 提交到 Git！

## 部署步骤

### 1. 代码推送到 GitHub

```bash
git add .
git commit -m "切换到 Railway 数据库"
git push
```

### 2. Railway 自动部署

如果你已连接 GitHub，Railway 会自动部署。

### 3. 检查部署状态

访问 Railway 提供的域名：
- `https://你的项目名.up.railway.app/api/health`

## 常见问题

### 连接超时

Railway 免费版数据库会在休眠后首次连接较慢，已设置 60 秒超时。

### 数据库迁移

如需将阿里云数据迁移到 Railway：

```bash
# 1. 导出阿里云数据
mysqldump -h 47.108.51.236 -u root -p cs_association > backup.sql

# 2. 导入到 Railway（使用 Railway 的连接信息）
mysql -h containers-xxxxx.railway.app -u root -p railway < backup.sql
```

## 切换回阿里云（如需）

修改 `src/app/lib/db.ts` 中的默认配置即可。
