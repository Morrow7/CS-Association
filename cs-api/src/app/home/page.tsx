export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "64px 24px",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            marginBottom: "16px",
          }}
        >
          CS-Association
        </h1>
        <p
          style={{
            fontSize: "18px",
            marginBottom: "24px",
          }}
        >
          这里是协会的主页。后续可以根据需要迁移原有的卡片和动效。
        </p>
      </div>
    </main>
  );
}
