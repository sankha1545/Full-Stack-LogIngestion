import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Shell({ children }) {
  const [_open, _setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between px-4 border-b h-14 bg-slate-900 border-slate-800">
          <h1 className="font-bold">LogScope</h1>
        
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
