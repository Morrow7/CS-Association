import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Threads from './Threads';
import logo from '../images/logo.jpg';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [department, setDepartment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const goLogin = () => {
        navigate("/login");
    };

    const handleSubmit = async () => {
        if (!username || !password) {
            setError("用户名和密码不能为空");
            return;
        }
        if (password !== confirmPassword) {
            setError("两次输入的密码不一致");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, department }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                if (res.status === 409 && data.message === "该用户名已被注册") {
                    try {
                        const loginRes = await fetch(`${API_BASE}/api/login`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ username, password }),
                        });
                        const loginData = await loginRes.json();
                        if (loginRes.ok && loginData.ok) {
                            if (loginData.user) {
                                localStorage.setItem("cs_user", JSON.stringify(loginData.user));
                            }
                            navigate("/home");
                            return;
                        } else {
                            setError(loginData.message || "登录失败");
                            setSubmitting(false);
                            return;
                        }
                    } catch {
                        setError("自动登录失败，请稍后重试");
                        setSubmitting(false);
                        return;
                    }
                }
                setError(data.message || "注册失败");
                setSubmitting(false);
                return;
            }
            try {
                const loginRes = await fetch(`${API_BASE}/api/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });
                const loginData = await loginRes.json();
                if (loginRes.ok && loginData.ok) {
                    if (loginData.user) {
                        localStorage.setItem("cs_user", JSON.stringify(loginData.user));
                    }
                    navigate("/home", { replace: true });
                } else {
                    navigate("/login", { replace: true });
                }
            } catch {
                navigate("/login");
            }
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
                    注册
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
                    欢迎加入计算机科技协会
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
                <input
                    type="password"
                    placeholder="确认密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    type="text"
                    placeholder="部门"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
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
                <button
                    onClick={handleSubmit}
                    style={{
                        marginTop: '8px',
                        width: '60%',
                        padding: '10px 14px',
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
                    {submitting ? '注册中...' : '注册'}
                </button>
                <button
                    type="button"
                    onClick={goLogin}
                    style={{
                        marginTop: '4px',
                        width: '60%',
                        padding: '8px 14px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'transparent',
                        color: '#e5e7eb',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                >
                    已有账号？去登录
                </button>
            </div>
        </div>
    );
}
