"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar"; // Assuming Sidebar.js is in the same directory

export default function SidebarToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile?

  return (
    <>
      {/* Toggle Button - improved positioning and styling */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 p-2.5 rounded-md z-[100] transition-all duration-300 ease-in-out
                    bg-purple-600 hover:bg-purple-700 text-white shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
                    ${isSidebarOpen ? "left-[calc(5rem+0.5rem)]" : "left-4"} md:hidden`} // Only show on mobile/smaller screens
        // 5rem is w-20, 0.5rem is a small gap. Adjust if sidebar width changes.
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isSidebarOpen}
        aria-controls="main-sidebar" // Add an id="main-sidebar" to your Sidebar's div
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container - for sliding effect */}
      {/* On desktop, sidebar might always be visible, or this toggle could hide/show it too */}
      <div
        id="main-sidebar"
        className={`fixed inset-y-0 left-0 z-[90] text-white transform transition-transform duration-300 ease-in-out
                    md:translate-x-0 ${ /* Always show on md+ screens */ ''}
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:w-20 ${ /* Ensure this matches sidebar's width */ ''}
                    w-64 ${ /* Width when expanded on mobile, if different */ ''}
                  `}
      >
        <Sidebar />
      </div>

      {/* Optional: Main content area that shifts when sidebar opens on mobile */}
      {/* <main className={`transition-all duration-300 ease-in-out md:ml-20 ${isSidebarOpen && !isDesktop ? 'ml-64' : 'ml-0'}`}> */}
      {/* Your page content here */}
      {/* </main> */}
    </>
  );
}