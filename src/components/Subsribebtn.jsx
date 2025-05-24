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

      // Check if UID exists from auth
      if (!currentUser.uid) {
        console.warn("User does not have a UID. Cannot check subscription status.");
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      try {
        // Fetch user document from 'users' collection using UID
        const userDocRef = doc(firestore, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.warn("User document not found in 'users' collection.");
          setIsSubscribed(false);
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const userEmail = userData.email;

        if (!userEmail) {
          console.warn("User document does not contain an email.");
          setIsSubscribed(false);
          setLoading(false);
          return;
        }

        console.log("Checking subscription for email: ", userEmail);
        // Use userEmail as the document ID for subscribers
        const docRef = doc(firestore, "subscribers", userEmail);
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

    // Ensure user has a UID from auth
    if (!user.uid) {
      alert("Your account does not have a user ID. Cannot subscribe.");
      return;
    }

    setActionLoading(true);
    try {
      // Fetch user document from 'users' collection
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        alert("User data not found. Cannot subscribe.");
        setActionLoading(false);
        return;
      }

      const userData = userDocSnap.data();
      const userEmail = userData.email;

      if (!userEmail) {
        alert("User has no email address. Cannot subscribe.");
        setActionLoading(false);
        return;
      }

      // If already subscribed, prevent re-subscription (though the button would be disabled)
      if (isSubscribed) {
        alert("You are already subscribed.");
        setActionLoading(false);
        return;
      }

      // 1. Store an empty document in 'subscribers' collection, using email as ID
      const docRef = doc(firestore, "subscribers", userEmail);
      await setDoc(docRef, {}); // Store an empty document

      setIsSubscribed(true);

      // 2. Send POST request to /api/send-weekly-email
      try {
        const response = await fetch("/api/send-weekly-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API response:", result);
        alert("Successfully subscribed and initiated email send!");
      } catch (apiError) {
        console.error("Error sending weekly email API request:", apiError);
        alert("Successfully subscribed, but failed to send welcome email.");
      }

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
    className: "text-slate-300 hover:bg-[#372C44] hover:text-white w-10 h-10",
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