import "./loader.css";

export default function Loader() {
  return (
    <div className="loader-overlay">
      <div className="spinner"></div>
      <p className="loading-text">Loading LogScope...</p>
    </div>
  );
}
