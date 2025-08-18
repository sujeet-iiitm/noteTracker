import { User, Mail, Calendar } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [showUserDetails, setShowUserDetails] = useState(false);

  return (
    <header className="w-full p-4 bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center bg-gray-100 rounded-full px-1 py-1">
          <button
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === "HOME" 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => onTabChange("HOME")}
          >
            HOME
          </button>
          <button
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === "Notes" 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => onTabChange("Notes")}
          >
            Notes
          </button>
          <button
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === "user-details" 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => onTabChange("user-details")}
          >
            User Details
          </button>
        </div>

        {/* User Profile Circle */}
        <div className="relative">
          <button
            className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-colors"
            onMouseEnter={() => setShowUserDetails(true)}
            onMouseLeave={() => setShowUserDetails(false)}
          >
            <User className="h-6 w-6 text-white" />
          </button>
          
          {showUserDetails && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
              <div className="flex space-x-4">
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-200">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-semibold">John Doe</h4>
                  <p className="text-sm text-gray-600">
                    Daily notes enthusiast and productivity lover
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>john.doe@example.com</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Joined January 2024</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}