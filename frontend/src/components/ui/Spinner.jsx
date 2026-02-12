export default function Spinner({ size = 20 }) {
  return (
    <div
      className="border-2 border-gray-300 rounded-full border-t-transparent animate-spin"
      style={{ width: size, height: size }}
    />
  );
}
