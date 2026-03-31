import mysql from 'mysql2/promise';

// Railway 数据库配置
// 从 Railway 环境变量 DATABASE_URL 解析
const getDbConfig = () => {
    // Railway 会自动提供 DATABASE_URL
    // 格式: mysql://username:password@host:port/database
    const dbUrl = process.env.DATABASE_URL;
    
    if (dbUrl) {
        try {
            const url = new URL(dbUrl);
            return {
                host: url.hostname,
                port: Number(url.port) || 3306,
                user: url.username,
                password: decodeURIComponent(url.password),
                database: url.pathname.slice(1), // 去掉开头的 /
            };
        } catch (e) {
            console.error('DATABASE_URL 解析失败:', e);
        }
    }
    
    // 备用：使用单独的环境变量
    return {
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        port: Number(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
    };
};

const config = getDbConfig();

const pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,  // Railway 可能需要更长超时
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : undefined,
});

// 测试连接
pool.getConnection()
    .then(conn => {
        console.log('✅ Railway 数据库连接成功');
        conn.release();
    })
    .catch(err => {
        console.error('❌ 数据库连接失败:', err.message);
    });

export default pool;
