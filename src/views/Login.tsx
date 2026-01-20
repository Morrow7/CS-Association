import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Threads from './Threads';
import logo from '../images/logo.jpg';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleGithubLogin = () => {
        window.location.href = `${API_BASE}/api/github/login`;
    };

    const handleSubmit = async () => {
        if (!username || !password) {
            setError("用户名和密码不能为空");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                setError(data.message || "登录失败");
                setSubmitting(false);
                return;
            }
            if (data.user) {
                localStorage.setItem("cs_user", JSON.stringify(data.user));
            }
            navigate("/home", { replace: true });
        } catch {
            setError("网络错误，请稍后重试");
            setSubmitting(false);
        }
    };
    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                position: 'relative',
                background: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                }}
            >
                <Threads amplitude={2} distance={0} enableMouseInteraction />
            </div>
            <div
                style={{
                    zIndex: 1,
                    width: '420px',
                    padding: '32px 40px',
                    borderRadius: '16px',
                    display: 'flex',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '16px',
                }}
            >
                <img src={logo} className="App-logo" alt="logo" />
                <h1
                    style={{
                        margin: 0,
                        marginBottom: '4px',
                        fontSize: '30px',
                        color: '#ffffff',
                        textAlign: 'center',
                    }}
                >
                    登录
                </h1>
                <p
                    style={{
                        margin: 0,
                        marginBottom: '16px',
                        fontSize: '16px',
                        color: '#e5e7eb',
                        textAlign: 'center',
                    }}
                >
                    欢迎回到计算机科技协会
                </p>
                <input
                    type="text"
                    placeholder="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        width: '60%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.8)',
                        background: 'transparent',
                        color: '#e5e7eb',
                        outline: 'none',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: '60%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.8)',
                        background: 'transparent',
                        color: '#e5e7eb',
                        outline: 'none',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                />
                {error && (
                    <div
                        style={{
                            marginTop: '4px',
                            fontSize: '13px',
                            color: '#fca5a5',
                            textAlign: 'center',
                        }}
                    >
                        {error}
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '8px', marginTop: '8px' }}>
                    <button
                        onClick={handleSubmit}
                        style={{
                            marginTop: '8px',
                            width: '40%',
                            padding: '10px 6px',
                            borderRadius: '999px',
                            border: 'none',
                            color: '#0b1120',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                    >
                        {submitting ? '登录中...' : '登录'}
                    </button>
                    <button
                        onClick={handleGithubLogin}
                        style={{
                            marginTop: '8px',
                            width: '40%',
                            padding: '10px 6px',
                            borderRadius: '999px',
                            border: '1px solid rgba(255,255,255,0.6)',
                            background: 'transparent',
                            color: '#e5e7eb',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                    >
                        使用 GitHub 登录
                    </button>
                </div>

            </div>
        </div>
    );
}
