'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      return;
    }
    router.push("/home");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "420px",
          padding: "32px 40px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: "16px",
          background:
            "radial-gradient(circle at top, rgba(56,189,248,0.25), transparent 55%), #020617",
          boxShadow:
            "0 24px 60px rgba(15,23,42,0.9), 0 0 0 1px rgba(148,163,184,0.3)",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: "4px",
            fontSize: "30px",
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          登录
        </h1>
        <p
          style={{
            margin: 0,
            marginBottom: "16px",
            fontSize: "16px",
            color: "#e5e7eb",
            textAlign: "center",
          }}
        >
          欢迎回来
        </p>
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.8)",
            background: "transparent",
            color: "#e5e7eb",
            outline: "none",
          }}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.8)",
            background: "transparent",
            color: "#e5e7eb",
            outline: "none",
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            marginTop: "8px",
            width: "100%",
            padding: "10px 14px",
            borderRadius: "999px",
            border: "none",
            background:
              "linear-gradient(135deg, #22d3ee 0%, #6366f1 40%, #ec4899 100%)",
            color: "#0b1120",
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          登录
        </button>
      </div>
    </div>
  );
}
