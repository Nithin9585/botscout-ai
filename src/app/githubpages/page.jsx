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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Star,
  GitFork,
  Clock,
  Github,
  ArrowUpRight,
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

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

// --- UPDATED Github Card Component ---
function GithubCard({ repo }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch summary from Gemini API
  const fetchSummary = async () => {
    if (summary) return; // Don't refetch if already fetched

    setIsLoading(true);
    setError(null);

    const prompt = `
        Please provide a concise yet informative summary for the following GitHub repository.
        Focus on its main purpose, key features, technology stack (if apparent), and potential use cases or target audience.
        Present the summary in a well-structured, easy-to-read format (e.g., using bullet points or short paragraphs).

        Repository Details:
        - Name: ${repo.name}
        - Description: ${repo.description || "Not provided."}
        - Primary Language: ${repo.language || "Not specified."}
        - Stars: ${formatNumber(repo.stars)}
        - Forks: ${formatNumber(repo.forks)}
        - Trending Score: ${formatNumber(repo.trending_score)}
        - URL: ${repo.url}

        Generate the summary based on this information.
    `;

    try {
      const response = await fetch("/api/GetSummary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Remove any ** from summary to clean up markdown bold symbols
      const cleanedSummary = data.result.replace(/\*\*/g, '');

      setSummary(cleanedSummary);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError(err.message || "An unexpected error occurred while fetching the summary.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="flex flex-col justify-between w-full bg-gray-900 border border-gray-700 hover:shadow-lg hover:shadow-purple-600/20 hover:border-purple-600 transition-all duration-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-white leading-tight">
              {repo.name}
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
            <Badge variant="outline" className="border-green-500 text-green-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Trend Score: {formatNumber(repo.trending_score)}
            </Badge>
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
       <CardFooter className="p-4 border-t border-gray-700 flex justify-between flex-wrap gap-2">
  {/* View on GitHub Button */}
  <Button
    asChild
    variant="outline"
    className="w-full sm:w-auto bg-gray-800 border-gray-600 text-white hover:bg-gray-700 flex justify-center"
  >
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2"
    >
      View on GitHub <ArrowUpRight className="w-4 h-4" />
    </a>
  </Button>

  {/* Summarise Button */}
  <DialogTrigger asChild>
    <Button
      variant="default"
      className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 flex items-center justify-center gap-2"
      onClick={fetchSummary}
    >
      <Sparkles className="w-4 h-4" /> Summarise
    </Button>
  </DialogTrigger>
</CardFooter>

      </Card>

      {/* Dialog Content (Popup) */}
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl bg-gray-900 border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Sparkles className="w-5 h-5 mr-2 text-teal-400" /> AI Summary: {repo.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-2">
            This summary is generated by AI and may not be fully accurate. Always refer to the repository for details.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[200px] max-h-[60vh] overflow-y-auto text-gray-300 bg-gray-800 p-4 rounded-md whitespace-pre-wrap">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
              <p>Generating summary, please wait...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="font-semibold">Error Generating Summary</p>
              <p className="text-sm text-center">{error}</p>
            </div>
          )}
          {!isLoading && !error && summary && (
            <div>{summary}</div>
          )}
          {!isLoading && !error && !summary && (
            <p>Click "Summarise" to generate an overview.</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Github Pages Component ---
function GithubPages() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGithubData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/Githubpages");
        if (!response.ok) {
          throw new Error(`Failed to fetch GitHub data (Status: ${response.status})`);
        }
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching GitHub data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGithubData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950 text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 lg:p-24">
        <h2 className="text-xl font-semibold mb-4">Trending GitHub Repositories</h2>
        <p className="text-red-500">Error loading GitHub repositories: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 lg:p-24">
      <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Trending GitHub Repositories
      </h2>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {repos.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">
            No trending GitHub repositories found for this week.
          </p>
        ) : (
          repos.map((repo) => <GithubCard key={repo.id} repo={repo} />)
        )}
      </main>
    </div>
  );
}

export default GithubPages;
