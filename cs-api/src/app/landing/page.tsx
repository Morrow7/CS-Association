'use client';

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        margin: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#050505",
        color: "#00f3ff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "24px 40px",
          borderRadius: "8px",
          background: "rgba(0,20,40,0.7)",
          boxShadow:
            "0 0 20px rgba(0,243,255,0.2), inset 0 0 20px rgba(0,243,255,0.1)",
          cursor: "pointer",
        }}
        onClick={() => router.push("/home")}
      >
        欢迎来到计算机科技协会的学习空间
      </div>
    </div>
  );
}
