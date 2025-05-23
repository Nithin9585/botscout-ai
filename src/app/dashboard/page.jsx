// components/Dashboard.js or pages/dashboard.js
"use client";
import React, { useState, useEffect } from 'react';
import Subscribersplans from '@/components/Subscribersplans';
import { auth } from '../../../firebase/firebase';
import { BarChart3, MailCheck, FileText, Github, LibraryBig, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Sample data for trending items (replace with actual fetched data)
const sampleTrendingItems = {
  github: [
    { id: 1, name: "Awesome-AI-Agent", source: "GitHub", stars: "15k", url: "#" },
    { id: 2, name: "OpenDevin", source: "GitHub", stars: "12k", url: "#" },
  ],
  arxiv: [
    { id: 3, name: "Generative Pre-trained Transformer 5: Scaling Laws", source: "ArXiv", citations: 200, url: "#" },
  ],
  huggingface: [
    { id: 4, name: "Meta-Llama-3-70B-Instruct", source: "Hugging Face", downloads: "500k", url: "#" },
  ]
};

const subscribedPlanDetails = {
  name: "Innovator",
  sources: ["GitHub", "ArXiv"],
  nextUpdate: "May 28, 2025",
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false); // Simulate subscription status
  const [currentPlan, setCurrentPlan] = useState(null); // Simulate current plan

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        // In a real app, fetch subscription status from your backend here
        // For demo:
        // setIsSubscribed(true);
        // setCurrentPlan(subscribedPlanDetails);
      } else {
        setUser(null);
        setIsSubscribed(false);
        setCurrentPlan(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Simulate subscribing
  const handleSubscriptionSuccess = (planName) => {
    setIsSubscribed(true);
    const chosenPlan = plansDataForDashboard.find(p => p.name === planName) || { name: planName, sources: ["Selected Source(s)"], nextUpdate: "Next Tuesday"};
    setCurrentPlan(chosenPlan);
    // You'd also update this in your backend
  };

  const plansDataForDashboard = [ // simplified data for dashboard display after subscription
    { name: "Explorer", sources: ["One Platform"], nextUpdate: "Next Tuesday" },
    { name: "Innovator", sources: ["GitHub", "ArXiv"], nextUpdate: "Next Tuesday" },
    { name: "Visionary", sources: ["GitHub", "ArXiv", "Hugging Face"], nextUpdate: "Next Tuesday" },
    { name: "AI Pro", sources: ["All + Summaries & Insights"], nextUpdate: "Next Tuesday" },
  ];


  const renderSourceIcon = (sourceName) => {
    if (sourceName === "GitHub") return <Github size={18} className="mr-2 text-slate-400" />;
    if (sourceName === "ArXiv") return <FileText size={18} className="mr-2 text-slate-400" />;
    if (sourceName === "Hugging Face") return <LibraryBig size={18} className="mr-2 text-slate-400" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#261E35] text-white p-4 sm:p-6 md:p-8 md:ml-20"> {/* Adjust ml-20 if sidebar width changes */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">
          {user ? `Welcome, ${user.displayName || user.email}!` : "AI Trends Dashboard"}
        </h1>
        {!isSubscribed && (
          <p className="text-slate-300 mt-1">
            Subscribe to get weekly AI model and paper updates delivered to your inbox.
          </p>
        )}
      </header>

      {isSubscribed && currentPlan ? (
        // SUBSCRIBED VIEW
        <div className="space-y-8">
          <div className="bg-[#2E2B3F] p-6 rounded-lg shadow-xl">
            <div className="flex items-center mb-4">
              <MailCheck size={28} className="text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-slate-100">Subscription Active: {currentPlan.name}</h2>
            </div>
            <p className="text-slate-300">You're all set to receive weekly updates!</p>
            <div className="mt-4 space-y-2">
              <p className="text-slate-300"><strong>Platforms Covered:</strong> {Array.isArray(currentPlan.sources) ? currentPlan.sources.join(', ') : currentPlan.sources}</p>
              <p className="text-slate-300"><strong>Next Digest:</strong> {currentPlan.nextUpdate}</p>
            </div>
            <Button className="mt-6 bg-purple-600 hover:bg-purple-700" onClick={() => { setIsSubscribed(false); setCurrentPlan(null); /* In real app, navigate to manage subscription page */ }}>
              Manage Subscription (Simulate Unsubscribe)
            </Button>
          </div>

          <div className="bg-[#2E2B3F] p-6 rounded-lg shadow-xl">
            <div className="flex items-center mb-4">
              <Sparkles size={24} className="text-yellow-400 mr-3" />
              <h2 className="text-xl font-semibold text-slate-100">This Week's Highlights (Sample)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(sampleTrendingItems).flat().slice(0,3).map(item => ( // Show first 3 items as sample
                <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id} className="block bg-[#372C44] p-4 rounded-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center text-sm text-slate-400 mb-1">
                    {renderSourceIcon(item.source)}
                    {item.source}
                  </div>
                  <h3 className="font-semibold text-slate-100 truncate">{item.name}</h3>
                  <p className="text-xs text-slate-300">
                    {item.stars && `Stars: ${item.stars}`}
                    {item.citations && `Citations: ${item.citations}`}
                    {item.downloads && `Downloads: ${item.downloads}`}
                  </p>
                  <ExternalLink size={14} className="text-purple-400 inline-block ml-1" />
                </a>
              ))}
            </div>
             <p className="text-sm text-slate-400 mt-4">
              Full details are sent to your email. This is just a glimpse!
            </p>
          </div>
        </div>
      ) : (
        // NOT SUBSCRIBED VIEW
        <div>
          <div className="bg-[#2E2B3F] p-6 rounded-lg shadow-xl text-center mb-8">
            <BarChart3 size={48} className="text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">Unlock Your AI Advantage</h2>
            <p className="text-slate-300 mb-6">
              Get curated lists of trending AI models, papers, and tools from GitHub, ArXiv, and Hugging Face, straight to your inbox every week. Choose a plan below to get started!
            </p>
          </div>
          <Subscribersplans onSubscribe={handleSubscriptionSuccess} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;