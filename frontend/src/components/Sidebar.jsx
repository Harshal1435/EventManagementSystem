import { Link } from "react-router-dom";

export default function Sidebar({ links }) {
  return (
    <div className="w-60 bg-gray-900 text-white p-4 min-h-screen">
      {links.map((l, i) => (
        <Link key={i} to={l.path} className="block p-2 hover:bg-gray-700 rounded">
          {l.name}
        </Link>
      ))}
    </div>
  );
}