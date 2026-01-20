'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, department }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "注册失败");
        setSubmitting(false);
        return;
      }
      router.push("/login");
    } catch {
      setError("网络错误，请稍后重试");
      setSubmitting(false);
    }
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
          注册
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
          欢迎加入计算机科技协会
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
        <input
          type="password"
          placeholder="确认密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          type="text"
          placeholder="部门"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(148,163,184,0.7)",
            background: "transparent",
            color: "#e5e7eb",
            outline: "none",
          }}
        />
        {error && (
          <div
            style={{
              marginTop: "4px",
              fontSize: "13px",
              color: "#fca5a5",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
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
          {submitting ? "注册中..." : "注册"}
        </button>
      </div>
    </div>
  );
}
