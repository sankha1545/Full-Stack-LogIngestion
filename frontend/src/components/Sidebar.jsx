import { NavLink } from "react-router-dom";

const links = [
  { name: "Dashboard", path: "/" },
  { name: "Analytics", path: "/analytics" },
  
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col">
      <div className="p-5 text-lg font-bold border-b border-slate-800">
        LogScope
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.path}
            to={l.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm transition 
              ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-800"
              }`
            }
          >
            {l.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
