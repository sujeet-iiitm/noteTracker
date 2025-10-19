import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LockIcon, NotebookPenIcon } from "lucide-react";

import DotGrid from "./BG_selectServices";

const SelectService = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!useAuth) navigate("/login");
  }, []);
  const services = [
    {
      name: "NoteTracker",
      route: "/notetracker",
      icon: NotebookPenIcon,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "PasswordManager",
      route: "/passwordManager",
      icon: LockIcon,
      gradient: "from-yellow-500 to-red-500",
    },
  ];

  return (
    <>
      {/* === Page Container === */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-transparent">
        
        {/* ✅ FIXED BACKGROUND LAYER */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <DotGrid
            dotSize={3}
            gap={15}
            baseColor="#5227FF"
            activeColor="#5227FF"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>

        {/* ❌ Removed this, it darkens and hides grid */}
        {/* <div className="absolute inset-0 bg-black/30 -z-[5]" /> */}

        {/* === Foreground Content === */}
        <div className="relative z-10 text-center px-4 py-10 bg-transparent">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-12 tracking-tight drop-shadow-md">
            Which Service do you want to use?
          </h1>

          <div className="flex flex-wrap justify-center gap-10 sm:gap-14 bg-transparent">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  onClick={() => navigate(service.route)}
                  className="flex flex-col items-center cursor-pointer group bg-transparent"
                >
                  <div
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon size={48} className="text-white" />
                  </div>
                  <p className="mt-3 text-lg sm:text-xl capitalize font-semibold">
                    {service.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* === Bottom Fixed Message Bar === */}
      <div className="fixed bottom-0 w-full bg-gray-100/80 text-center py-2 shadow-md backdrop-blur-sm z-20">
        <h2 className="font-bold text-sm text-gray-700">
          Kindly refresh – (or) – GO BACK to change the service
        </h2>
      </div>
    </>
  );
};

export default SelectService;
