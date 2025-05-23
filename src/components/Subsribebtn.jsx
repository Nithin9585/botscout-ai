"use client";

import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../firebase/firebase";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Button } from "./ui/button";
import { UserPlus, LogIn, BellRing, CheckCircle2, Loader2 } from "lucide-react";

function Subscribers() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(firestore, "subscribers", currentUser.uid);
        const docSnap = await getDoc(docRef);
        setIsSubscribed(docSnap.exists());
      } catch (error) {
        console.error("Error checking subscription status:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      alert("You must be logged in to subscribe.");
      return;
    }

    if (isSubscribed) {
      alert("You are already subscribed.");
      return;
    }

    setActionLoading(true);
    try {
      const docRef = doc(firestore, "subscribers", user.uid);
      await setDoc(docRef, {
        userId: user.uid,
        timestamp: new Date()
      });
      setIsSubscribed(true);
      alert("Successfully subscribed!");
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Failed to subscribe. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const iconButtonProps = {
    variant: "ghost",
    size: "icon",
    className: "text-slate-300 hover:bg-[#372C44] hover:text-white w-10 h-10"
  };

  const Tooltip = ({ text, children }) => (
    <div className="group relative flex items-center justify-center">
      {children}
      <span
        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-20
                   whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white
                   opacity-0 transition-opacity group-hover:opacity-100"
      >
        {text}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-10 w-10">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <>
          <Tooltip text="Register">
            <Link href="/signup" legacyBehavior>
              <Button {...iconButtonProps} aria-label="Register">
                <UserPlus size={20} strokeWidth={1.5} />
              </Button>
            </Link>
          </Tooltip>
          <Tooltip text="Login">
            <Link href="/Login" legacyBehavior>
              <Button {...iconButtonProps} aria-label="Login">
                <LogIn size={20} strokeWidth={1.5} />
              </Button>
            </Link>
          </Tooltip>
        </>
      ) : isSubscribed ? (
        <Tooltip text="Subscribed">
          <Button
            {...iconButtonProps}
            disabled
            className="text-green-400 cursor-default"
          >
            <CheckCircle2 size={20} strokeWidth={1.5} />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip text="Subscribe to Updates">
          <Button
            {...iconButtonProps}
            onClick={handleSubscribe}
            disabled={actionLoading}
            className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
            aria-label="Subscribe"
          >
            {actionLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <BellRing size={20} strokeWidth={1.5} />
            )}
          </Button>
        </Tooltip>
      )}
    </>
  );
}

export default Subscribers;
