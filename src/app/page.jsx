"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button"; // Assuming this path is correct
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"; // Assuming this path is correct
import { Badge } from "@/components/ui/badge"; // Assuming this path is correct
import SearchBar from "@/components/Searchbar"; // Assuming this path is correct
import {
  Star,
  GitFork,
  Download,
  Heart,
  Github,
  Brain,
  FileText,
  ArrowUpRight,
  Zap,
  Clock,
  Users,
  LockKeyhole,
  Unlock,
  Loader2,
  AlertCircle, 
} from "lucide-react";
import LoadingAnimation from "./loading"; // Assuming this is your loading animation component
import { auth, firestore as db } from '../../firebase/firebase'; // Adjust path if needed

import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken
} from 'firebase/auth'; // Specific auth methods
import {
  doc, // Added for getDoc and setDoc
  getDoc, // Added for checking subscription by doc ID
  setDoc, // For subscribing when the doc ID is user.uid
  serverTimestamp,
} from 'firebase/firestore'; // Specific firestore methods


function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// --- Card Components (GithubCard, HuggingFaceCard, ArxivCard) ---
// These components remain largely the same.
function GithubCard({ repo }) {
  // Component to display GitHub repository information
  return (
    <Card className="flex flex-col justify-between w-full bg-gray-900 border-gray-700 hover:shadow-lg hover:shadow-purple-600/20 hover:border-purple-600 transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-white leading-tight">
            {repo.name || "Unnamed Repository"}
          </CardTitle>
          <Github className="text-gray-400 w-5 h-5" />
        </div>
        <CardDescription className="text-gray-400 text-sm mt-1 h-12 overflow-hidden text-ellipsis">
          {repo.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
          {typeof repo.trending_score === 'number' && (
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Zap className="w-3 h-3 mr-1" /> Trend Score: {formatNumber(repo.trending_score)}
            </Badge>
          )}
        </div>
        <div className="flex justify-around items-center text-gray-300 text-sm border-t border-gray-700 pt-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{formatNumber(repo.stars)}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-4 h-4 text-blue-400" />
            <span>{formatNumber(repo.forks)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{formatDate(repo.created_at)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-700">
        <Button asChild variant="outline" className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
          <a href={repo.url} target="_blank" rel="noopener noreferrer">
            View on GitHub <ArrowUpRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function HuggingFaceCard({ model }) {
  const url = `https://huggingface.co/${model.id}`;
  return (
    <Card className="flex flex-col justify-between w-full bg-gray-900 border-gray-700 hover:shadow-lg hover:shadow-teal-600/20 hover:border-teal-600 transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-white leading-tight">
            {model.id || "Unnamed Model"}
          </CardTitle>
          <Brain className="text-gray-400 w-5 h-5" />
        </div>
        <CardDescription className="text-gray-500 text-sm">
          By: {model.author || "Unknown"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {model.pipeline_tag && <Badge variant="secondary">{model.pipeline_tag}</Badge>}
          {typeof model.trending_score === 'number' && (
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Zap className="w-3 h-3 mr-1" /> Trend Score: {formatNumber(model.trending_score)}
            </Badge>
          )}
        </div>
        <div className="mb-3 h-10 overflow-y-auto text-xs">
          {model.tags && model.tags.length > 0 ? (
            model.tags.slice(0, 5).map(tag => <Badge key={tag} variant="outline" className="mr-1 mb-1 text-gray-300 border-gray-600">{tag}</Badge>)
          ) : (
            <span className="text-gray-500 text-xs">No tags.</span>
          )}
        </div>
        <div className="flex justify-around items-center text-gray-300 text-sm border-t border-gray-700 pt-3">
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4 text-sky-400" />
            <span>{formatNumber(model.downloads)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-pink-400" />
            <span>{formatNumber(model.likes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{formatDate(model.lastModified)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-700">
        <Button asChild variant="outline" className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
          <a href={url} target="_blank" rel="noopener noreferrer">
            View on Hugging Face <ArrowUpRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ArxivCard({ paper }) {
  const arxivId = paper.id?.split("/abs/").pop();
  const defaultUrl = arxivId ? `https://arxiv.org/abs/${arxivId}` : "#";
  let url = paper.url || defaultUrl;
  if (url && url.includes('http://arxiv.org/abs/http://arxiv.org/abs/')) {
    url = 'http://arxiv.org/abs/' + url.split('http://arxiv.org/abs/http://arxiv.org/abs/').pop();
  } else if (url && url.startsWith('http://arxiv.org/abs/')) {
    url = url.replace('http://', 'https://');
  }

  return (
    <Card className="flex flex-col justify-between w-full bg-gray-900 border-gray-700 hover:shadow-lg hover:shadow-blue-600/20 hover:border-blue-600 transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-white leading-tight">
            {paper?.title?.replace(/\n/g, ' ').trim() || "Untitled Paper"}
          </CardTitle>
          <FileText className="text-gray-400 w-5 h-5" />
        </div>
        {paper?.authors?.length > 0 && (
          <CardDescription className="text-gray-500 text-sm mt-1 flex items-center h-10 overflow-hidden">
            <Users className="w-3 h-3 mr-1.5 flex-shrink-0" />
            <span className="truncate">
              {paper.authors.map(a => a.name).join(', ').slice(0, 70)}
              {paper.authors.map(a => a.name).join(', ').length > 70 && '...'}
            </span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-400 text-sm h-24 overflow-hidden text-ellipsis leading-relaxed">
          {paper?.summary?.replace(/\n/g, ' ').trim() || "No summary available."}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-700 flex flex-wrap justify-between items-center gap-2">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {paper?.published ? formatDate(paper.published) : "Unknown date"}
        </span>
        <Button
          asChild
          variant="outline"
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-xs px-3 py-1.5"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            View on ArXiv <ArrowUpRight className="w-3 h-3 ml-1.5" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- Paywall Card Component ---
// Added a prop for redirecting to login
function PaywallCard({ onSubscribe, isUserLoggedIn, actionLoading, subscriptionMessage, onLoginRedirect }) {
  // Card displayed to non-subscribed users if more items are available
  return (
    <Card className="flex flex-col items-center justify-center w-full bg-gray-800 border-gray-700 p-6 text-center min-h-[300px] aspect-square">
      <LockKeyhole className="w-16 h-16 text-purple-400 mb-6" />
      <CardTitle className="text-xl font-semibold text-white mb-2">
        Unlock More Trends
      </CardTitle>
      <CardDescription className="text-gray-400 text-sm mb-4">
        {isUserLoggedIn
          ? "Subscribe to get full access to all trending AI projects, models, and papers."
          : "Please log in to subscribe and unlock all trends."}
      </CardDescription>

      {isUserLoggedIn && (
        <Button
          onClick={onSubscribe}
          disabled={actionLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
        >
          {actionLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Unlock className="w-5 h-5 mr-2" />
          )}
          {actionLoading ? "Processing..." : "Subscribe Now"}
        </Button>
      )}
      {!isUserLoggedIn && (
        // Changed to use the onLoginRedirect prop for flexibility
        <Button
          onClick={onLoginRedirect} // Use the prop for redirection
          className="bg-gradient-to-r from-blue-500 to-purple-400 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
        >
          Log In to Subscribe
        </Button>
      )}
      {subscriptionMessage && (
        <p className={`mt-4 text-sm ${subscriptionMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          <AlertCircle className="inline w-4 h-4 mr-1" /> {subscriptionMessage.text}
        </p>
      )}
    </Card>
  );
}


// --- Main Page Component ---
export default function TrendingAIPage() {
  const [repo, setRepos] = useState([]);
  const [repoData, setReposData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("github");
  const [pageLoading, setPageLoading] = useState(true); // For initial page data load
  const [authLoading, setAuthLoading] = useState(true); // For Firebase auth check
  const [actionLoading, setActionLoading] = useState(false); // For subscribe button action

  const fetchTimeoutRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState(null); // {text: string, type: 'success' | 'error'}

  // Effect for Firebase Authentication and Subscription Check
  useEffect(() => {
    // Check if auth and db are initialized from the imported firebase.js
    if (!auth || !db) {
      console.error("Firebase auth or firestore is not initialized. Ensure firebase.js is set up correctly.");
      setAuthLoading(false);
      setPageLoading(false); // Also stop page loading if auth fails to init
      // You might want to display an error message to the user here.
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // User is signed in, now check subscription status
        setAuthLoading(true); // Start loading for subscription check
        try {
          // --- UPDATED SUBSCRIPTION CHECK LOGIC ---
          // Use doc(db, "collectionName", documentId) to get a specific document
          // The document ID for subscribers is the user's UID (as per your Subscribers component)
          const subscriberDocRef = doc(db, "subscribers", user.uid);
          const docSnap = await getDoc(subscriberDocRef); // Fetch the document
          setIsUserSubscribed(docSnap.exists()); // Set true if the document exists

          if (docSnap.exists()) {
            console.log("User is subscribed (checked by UID).");
          } else {
            console.log("User is not subscribed (checked by UID).");
          }
        } catch (error) {
          console.error("Error fetching subscription status:", error);
          setSubscriptionMessage({ text: "Could not check subscription.", type: 'error' });
          setIsUserSubscribed(false); // Assume not subscribed on error
        } finally {
          setAuthLoading(false);
        }
      } else {
        // User is signed out
        setIsUserSubscribed(false);
        setAuthLoading(false);
        console.log("User is signed out.");
      }
    });

    // Handle initial anonymous/custom token sign-in if needed (ensure auth is available)
    const performAuth = async () => {
        // This block depends on how your initial auth token is provided.
        // If you're managing auth purely through login/signup, you might remove this.
        // If __initial_auth_token is provided from a server, ensure it's securely available.
        // For Next.js, often done via getServerSideProps or API routes.
        if (typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
            try {
                await signInWithCustomToken(auth, window.__initial_auth_token);
                console.log("Signed in with custom token.");
            } catch (error) {
                console.error("Error signing in with custom token, trying anonymous:", error);
                await signInAnonymously(auth);
                console.log("Signed in anonymously after custom token failure.");
            }
        } else if (typeof window !== 'undefined') { // Only try anonymous if not SSR and no custom token
            try {
                await signInAnonymously(auth);
                console.log("Signed in anonymously.");
            } catch (error) {
                console.error("Error signing in anonymously:", error);
            }
        }
    };

    // Only perform initial auth if Firebase is configured
    if (auth) { // Check if auth object exists after import
        performAuth();
    }


    return () => unsubscribeAuth();
  }, []); // Runs once on mount

  // Effect to fetch data when selectedCategory changes
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchAndSetData() {
      setPageLoading(true);
      setReposData([]);
      try {
        await fetchAndStoreData(selectedCategory, signal);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error in fetchAndSetData (useEffect):", error);
        }
      }
      // setLoading(false) is handled in fetchAndStoreData
    }

    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => {
      fetchAndSetData();
    }, 200);

    return () => {
      controller.abort();
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [selectedCategory]);

  async function fetchAndStoreData(category, signal) {
    setPageLoading(true);
    try {
      let endpoint = "/api/Githubpages";
      if (category === "huggingface") endpoint = "/api/huggingface";
      else if (category === "arxiv") endpoint = "/api/Arxivpages";

      const res = await fetch(endpoint, { signal });
      if (!res.ok) {
        const errorData = await res.text();
        console.error(`API Error (${res.status}) for ${category}: ${errorData}`);
        throw new Error(`Failed to fetch ${category} data (Status: ${res.status})`);
      }

      const data = await res.json();
      console.log(`Workspaceed new ${category} data:`, data);

      if (!Array.isArray(data)) {
        console.warn(`Data for ${category} is not an array:`, data);
        setRepos([]);
        setReposData([]);
        return;
      }

      setRepos(data);
      setReposData(data);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(`Error fetching ${category} data:`, error);
        setRepos([]);
        setReposData([]);
      }
    } finally {
      setPageLoading(false);
    }
  }

  const handleSubscribe = async () => {
    if (!currentUser) {
      setSubscriptionMessage({ text: "You must be logged in to subscribe.", type: 'error' });
      console.log("User not logged in, cannot subscribe.");
      return;
    }
    if (isUserSubscribed) {
      setSubscriptionMessage({ text: "You are already subscribed.", type: 'info' });
      console.log("User already subscribed.");
      return;
    }

    if (!db) {
      setSubscriptionMessage({ text: "Database service not available.", type: 'error' });
      console.error("Firestore is not initialized.");
      return;
    }

    setActionLoading(true);
    setSubscriptionMessage(null); // Clear previous messages
    try {
      // --- UPDATED SUBSCRIPTION WRITE LOGIC ---
      // Use setDoc with currentUser.uid as the document ID, consistent with Subscribers component
      const subscriberDocRef = doc(db, "subscribers", currentUser.uid);
      await setDoc(subscriberDocRef, {
        userId: currentUser.uid,
        email: currentUser.email || null, // Store email if available
        timestamp: serverTimestamp()
      });
      setIsUserSubscribed(true);
      setSubscriptionMessage({ text: "Successfully subscribed!", type: 'success' });
      console.log("User subscribed successfully:", currentUser.uid);
    } catch (error) {
      console.error("Error subscribing:", error);
      setSubscriptionMessage({ text: "Failed to subscribe. Please try again.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Function to redirect to login page
  const handleLoginRedirect = () => {
    window.location.href = '/Login'; // Adjust this path if your login page is different
  };


  const categoryIcons = {
    github: <Github className="w-4 h-4 mr-2" />,
    huggingface: <Brain className="w-4 h-4 mr-2" />,
    arxiv: <FileText className="w-4 h-4 mr-2" />
  };

  const itemsToDisplay = isUserSubscribed ? repoData : repoData.slice(0, 2);
  const showPaywall = !isUserSubscribed && repoData.length > 2;

  if (authLoading) { // Show a loader while checking auth and subscription status
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center p-4">
        <LoadingAnimation />
        <p className="mt-4 text-gray-400">Checking your access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 md:px-10 lg:px-24 py-8">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 pb-2">
          Weekly AI Trends
        </h1>
        <p className="text-gray-400 text-sm md:text-base lg:text-lg">
          Discover the latest trending AI models, papers, and projects from across the web.
        </p>
        {currentUser && <p className="text-xs text-gray-500 mt-1">Logged in as: {currentUser.email || currentUser.uid} {isUserSubscribed ? "(Subscribed)" : "(Not Subscribed)"}</p>}
      </header>

      <SearchBar repo={repo} setReposData={setReposData} />

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 my-6 md:my-8 bg-gray-900 p-3 rounded-lg shadow-md">
        {["github", "huggingface", "arxiv"].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`
              p-3 rounded-md transition duration-300 flex items-center text-sm md:text-base
              ${selectedCategory === category
                ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700 shadow-lg"
                : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
              }
            `}
            onClick={() => setSelectedCategory(category)}
          >
            {categoryIcons[category]}
            <span className="capitalize">{category}</span>
          </Button>
        ))}
      </div>

      {pageLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingAnimation />
        </div>
      ) : (
        <>
          {repoData.length === 0 && !pageLoading ? (
            <p className="text-center text-gray-400 col-span-full py-10 text-lg">
              No trending {selectedCategory} items found, or your search returned no results.
            </p>
          ) : (
            <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-8">
              {itemsToDisplay.map((item, index) => {
                const key = item.id ? `${selectedCategory}-${item.id}` : `${selectedCategory}-item-${index}`;
                switch (selectedCategory) {
                  case 'github':
                    return <GithubCard key={key} repo={item} />;
                  case 'huggingface':
                    return <HuggingFaceCard key={key} model={item} />;
                  case 'arxiv':
                    return <ArxivCard key={key} paper={item} />;
                  default:
                    return null;
                }
              })}
              {showPaywall && (
                <PaywallCard
                  onSubscribe={handleSubscribe}
                  isUserLoggedIn={!!currentUser}
                  actionLoading={actionLoading}
                  subscriptionMessage={subscriptionMessage}
                  onLoginRedirect={handleLoginRedirect} // Pass the redirect function
                />
              )}
            </main>
          )}
        </>
      )}
    </div>
  );
}