import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Sidebar from "./components/Sidebar";
import ConfirmLogoutModal from "@/components/ui/ConfirmLogoutModal";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Menu, LogOut, User, Settings } from "lucide-react";

/* GLOBAL TOAST */
import { Toaster } from "react-hot-toast";

/* ⭐ CRITICAL FIX — SOCKET */
import { getSocket } from "@/services/socket";

export default function App() {

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);


  /* =====================================================
     ⭐ SOCKET INITIALIZATION (CRITICAL FIX)
  ===================================================== */

  useEffect(() => {

    if (!user) return;

    console.log("🚀 Initializing global socket...");

    const socket = getSocket();

    socket.connect();

    return () => {

      socket.disconnect();

    };

  }, [user]);


  /* =====================================================
     SAFE LOGOUT
  ===================================================== */

  const handleLogout = async () => {

    try {

      const socket = getSocket();

      socket.disconnect();

      await logout();

    }

    catch (err) {

      console.error("Logout failed:", err);

    }

    finally {

      navigate("/login", { replace: true });

    }

  };


  /* =====================================================
     ESC CLOSE SIDEBAR
  ===================================================== */

  useEffect(() => {

    const onKeyDown = (e) => {

      if (e.key === "Escape") {

        setSidebarOpen(false);

      }

    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);

  }, []);


  /* =====================================================
     SESSION SAFETY
  ===================================================== */

  useEffect(() => {

    if (user === null) {

      navigate("/login", { replace: true });

    }

  }, [user, navigate]);


  return (

    <>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
          },
        }}
      />


      <div className="flex min-h-screen bg-slate-50 text-slate-900">


        {/* Desktop Sidebar */}

        <div className="hidden lg:block">

          <Sidebar />

        </div>


        {/* Main */}

        <div className="flex flex-col flex-1 w-full">


          {/* Header */}

          <header className="sticky top-0 z-40 flex items-center h-16 gap-3 px-4 bg-white border-b sm:px-6">


            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >

              <Menu className="w-5 h-5" />

            </Button>


            <div className="flex flex-col">

              <span className="text-base font-semibold">

                LogScope

              </span>

              <span className="text-xs text-slate-500">

                Real-time log ingestion & querying

              </span>

            </div>


            <div className="flex-1" />


            {/* Account */}

            <DropdownMenu>

              <DropdownMenuTrigger asChild>

                <Button variant="ghost" size="sm">

                  <User className="w-4 h-4" />

                  {user?.email || "Account"}

                </Button>

              </DropdownMenuTrigger>


              <DropdownMenuContent align="end">


                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                >

                  <Settings className="w-4 h-4 mr-2" />

                  Profile settings

                </DropdownMenuItem>


                <DropdownMenuItem
                  onClick={() => setLogoutOpen(true)}
                  className="text-red-600"
                >

                  <LogOut className="w-4 h-4 mr-2" />

                  Logout

                </DropdownMenuItem>


              </DropdownMenuContent>


            </DropdownMenu>


          </header>


          {/* Content */}

          <main className="flex-1 p-4 sm:p-6 lg:p-8">

            <Outlet />

          </main>


        </div>


        {/* Mobile Sidebar */}

        <Sidebar
          mobile
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />


        {/* Logout Modal */}

        <ConfirmLogoutModal
          open={logoutOpen}
          onOpenChange={setLogoutOpen}
          onConfirm={handleLogout}
        />


      </div>


    </>

  );

}
