export default function Navbar() {
  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between">
      <h1 className="font-bold text-blue-600">Dashboard</h1>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}