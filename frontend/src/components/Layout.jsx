export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <h1 className="font-bold text-blue-600 text-lg">Event Management System</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
