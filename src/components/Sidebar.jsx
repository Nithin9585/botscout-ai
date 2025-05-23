"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import { Button } from "./ui/button";
import logo from "../../public/mainlogo.svg";
import Subscribers from "./Subsribebtn";

// Lucide icons
import { Home, LogOut, FileText, Settings, Grid } from "lucide-react";

// React Icons (brand icons)
import { FaGithub } from "react-icons/fa";
import { GiBrain } from "react-icons/gi";

// Sidebar Item Component
const SidebarItem = ({ href, icon: Icon, label, onClick }) => {
  const button = (
    <Button
      variant="ghost"
      size="icon"
      className="text-slate-300 hover:bg-[#372C44] hover:text-white transition-colors duration-200 w-12 h-12"
      aria-label={label}
      onClick={onClick}
    >
      <Icon size={22} />
      <span
        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-20
                   whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white
                   opacity-0 transition-opacity group-hover:opacity-100"
      >
        {label}
      </span>
    </Button>
  );

  return href ? (
    <Link href={href} className="group relative flex items-center justify-center">
      {button}
    </Link>
  ) : (
    <div className="group relative flex items-center justify-center">{button}</div>
  );
};

function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optional: redirect or toast here
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex h-screen w-20 bg-[#261E35] p-4 fixed left-0 top-0 flex-col items-center shadow-lg">
      {/* Logo */}
      <Link href="/" className="mb-8 transition-transform duration-300 hover:scale-105 block" title="Home">
        <Image alt="logo" src={logo} width={48} height={48} />
      </Link>

      {/* Main navigation */}
      <nav className="flex flex-col items-center gap-4 flex-grow">
        <SidebarItem href="/" icon={Home} label="Home" />
        <SidebarItem href="/dashboard" icon={Grid} label="Dashboard" />
        <SidebarItem href="/huggingfacepage" icon={GiBrain} label="Hugging Face" />
        <SidebarItem href="/githubpages" icon={FaGithub} label="GitHub Repos" />
        <SidebarItem href="/Arxivpages" icon={FileText} label="ArXiv Papers" />
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto flex flex-col items-center gap-4">
        <Subscribers />
        {user && <SidebarItem icon={LogOut} label="Logout" onClick={handleLogout} />}
        {/* <SidebarItem href="/settings" icon={Settings} label="Settings" /> */}
      </div>
    </div>
  );
}

export default Sidebar;
