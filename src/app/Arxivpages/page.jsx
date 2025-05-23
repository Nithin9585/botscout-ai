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
import {
  FileText,
  ArrowUpRight,
  Clock,
  Users,
} from "lucide-react";

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

// --- ArXiv Card Component ---
function ArxivCard({ paper }) {
  // Fix ArXiv URL if it's nested
  const url = paper.url?.includes('http://arxiv.org/abs/http://arxiv.org/abs/')
    ? paper.url.split('http://arxiv.org/abs/').pop()
    : paper.url || `https://arxiv.org/abs/${paper.id?.split("/abs/").pop()}`;

  return (
    <Card className="flex flex-col justify-between w-full bg-gray-900 border-gray-700 hover:shadow-lg hover:shadow-blue-600/20 hover:border-blue-600 transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-white leading-tight">
            {paper?.title?.replace(/\n/g, ' ').trim() || "Untitled"}
          </CardTitle>
          <FileText className="text-gray-400 w-5 h-5" />
        </div>

        {paper?.authors?.length > 0 && (
          <CardDescription className="text-gray-500 text-sm mt-1 flex items-center">
            <Users className="w-3 h-3 mr-1.5" />
            {paper.authors.map(a => a.name).join(', ').slice(0, 50)}...
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-gray-400 text-sm h-24 overflow-hidden text-ellipsis leading-relaxed">
          {paper?.summary?.replace(/\n/g, ' ').trim() || "No summary available."}
        </p>
      </CardContent>

      <CardFooter className="p-4 border-t border-gray-700 flex justify-between items-center">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {paper?.published ? formatDate(paper.published) : "Unknown date"}
        </span>

        <Button
          asChild
          variant="outline"
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          <a href={paper?.link || url} target="_blank" rel="noopener noreferrer">
            View on ArXiv <ArrowUpRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- Main ArXiv Pages Component ---
function ArxivPages() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArxivData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/Arxivpages");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ArXiv data (Status: ${response.status})`
          );
        }
        const data = await response.json();
        setPapers(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching ArXiv data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArxivData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950 text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 lg:p-24">
        <h2 className="text-xl font-semibold mb-4">Trending ArXiv Papers</h2>
        <p className="text-red-500">Error loading ArXiv papers: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 lg:p-24">
      <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
        Trending ArXiv Papers
      </h2>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {papers.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">
            No trending ArXiv papers found for this week.
          </p>
        ) : (
          papers.map((paper) => (
            <ArxivCard key={paper.id || paper.title} paper={paper} />
          ))
        )}
      </main>
    </div>
  );
}

export default ArxivPages;