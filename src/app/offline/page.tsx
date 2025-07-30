export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center p-4" style={{ minHeight: "50vh" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-fg-primary)" }}>
        You are offline
      </h1>
      <p className="text-center" style={{ color: "var(--color-fg-secondary)" }}>
        Please check your internet connection and try again.
      </p>
    </div>
  );
}
