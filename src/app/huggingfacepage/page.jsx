"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Heart,
  Brain,
  ArrowUpRight,
  Zap,
  Clock,
  X,
} from "lucide-react";

// Modal component for summary popup
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-md max-w-lg w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}

// --- Helper Function to Format Numbers ---
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num;
}

// --- Helper Function to Format Dates ---
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// --- Hugging Face Card Component with Summarize ---
function HuggingFaceCard({ model }) {
  const url = `https://huggingface.co/${model.id}`;
  const [modalOpen, setModalOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Function to fetch summary from API
  async function fetchSummary() {
    setLoadingSummary(true);
    setSummaryError(null);

    try {
      // Example API POST request with prompt to your backend
      const prompt = `Summarize this Hugging Face model briefly:\nModel ID: ${model.id}\nAuthor: ${
        model.author || "Unknown"
      }\nTags: ${model.tags ? model.tags.join(", ") : "None"}`;

      const res = await fetch("/api/GetSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Error: ${res.statusText}`);

      const data = await res.json();

      // Assume API returns { summary: "..." }
      setSummary(data.summary || "No summary available.");
    } catch (err) {
      setSummaryError(err.message || "Failed to fetch summary.");
    } finally {
      setLoadingSummary(false);
    }
  }

  // Handle summarize button click
  function handleSummarizeClick() {
    setModalOpen(true);
    fetchSummary();
  }

  return (
    <>
      <Card className="flex flex-col justify-between w-full bg-gray-900 border-gray-700 hover:shadow-lg hover:shadow-teal-600/20 hover:border-teal-600 transition-all duration-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-white leading-tight">
              {model.id}
            </CardTitle>
            <Brain className="text-gray-400 w-5 h-5" />
          </div>
          <CardDescription className="text-gray-500 text-sm">
            By: {model.author || "Unknown"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2 mb-4">
            {model.pipeline_tag && (
              <Badge variant="secondary">{model.pipeline_tag}</Badge>
            )}
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Zap className="w-3 h-3 mr-1" /> Trend Score:{" "}
              {formatNumber(model.trending_score)}
            </Badge>
          </div>
          <div className="mb-3 h-10 overflow-y-auto text-xs">
            {model.tags && model.tags.length > 0 ? (
              model.tags.slice(0, 5).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="mr-1 mb-1"
                >
                  {tag}
                </Badge>
              ))
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
        <CardFooter className="p-4 border-t border-gray-700 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            onClick={handleSummarizeClick}
          >
            Summarize
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              View on Hugging Face <ArrowUpRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </CardFooter>
      </Card>

      {/* Modal Popup */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-xl font-semibold mb-4 text-white">
          Summary for {model.id}
        </h3>
        {loadingSummary && (
          <p className="text-gray-400">Loading summary...</p>
        )}
        {summaryError && (
          <p className="text-red-500">Error: {summaryError}</p>
        )}
        {!loadingSummary && !summaryError && (
          <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>
        )}
      </Modal>
    </>
  );
}

// --- Main Hugging Face Pages Component ---
function HuggingfacePages() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHuggingFaceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/huggingface");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch Hugging Face data (Status: ${response.status})`
          );
        }
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching Hugging Face data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHuggingFaceData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950 text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 lg:p-24">
        <h2 className="text-xl font-semibold mb-4">Trending Hugging Face Models</h2>
        <p className="text-red-500">Error loading Hugging Face models: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 lg:p-24">
      <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-600">
        Trending Hugging Face Models
      </h2>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {models.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">
            No trending Hugging Face models found for this week.
          </p>
        ) : (
          models.map((model) => (
            <HuggingFaceCard key={model.id} model={model} />
          ))
        )}
      </main>
    </div>
  );
}

export default HuggingfacePages;
